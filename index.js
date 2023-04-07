const express = require("express");
const dotenv = require("dotenv").config();
const dbConnect = require("./config/dbConnect");
const authRouter = require("./routes/authRoute");
const productRouter = require("./routes/productRoute");
const blogRouter =require("./routes/blogRoute");
const categoryRouter =require("./routes/categoryRoute");
const blogCategoryRouter =require("./routes/blogCategoryRoute");
const brandRouter =require("./routes/brandRoute");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const PORT = process.env.PORT || 4000;

const app = express();

dbConnect();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use("/api/user", authRouter);
app.use("/api/product", productRouter);
app.use("/api/blog", blogRouter);
app.use("/api/category", categoryRouter);
app.use("/api/blogCategory", blogCategoryRouter);
app.use("/api/brand", brandRouter);


app.use(notFound);
app.use(errorHandler);

app.listen(PORT, (req, res) => {
  console.log(`server is running at PORT ${PORT}`);
});
