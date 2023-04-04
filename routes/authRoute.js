const express = require("express");
const router = express.Router();
const {
  createUser,
  loginUserCtrl,
  getAllUser,
  getUser,
  deleteUser,
  updateUser,
} = require("../controller/userCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

router.post("/register", createUser);
router.post("/login", loginUserCtrl);
router.get("/getAllUser", getAllUser);
router.get("/:id", authMiddleware, isAdmin, getUser);
router.delete("/:id", deleteUser);
router.put("/:id", authMiddleware, isAdmin, updateUser);

module.exports = router;
