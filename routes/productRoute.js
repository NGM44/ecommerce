const express = require("express");
const {
  createProduct,
  getAProduct,
  updateProduct,
  deleteProduct,
  getAllProduct,
  addWishList,
  rating
} = require("../controller/productCtrl");
const router = express.Router(); 
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

router.post("/create", authMiddleware, isAdmin, createProduct);
router.get("/getaproduct/:id", authMiddleware, isAdmin, getAProduct);
router.get("/getAllProduct", authMiddleware, isAdmin, getAllProduct);
router.put("/updateProduct/:id", authMiddleware, isAdmin, updateProduct);
router.delete("/deleteProduct/:id", authMiddleware, isAdmin, deleteProduct);
router.put("/wishlist", authMiddleware, addWishList);
router.put("/rating", authMiddleware, rating);

module.exports = router;
