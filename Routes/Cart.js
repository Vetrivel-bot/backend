const express = require("express");
const router = express.Router();
const cartController = require("../Controller/CartController");

router.post("/add", cartController.addToCart);
router.post("/remove", cartController.removeFromCart);
router.post("/update", cartController.updateCartQuantity);
router.get("/:id", cartController.fetchCart);

module.exports = router;
