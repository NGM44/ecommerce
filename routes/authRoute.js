const express = require("express");
const router = express.Router();
const {
  createUser,
  loginUserCtrl,
  loginAdmin,
  getAllUser,
  getUser,
  deleteUser,
  updateUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logout,
  forgotPasswordToken,
  updatePassword,
  resetPassword,
  saveAddress,
  addWishList,
  getWishList
} = require("../controller/userCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

router.get("/getAllUser", getAllUser);
router.get("/getwishlist", authMiddleware, getWishList);
router.get("/refresh",handleRefreshToken);
router.get("/logout",logout);
router.post("/register", createUser);
router.post("/login", loginUserCtrl);
router.post("/admin-login",loginAdmin)
router.put('/password',authMiddleware,updatePassword)
router.post('/forgot-password-token',authMiddleware,forgotPasswordToken)
router.put('/reset-password/:token',resetPassword)
router.delete("/:id", deleteUser);
router.get("/:id", authMiddleware, isAdmin, getUser);
router.put("/edit-user", authMiddleware,isAdmin, updateUser);
router.put("/save-address", authMiddleware, saveAddress);
router.put("/block-user/:id", authMiddleware,isAdmin, blockUser);
router.put("/unblock-user/:id", authMiddleware,isAdmin, unblockUser);
router.put("/wishlist", authMiddleware, addWishList);


module.exports = router;
