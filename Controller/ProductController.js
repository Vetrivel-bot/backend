const ProductSchema = require("../model/ProductModel");
const { default: mongoose } = require("mongoose");

exports.AddProducts = async (req, res, next) => {
  const { title, price, description, image, tags, badge, category } = req.body;
  try {
    const products = await ProductSchema.create({
      title,
      price,
      description,
      category,
      image,
      tags: Array.isArray(tags) && tags.length > 0 ? tags : ["new"],
      badge,
    });
    res.status(201).json({ message: "Product Added", products });
  } catch (err) {
    res.status(500).json({ message: "Error ", error: err.message });
  }
};

exports.FetchProducts = async (req, res, next) => {
  try {
    const products = await ProductSchema.find({});
    res.status(201).json(products);
  } catch (err) {
    res.status(500).json({ message: "Error ", error: err.message });
  }
};

exports.DeleteProducts = async (req, res, next) => {
  try {
    const deleteData = await ProductSchema.findByIdAndDelete(req.params.id);
    if (!deleteData)
      return res
        .status(403)
        .json({ message: "Product Not deleted", deleteData });

    res.status(200).json({ message: "Product deleted", deleteData });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting product", error: error.message });
  }
};

exports.UpdateProducts = async (req, res, next) => {
  try {
    // Process tags before updating
    const updateData = {
      ...req.body,
      tags:
        Array.isArray(req.body.tags) && req.body.tags.length > 0
          ? req.body.tags
          : ["new"],
    };

    // Find and update the product
    const oldProduct = await ProductSchema.findById(req.params.id);
    if (!oldProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Preserve original data for response
    const originalData = { ...oldProduct._doc };

    // Update the product
    Object.assign(oldProduct, updateData);
    const updatedProduct = await oldProduct.save();

    res.status(200).json({
      message: "Product updated successfully",
      oldData: originalData,
      newData: updatedProduct,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error updating product",
      error: err.message,
    });
  }
};

exports.FetchByIdentity = async (req, res, next) => {
  try {
    const { category, tags, excludeId } = req.body;
    let query = {};

    // Validate request body
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({ error: "Invalid request body" });
    }

    // Case-insensitive category search with validation
    if (category && typeof category === "string") {
      query.category = {
        $regex: new RegExp(
          `^${category.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}$`,
          "i"
        ),
      };
    }

    // Case-insensitive tag search with array validation
    if (tags && Array.isArray(tags) && tags.length > 0) {
      query.tags = {
        $in: tags
          .filter((tag) => typeof tag === "string")
          .map(
            (tag) =>
              new RegExp(
                `^${tag.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}$`,
                "i"
              )
          ),
      };
    }

    // Validate and exclude current product
    if (excludeId && mongoose.isValidObjectId(excludeId)) {
      query._id = {
        $ne: new mongoose.Types.ObjectId(excludeId),
      };
    }

    const products = await ProductSchema.find(query);
    res.status(200).json(products);
  } catch (error) {
    console.error("Error in FetchByIdentity:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.FetchById = async (req, res, next) => {
  try {
    const products = await ProductSchema.findById(req.params.id);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.FetchByIds = async (req, res, next) => {
  try {
    const { ids } = req.body; // Expecting: { ids: ["id1", "id2", "id3"] }
    if (!Array.isArray(ids)) {
      return res.status(400).json({ error: "ids must be an array" });
    }

    const products = await ProductSchema.find({ _id: { $in: ids } });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Helper function to escape special characters in the search term
const escapeRegex = (string) => {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
};

// Search controller to find products by substring in title, category, or tags
exports.SearchProducts = async (req, res, next) => {
  const searchTerm = req.query.q;
  if (!searchTerm) {
    return res.status(400).json({ message: "Search term is required" });
  }
  const escapedTerm = escapeRegex(searchTerm);
  try {
    const products = await ProductSchema.find({
      $or: [
        { title: { $regex: escapedTerm, $options: "i" } },  // Fixed typo: changed e1scapedTerm to escapedTerm
        { category: { $regex: escapedTerm, $options: "i" } },
        { tags: { $regex: escapedTerm, $options: "i" } },
      ],
    });
    res.status(200).json(products);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error searching products", error: error.message });
  }
};
