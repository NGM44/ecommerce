const BlogCategory = require("../models/blogCategoryModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbid");

const createBlogCategory = asyncHandler(async(req,res)=>{
try {
    const newBlogCategory = await BlogCategory.create(req.body);
    res.json(newBlogCategory);
} catch (error) {
    throw new Error(error);
}
});

const updateBlogCategory = asyncHandler(async(req,res)=>{
    const {id}= req.params;
    validateMongoDbId(id);
    try {
         const newBlogCategory = await BlogCategory.findByIdAndUpdate(id,req.body,{
            new:true
         });
         res.json(newBlogCategory);
        
    } catch (error) {
         throw new Error(error);
    }
});
const deleteBlogCategory = asyncHandler(async(req,res)=>{
      const {id}= req.params;
    validateMongoDbId(id);
      try {
          const newBlogCategory = await BlogCategory.findByIdAndDelete(id);
         res.json(newBlogCategory);
    } catch (error) {
         throw new Error(error);
    }
});
const getBlogCategory = asyncHandler(async(req,res)=>{
      const {id}= req.params;
    validateMongoDbId(id);
      try {
             const newBlogCategory = await BlogCategory.findById(id);
         res.json(newBlogCategory);
    } catch (error) {
         throw new Error(error);
    }
});
const getAllBlogCategory = asyncHandler(async(req,res)=>{
    
      try {
         const newBlogCategory = await BlogCategory.find();
         res.json(newBlogCategory);
    } catch (error) {
         throw new Error(error);
    }
});


module.exports = {createBlogCategory,getAllBlogCategory,getBlogCategory,deleteBlogCategory,updateBlogCategory};