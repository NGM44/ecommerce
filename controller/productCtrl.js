const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const User = require("../models/userModel");
const validateMongoDbId = require("../utils/validateMongodbid");
const cloudinaryUploadImg = require("../utils/cloudinary");
 const fs = require('fs');


const createProduct = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) req.body.slug = slugify(req.body.title);
    const newProduct = await Product.create(req.body);
    res.json(newProduct);
  } catch (error) {
    throw new Error(error);
  }
});

const getAProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const findProduct = await Product.findById(id);
    res.json(findProduct);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllProduct = asyncHandler(async (req, res) => {
 
  try {
    // filtering
    const queryObj = {...req.query};
    const excludeFields = ["page","sort","limit","fields"];
    excludeFields.forEach(element=> delete queryObj[element])
    let queryStr = JSON.stringify(queryObj);
    queryStr= queryStr.replace(/\b(gte|gt|lte|lt)\b/g,match =>`$${match}`);
   
   let query = Product.find(JSON.parse(queryStr));
    
   //sorting
   if(req.query.sort){
    const sortBy = req.query.sort.split(",").join(" "); 
    query = query.sort(sortBy);
   }
   else{
    query = query.sort("-createdAt");
   }

   //limiting the feilds
   if(req.query.fields){
     const fields = req.query.fields.split(",").join(" "); 
    query = query.select(fields);
   }else{
    query= query.select("--v");
   }

   //pagination
   const page = req.query.page;
   const limit = req.query.limit;
   const skip = (page-1)* limit;
   query= query.skip(skip).limit(limit);
   if(req.query.page){
    const productCount = await Product.countDocuments();
    if(skip>= productCount) throw new Error("page doesn't exist");
   }
   const product = await query;
   // const {brand,color,category}=req.query;
   // const products = await Product.find(queryObj);
  // const products = await Product.where("category").equals(category);
    res.json(product);
  } catch (error) {
    throw new Error(error);
  }
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    if (req.body.title) req.body.slug = slugify(req.body.title);
    const product = await Product.findOneAndUpdate(id, req.body, { new: true });
    res.json(product);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findOneAndDelete(id);
    res.json(product);
  } catch (error) {
    throw new Error(error);
  }
});

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

const rating = asyncHandler(async(req,res)=>{
  const {_id}=req.user;
  const {star,prodId,comment}= req.body;
  try{
  const product = await Product.findById(prodId);
  let alreadyRated = product.ratings.find((userId)=>userId.postedby.toString() == _id.toString() )
if(alreadyRated){
const updateRating = await Product.updateOne(
  {
    ratings:{$elemMatch:alreadyRated},
  },
  {
    $set:{"ratings.$.start":star,
  "ratings.$.comment":comment
  },
  },
  {
    new:true,
  }
)

}else{
const rateproduct = await Product.findByIdAndUpdate(prodId,{
  $push:{
    ratings:{
      star:star,
      comment:comment,
      postedby:_id,
    }
  }
},{
  new:true
});

}

const getAllRatings = await Product.findById(prodId);
let totalRating = getAllRatings.ratings.length;
let ratingSum = getAllRatings.ratings.map((item)=>item.star).reduce((prev,curr)=> prev+curr,0);
let actualRating = Math.round(ratingSum/totalRating);
let finalProduct = await (Product.findByIdAndUpdate(prodId,{
  totalrating:actualRating,
},{
  new:true
}))
res.json(finalProduct)
  }catch(error){
throw new Error(error);
  }

})

const uploadImages= asyncHandler(async(req,res)=>{
  const { id } = req.params;
  validateMongoDbId(id);
  try {
   const uploader = (path)=> cloudinaryUploadImg(path,'images');
   const urls=[];
   const files = req.files;
   for (const file of files){
    const {path}=file;
    console.log(path);
    const newPath = await uploader(path);
    console.log(newPath)
    urls.push(newPath);
      fs.unlinkSync(path);
   }
   
   const findProduct = await Product.findByIdAndUpdate(id,{
    images:urls.map(file=>file),
   },{
    new:true,
   });

   res.json(findProduct);

  } catch (error) {
    throw new Error(error);
  }
});
module.exports = {
  createProduct,
  getAProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  addWishList,
  rating,
  uploadImages
};
