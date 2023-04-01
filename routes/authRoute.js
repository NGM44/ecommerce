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

router.post("/register", createUser);
router.post("/login", loginUserCtrl);
router.get("/getAllUser", getAllUser);
router.get("/:id", getUser);
router.delete("/:id", deleteUser);
router.put("/:id", updateUser);

module.exports = router;
