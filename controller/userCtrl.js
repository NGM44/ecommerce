const User = require("../models/userModel");

const createUser = async (req, res) => {
  const mail = req.body.email;

  const findUser = await User.findOne({ email: mail });
  if (!findUser) {
    //create new user
    const newUser = await User.create(req.body);
    res.json(newUser);
  } else {
    res.json({ msg: "user already exist", success: false });
    //user already exist
  }
};

module.exports = { createUser };
