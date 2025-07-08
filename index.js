require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const env = require("env");
const cookieParser = require("cookie-parser");
const app = express();
const productRoute = require("./Routes/Product");
const cartRoute = require("./Routes/Cart");

const userRoute = require("./Routes/User");
const connectDataBase = require("./Config/connectDataBase");
connectDataBase();
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use("/api", productRoute, userRoute);
app.use("/api/cart", cartRoute);
// Bind to all interfaces, not just localhost
app.listen(process.env.PORT, () => {
  console.log(`Server running at http://0.0.0.0:${process.env.PORT}`);
});
