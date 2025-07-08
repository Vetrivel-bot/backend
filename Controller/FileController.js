const fs = require("fs");
const path = require("path");
const ProductModel = require("../Model/ProductModel");

exports.UpdateUpload= async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const product = await ProductModel.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (req.file) {
      const oldImageFilename = product.image?.split("/").pop(); // handle both filename or full URL
      const oldImagePath = path.join("uploads", oldImageFilename);

      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }

      const newImageUrl = `${req.protocol}://${req.get("host")}/uploads/${
        req.file.filename
      }`;
      updates.image = newImageUrl;
      req.body.image = newImageUrl;
    }

    const updatedProduct = await ProductModel.findByIdAndUpdate(id, updates, {
      new: true,
    });

    req.updatedProduct = updatedProduct;
    next(); // Pass to next middleware if needed
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating product", error: err.message });
  }
};

exports.DeleteUpload = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await ProductModel.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.image) {
      const filename = product.image.split("/").pop();
      const imagePath = path.join("uploads", filename);

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await ProductModel.findByIdAndDelete(id);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting product", error: err.message });
  }
};
exports.UploadImageAndReplaceInJson = (req, res, next) => {
  try {
    if (req.file) {
      const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
      req.body.image = imageUrl;
    }
    next();
  } catch (err) {
    res.status(500).json({ message: "Error processing image", error: err.message });
  }
};
