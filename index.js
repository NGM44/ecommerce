const express = require("express");
const dbConnect = require("./config/dbConnect");
//creating a server
const app = express();
//fetching key from env file
const dotenv = require("dotenv").config();
//declaring the ports
const PORT = process.env.PORT || 4000;
const authRouter = require("./routes/authRoute");
const bodyParser = require("body-parser");
dbConnect();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// app.use("/api/user", authRouter);

// app.use("/api/user/register", (req, res) => {
//   res.send("Hello from register");
// });
app.use("/api/user", authRouter);
app.listen(PORT, (req, res) => {
  console.log(`server is running at PORT ${PORT}`);
});
