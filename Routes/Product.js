const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const auth = require("../Middleware/auth");
const {
  UploadImageAndReplaceInJson,
  UpdateUpload,
  DeleteUpload,
} = require("../Controller/FileController");
const {
  AddProducts,
  FetchProducts,
  DeleteProducts,
  FetchById,
  UpdateProducts,
  FetchByIdentity,
  FetchByIds,
  SearchProducts,
} = require("../Controller/ProductController");

// Fetch all products
router.route("/products").get(FetchProducts);

// Add product with image upload
router.post(
  "/products/upload",
  upload.single("image"),
  UploadImageAndReplaceInJson,
  AddProducts
);

// Update product with optional image replacement
router.put(
  "/products/update/:id",
  upload.single("image"), // if a new image is being uploaded
  UpdateUpload, // delete old image if it exists and replace URL
  UpdateProducts // then update DB values
);

// Delete product and its image
router.delete("/products/delete/:id", DeleteUpload, DeleteProducts);

// Related products
router.route("/products/related").post(FetchByIdentity);
router.get("/products/:id", FetchById);

router.post("/products", FetchByIds);
router.get("/search", SearchProducts);
module.exports = router;
