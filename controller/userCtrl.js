const { generateToken } = require("../config/jwtToken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const createUser = asyncHandler(async (req, res) => {
  const mail = req.body.email;

  const findUser = await User.findOne({ email: mail });
  if (!findUser) {
    //create new user
    const newUser = await User.create(req.body);
    res.json(newUser);
  } else {
    throw new Error("User Already Exist");
  }
});

const loginUserCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  const isUserExist = await User.findOne({ email });
  if (isUserExist && (await isUserExist.isPasswordMatched(password))) {
    res.json({
      _id: isUserExist?._id,
      firstname: isUserExist?.firstname,
      lastname: isUserExist?.lastname,
      email: isUserExist.email,
      mobile: isUserExist.mobile,
      token: generateToken(isUserExist?._id),
    });
  } else {
    throw new Error("Invalid Credentials");
  }
});

const getAllUser = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find();
    res.json(getUsers);
  } catch (err) {
    throw new Error(err);
  }
});

const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    const getUser = await User.findById(id);
    res.json(getUser);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    const deleteUser = await User.findByIdAndDelete(id);
    res.json(deleteUser);
  } catch (error) {
    throw new Error(error);
  }
});

const updateUser = asyncHandler(async (req, res) => {
  console.log(req.user);
  const { id } = req.params;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        firstname: req?.body.firstname,
        lastname: req?.body.lastname,
        email: req?.body.email,
        mobile: req?.body.mobile,
      },
      {
        new: true,
      }
    );
    res.json(updatedUser);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createUser,
  loginUserCtrl,
  getAllUser,
  getUser,
  deleteUser,
  updateUser,
};
