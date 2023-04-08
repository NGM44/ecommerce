const express = require("express");
const {
  createProduct,
  getAProduct,
  updateProduct,
  deleteProduct,
  getAllProduct,
  addWishList,
  rating,
  uploadImages
} = require("../controller/productCtrl");
const router = express.Router(); 
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const { uploadPhoto, productImgResize } = require("../middlewares/uploadImages");

router.post("/create", authMiddleware, isAdmin, createProduct);
router.put("/upload/:id", authMiddleware, isAdmin, uploadPhoto.array('images',10),productImgResize,uploadImages);
router.get("/getaproduct/:id", authMiddleware, isAdmin, getAProduct);
router.get("/getAllProduct", authMiddleware, isAdmin, getAllProduct);
router.put("/updateProduct/:id", authMiddleware, isAdmin, updateProduct);
router.delete("/deleteProduct/:id", authMiddleware, isAdmin, deleteProduct);
router.put("/rating", authMiddleware, rating);

module.exports = router;
