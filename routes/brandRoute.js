const express = require("express");
const router = express.Router();
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const { createBrand,getAllBrand,getBrand,deleteBrand,updateBrand } = require("../controller/brandCtrl");

router.post("/", authMiddleware, isAdmin, createBrand);
router.get("/:id", authMiddleware, isAdmin, getBrand);
router.get("/", authMiddleware, isAdmin, getAllBrand);
router.put("/:id", authMiddleware, isAdmin, updateBrand);
router.delete("/:id", authMiddleware, isAdmin, deleteBrand);

module.exports = router;
