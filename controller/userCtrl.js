const { generateToken } = require("../config/jwtToken");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbid");
const { generateRefreshToken } = require("../config/refreshToken");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {sendEmail} = require('./emailCtrl')
const uniqid = require("uniqid");

const createUser = asyncHandler(async (req, res) => {
  const mail = req.body.email;

  const findUser = await User.findOne({ email: mail });
  if (!findUser) {
    //create new user
    const newUser = await User.create(req.body);
    res.json(newUser);
  } else {
    throw new Error("User Already Exist");
  }
});

const loginUserCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const isUserExist = await User.findOne({ email });
  if (isUserExist && (await isUserExist.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(isUserExist?._id);
    const updateUser = await User.findByIdAndUpdate(isUserExist._id,{
      refreshToken:refreshToken,
    },
    { new: true }
    );
    res.cookie("refreshToken",refreshToken,{
      httpOnly:true,
      maxAge: 72* 24* 60*60*1000,
    });
    res.json({
      _id: isUserExist?._id,
      firstname: isUserExist?.firstname,
      lastname: isUserExist?.lastname,
      email: isUserExist.email,
      mobile: isUserExist.mobile,
      token: generateToken(isUserExist?._id),
      
    });
  } else {
    throw new Error("Invalid Credentials");
  }
});


//admin Login
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const findAdmin = await User.findOne({ email });
  console.log(findAdmin);
  if (findAdmin && findAdmin.role !== 'admin') throw new Error("Not Authorised");
  if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findAdmin?._id);
    const updateUser = await User.findByIdAndUpdate(findAdmin._id,{
      refreshToken:refreshToken,
    },
    { new: true }
    );
    res.cookie("refreshToken",refreshToken,{
      httpOnly:true,
      maxAge: 72* 24* 60*60*1000,
    });
    res.json({
      _id: findAdmin?._id,
      firstname: findAdmin?.firstname,
      lastname: findAdmin?.lastname,
      email: findAdmin.email,
      mobile: findAdmin.mobile,
      token: generateToken(findAdmin?._id),
      
    });
  } else {
    throw new Error("Invalid Credentials");
  }
});


const handleRefreshToken = asyncHandler(async(req,res)=>{
  const cookie = req.cookies;
  if(!cookie) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
 const user = await User.findOne({refreshToken});
 if(!user) throw new Error("no refresh token present in db");
 jwt.verify(refreshToken, process.env.JWT_SECRET,(err,decoded) =>{
 if(err || user.id !== decoded.id)
  throw new Error("Something Wrong with Refresh Token");
 
const accessToken = generateToken(user?._id);
res.json({accessToken})
 })

});


const logout = asyncHandler(async(req,res)=>{

  const cookie = req.cookies;
  if(!cookie) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  const user= await User.findOne({refreshToken});
  if(!user){
    res.clearCookie("refreshToken",{
      httpOnly:true,
      secure:true,
    });
    return res.status(204);
  }
  await User.findOneAndUpdate(refreshToken,{
    refreshToken:"",
  },{new:true});
 res.clearCookie("refreshToken",{
      httpOnly:true,
      secure:true,
    });
      return res.sendStatus(204);
})

const getAllUser = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find();
    res.json(getUsers);
  } catch (err) {
    throw new Error(err);
  }
});

const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
 validateMongoDbId(id);
  try {
    const getUser = await User.findById(id);
    res.json(getUser);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
 validateMongoDbId(id);
  try {
    const deleteUser = await User.findByIdAndDelete(id);
    res.json(deleteUser);
  } catch (error) {
    throw new Error(error);
  }
});

const updateUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        firstname: req?.body.firstname,
        lastname: req?.body.lastname,
        email: req?.body.email,
        mobile: req?.body.mobile,
      },
      {
        new: true,
      }
    );
    res.json(updatedUser);
  } catch (error) {
    throw new Error(error);
  }
});

const  blockUser = asyncHandler(async(req,res)=>{
  const { id } = req.params;
 validateMongoDbId(id);
  try {
    const block = await User.findByIdAndUpdate(id,{
      isBlocked:true,
    },{
      new:true,
    }
    );
    res.json({
      message:"user blocked"
    })
  
  } catch (error) {
    throw new Error(error);
  }
});
const unblockUser = asyncHandler(async(req,res)=>{
   const {id} = req.params;
 validateMongoDbId(id);
  try {
    const block = await User.findByIdAndUpdate(id,{
      isBlocked:false,
    },{
      new:true,
    }
    );
     res.json({
      message:"user unblocked"
    })
  
  } catch (error) {
    throw new Error(error);
  }
});

const updatePassword = asyncHandler(async(req,res)=>{
  const {_id}=req.user;
  const {password} = req.body;
  validateMongoDbId(_id);


  const user = await User.findById(_id);
  if(password)
  {
    user.password = password;
    const updatedPassword = await user.save();
    res.json(updatedPassword);
  }
  else{
    res.json(user);
  }
})

const forgotPasswordToken = asyncHandler(async(req,res)=>{
  
  const {email} = req.body;
  const user = await User.findOne({email});
  if(!user) throw new Error("User not found with this email");
  try {
    const token = await user.createPasswordResetToken();
    await user.save();
    const resetUrl = `Hi, Please follow this link to reset your password, this link is valid till 10 mins from now. <a href='http://localhost:5000/api/user/reset-password/${token}'>Click Here</a>`
    const data = {
      to:email,
      text:"Hey User",
      subject:"Forgot password Link",
      html:resetUrl,
    }
    sendEmail(data);
  
  } catch (error) {
    throw new Error(error);
  }
})

const resetPassword = asyncHandler((async(req,res)=>{
  const {password} = req.body;
  const {token} = req.params;

  const hashedToken = crypto.createHash('sha256').update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken:hashedToken,
    passwordResetExpires:{$gt:Date.now()}
  })
  if(!user) throw new Error("Token Expired , try again later");

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
await user.save();
res.json(user);
}))

const addWishList = asyncHandler (async(req,res)=>{
  const {_id}= req.user;
  const {prodId} = req.body;
  try {
    const user = await User.findById(_id);
    const alreadyAdded = user.wishList.find((id)=>id.toString() === prodId);
    if(alreadyAdded){
      let user = await User.findByIdAndUpdate(_id,{
        $pull:{wishList:prodId},

      },{new:true})
      res.json(user);
    }
    else{ 
 let user = await User.findByIdAndUpdate(_id,{
        $push:{wishList:prodId},

      },{new:true})
      res.json(user);
    }
  } catch (error) {
    throw new Error(error);
  }

})

const getWishList = asyncHandler (async(req,res)=>{
  const {_id}=req.user;
  try {
    const findUser = await User.findById(_id).populate('wishList');
    res.json(findUser);
    
  } catch (error) {
    throw new Error(error);
  }
})



const saveAddress = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        address: req?.body.address,
      },
      {
        new: true,
      }
    );
    res.json(updatedUser);
  } catch (error) {
    throw new Error(error);
  }
});


const userCart = asyncHandler(async(req,res)=>{

  const {cart} = req.body;
  const {_id}=req.user;
  validateMongoDbId(_id);
  try {
    let products=[]
    const user = await User.findById(_id);
    const alreadyExistCart = await Cart.findOne({orderby:user._id});
    if(alreadyExistCart){
      alreadyExistCart = [];
    }
   for(let i=0;i<cart.length ;i++){
    let object={};
    object.product = cart[i]._id;
    object.count = cart[i].count;
    object.color = cart[i].color;
    let getPrice = await Product.findById(cart[i]._id).select("price").exec();
     object.price = getPrice.price;
     products.push(object);
   }
   let cartTotal = 0;
   for(let i=0;i<products.length ;i++){
    cartTotal += products[i].price *products[i].count;
   }

    let newCart= await new Cart({
      products,
      cartTotal,
      orderby:user?.id,
    }).save();
    res.json(newCart);
    } catch (error) {
    throw new Error(error);
  }
})

const getUserCart = asyncHandler(async(req,res)=>{
  const {_id}= req.user;
  validateMongoDbId(_id);
  try {
    const cart = await Cart.findOne({orderby:_id}).populate("products.product","_id title price");
    res.json(cart);
  } catch (error) {
      throw new Error(error);
  }
})

const emptyUserCart = asyncHandler(async(req,res)=>{
  const {_id}= req.user;
  validateMongoDbId(_id);
  try {
    const cart = await Cart.findOneAndDelete({orderby:_id});
    res.json(cart);
  } catch (error) {
      throw new Error(error);
  }
})

const applyCoupon = asyncHandler(async(req,res)=>{
  const {coupon} = req.body;
    const {_id} = req.user;
  const validCoupon = await Coupon.findOne({name:coupon});
  if(!validCoupon){
   throw new Error("Invalid Valid Coupon");
  }
  
   const user = await User.findOne({_id});
   let {products,cartTotal} = await Cart.findOne({orderby:user._id}).populate("products.product");
   let totalAfterDiscount = (cartTotal - ((cartTotal * validCoupon.discount) /100)).toFixed(2) ;
    await Cart.findOneAndUpdate({orderby:user._id},{totalAfterDiscount},{new:true})
    res.json(totalAfterDiscount);
})


const createOrder = asyncHandler(async(req,res)=>{
  const {COD,couponApplied}= req.body;
   const {_id}= req.user;
  validateMongoDbId(_id);
  
  try {
    if(!COD) throw new Error("Create CashOrder Failed");
     const user =await User.findById(_id);
     let userCart = await Cart.findOne({orderby: user._id});
     let finalAmount = 0;
     if(couponApplied && userCart.totalAfterDiscount){
      finalAmount = userCart.totalAfterDiscount
     }
     else{
      finalAmount = userCart.cartTotal
     }
     let newOrder = await new Order({
      products:userCart.products,
      paymentIntent:{
        id: uniqid(),
        method:"COD",
        amount: finalAmount,
        status: "Cash on Delivery",
        created: Date.now(),
        currency:"usd",
      },
      orderby:user._id,
      orderStatus:"Cash on Delivery"
     }).save();
     let update = userCart.products.map((item)=>{
      return {
        updateOne:{
          filter:{_id: item.product._id},
          update:{$inc:{quantity:-item.count,sold:+item.count}}
        }
      }
     });
     const updated = await Product.bulkWrite(update);
     res.json({message:"success"});
  } catch (error) {
    throw new Error(error); 
  }
 
})

const getOrders = asyncHandler(async(req,res)=>{
    const {_id}= req.user;
  validateMongoDbId(_id);
  try {
    const userOrder =await Order.findOne({orderby:_id}).populate("products.product");
    res.json(userOrder);
    
  } catch (error) {
    throw new Error(error); 
  }
}) 

const getAllOrders = asyncHandler(async(req,res)=>{
    const {_id}= req.user;
  validateMongoDbId(_id);
  try {
    const userOrder =await Order.find().populate("products.product");
    res.json(userOrder);
    
  } catch (error) {
    throw new Error(error); 
  }
}) 

const updateOrderStatus = asyncHandler(async(req,res)=>{
const {status} =req.body;
const {id}= req.params;
validateMongoDbId(id);
try {
  const updatedOrderStatus = await Order.findByIdAndUpdate(id,{
    orderStatus:status,
    paymentIntent:{
      status:status,
    }
  },{
    new:true
  })
  res.json(updatedOrderStatus);
} catch (error) {
  throw new Error(error); 
}

}) 
module.exports = {
  createUser,
  loginUserCtrl,
  getAllUser,
  getUser,
  deleteUser,
  updateUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logout,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  loginAdmin,
  addWishList,
  getWishList,
  saveAddress,
  userCart,
  getUserCart,
  emptyUserCart,
  applyCoupon,
  createOrder,
  getOrders,
  getAllOrders,
  updateOrderStatus
};
