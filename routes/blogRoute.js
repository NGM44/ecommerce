const express = require("express");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const { createBlog,updateBlog,deleteBlog,getABlog,getAllBlog,likedBlog,dislikedBlog } = require("../controller/blogCtrl");
const router = express.Router();

router.post('/createBlog',authMiddleware,isAdmin,createBlog);
router.put('/updateBlog/:id',authMiddleware,isAdmin,updateBlog);
router.delete('/deleteBlog/:id',authMiddleware,isAdmin,deleteBlog);
router.get('/getBlog/:id',authMiddleware,isAdmin,getABlog);
router.get('/getAllBlog',authMiddleware,isAdmin,getAllBlog);
router.put('/likes',authMiddleware,likedBlog);
router.put('/dislikes',authMiddleware,dislikedBlog);
 
module.exports = router;