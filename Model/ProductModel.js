const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true, min: 1 },
    description: { type: String },
    image: { type: String },
    tags: { type: [String] },
    badge: { type: String },
    category: {
      type: String,
      required: true,
      enum: ["mobile", "computer", "drone", "audio", "wearable"], // Add other categories as needed
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Products || mongoose.model("Products", ProductSchema);
