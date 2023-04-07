const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");

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
   console.log(page,limit,skip);
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

module.exports = {
  createProduct,
  getAProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
};
