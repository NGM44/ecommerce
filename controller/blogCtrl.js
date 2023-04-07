const Blog = require('../models/blogModel');
const User =require('../models/userModel');
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbid");


const createBlog = asyncHandler( async(req,res)=>{
    try {
        const newBlog = await Blog.create(req.body);
        res.json({
            status:"success",
            newBlog,
        })
    } catch (error) {
        throw new Error(error);
    }
})

const updateBlog=asyncHandler(async(req,res)=>{
    const {id}= req.params;
     validateMongoDbId(id);
    try {
        const blog = await Blog.findByIdAndUpdate(id,req.body,{
            new:true,
        });
        res.json(blog);
        
    } catch (error) {
        throw new Error(error);
    }
});





const deleteBlog=asyncHandler(async(req,res)=>{
     const {id}= req.params;
      validateMongoDbId(id);
try {
        const blog = await Blog.findByIdAndDelete(id);
        res.json(blog);
    } catch (error) {
        throw new Error(error);
    }});

const getABlog=asyncHandler(async(req,res)=>{ 
    const {id}= req.params;
     validateMongoDbId(id);
    try {
        const getBlog = await Blog.findById(id).populate("likes").populate("dislikes");
        const updatedBlog =   await Blog.findByIdAndUpdate(id,{
            $inc:{
                numViews:1
            }
        },
        {new:true}
        )
        res.json(getBlog);
         
    } catch (error) {
        throw new Error(error);
    }});
const getAllBlog=asyncHandler(async(req,res)=>{
     const {id}= req.params;
       
    try {
        const blog = await Blog.find();
        res.json(blog);
        
    } catch (error) {
        throw new Error(error);
    }});

const likedBlog = asyncHandler(async(req,res)=>{
    const {blogId}= req.body;
    validateMongoDbId(blogId);
    try {
           const blog =await Blog.findById(blogId);
           const loginUserId = req?.user?._id;
           const isLiked = blog.isLiked;
           const alreadyDisliked = blog?.dislikes?.find((userId)=> userId?.toString() ===loginUserId) ;
           if(alreadyDisliked){
            const blog = await Blog.findByIdAndUpdate(blogId,{
                $pull:{
                    dislikes:loginUserId
                },
                isDisliked:false,
            },{new:true})
             res.json(blog);
           }
            if(isLiked){
            const blog = await Blog.findByIdAndUpdate(blogId,{
                $pull:{
                    likes:loginUserId
                },
                isLiked:false,
            },{new:true})
            res.json(blog);
           } else{
             const blog = await Blog.findByIdAndUpdate(blogId,{
                $push:{
                    likes:loginUserId
                },
                isLiked:true,
            },{new:true});
             res.json(blog);
           }
    } catch (error) {
        
    }
 

});

const dislikedBlog = asyncHandler(async(req,res)=>{
    const {blogId}= req.body;
    validateMongoDbId(blogId);
    try {
           const blog =await Blog.findById(blogId);
           const loginUserId = req?.user?._id;
           const isDisliked = blog.isDisliked;
           const alreadyliked = blog?.likes?.find((userId)=> userId?.toString() ===loginUserId) ;
           if(alreadyliked){
            const blog = await Blog.findByIdAndUpdate(blogId,{
                $pull:{
                    likes:loginUserId
                },
                isliked:false,
            },{new:true})
             res.json(blog);
           }
            if(isDisliked){
            const blog = await Blog.findByIdAndUpdate(blogId,{
                $pull:{
                    dislikes:loginUserId
                },
                isDisliked:false,
            },{new:true})
            res.json(blog);
           } else{
             const blog = await Blog.findByIdAndUpdate(blogId,{
                $push:{
                    dislikes:loginUserId
                },
                isDisliked:true,
            },{new:true});
             res.json(blog);
           }
    } catch (error) {
        
    }
 

});

module.exports ={createBlog,updateBlog,deleteBlog,getABlog,getAllBlog,likedBlog,dislikedBlog};

