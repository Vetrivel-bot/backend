const UserSchema = require("../Model/UserModel");

const mongoose = require("mongoose");

exports.addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity = 1 } = req.body;

    // Validate input
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const user = await UserSchema.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const productIdObj = new mongoose.Types.ObjectId(productId);

    const existingItem = user.cart.find((item) =>
      item.productId?.equals?.(productIdObj)
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cart.push({
        productId: productIdObj,
        quantity,
      });
    }

    await user.save();
    res.status(200).json({
      message: "Product added to cart",
      cart: user.cart,
    });
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    const { productId, userId } = req.body;

    const user = await UserSchema.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.cart = user.cart.filter(
      (item) => item.productId.toString() !== productId
    );

    await user.save();
    res
      .status(200)
      .json({ message: "Item removed from cart", cart: user.cart });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.updateCartQuantity = async (req, res, next) => {
  try {
    const { productId, userId, quantity } = req.body;

    const user = await UserSchema.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const item = user.cart.find(
      (item) => item.productId.toString() === productId
    );
    if (!item) return res.status(404).json({ error: "Item not found in cart" });

    item.quantity = quantity;

    await user.save();
    res.status(200).json({ message: "Cart quantity updated", cart: user.cart });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.fetchCart = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await UserSchema.findById(id).populate("cart.productId");

    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ cart: user.cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
