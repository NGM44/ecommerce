const express = require("express");
const router = express.Router();
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const { createBlogCategory,getAllBlogCategory,getBlogCategory,deleteBlogCategory,updateBlogCategory } = require("../controller/blogCategoryCtrl");

router.post("/", authMiddleware, isAdmin, createBlogCategory);
router.get("/:id", authMiddleware, isAdmin, getBlogCategory);
router.get("/", authMiddleware, isAdmin, getAllBlogCategory);
router.put("/:id", authMiddleware, isAdmin, updateBlogCategory);
router.delete("/:id", authMiddleware, isAdmin, deleteBlogCategory);

module.exports = router;
