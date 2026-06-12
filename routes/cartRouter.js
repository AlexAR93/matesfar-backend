const express = require("express");
const router = express.Router();
const {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  updateQuantity
} = require("../controllers/Cart.controller.js");
const tokenValidator = require("../middlewares/token-validator.js");

router.get("/", tokenValidator, getCart);
router.post("/add", tokenValidator, addToCart);
router.delete("/remove/:productId", tokenValidator, removeFromCart);
router.delete("/clear", tokenValidator,clearCart);
router.put("/update", tokenValidator, updateQuantity);

module.exports = router;
