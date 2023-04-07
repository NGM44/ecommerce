const { generateToken } = require("../config/jwtToken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbid");
const { generateRefreshToken } = require("../config/refreshToken");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {sendEmail} = require('./emailCtrl')

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
  console.log(user); 
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
 console.log("password",password);
  console.log("token",token);
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
  resetPassword
};
