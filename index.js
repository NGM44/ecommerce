const express = require("express");
const dotenv = require("dotenv").config();
const dbConnect = require("./config/dbConnect");
const authRouter = require("./routes/authRoute");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const PORT = process.env.PORT || 4000;

const app = express();

dbConnect();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/api/user", authRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, (req, res) => {
  console.log(`server is running at PORT ${PORT}`);
});
