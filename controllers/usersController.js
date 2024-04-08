import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";

import User from "../models/User.js";
import Note from "../models/Note.js";

/**
 * @desc    Get all user
 * @route   GET /users
 * @access  Private
 */
export const getAllUser = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password -__v").lean();

  if (!users?.length) {
    return res.status(400).json({ message: "No User Found." });
  }

  res.status(200).json({
    users,
  });
});

/**
 * @desc    Create new user
 * @route   POST /users
 * @access  Private
 */
export const createNewUser = asyncHandler(async (req, res) => {
  const { username, password, roles } = req.body;

  if (!username || !password || !roles || !roles.length) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Check for duplicates
  const duplicate = await User.findOne({ username }).lean().exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate Username found." });
  }

  const hashedPass = await bcrypt.hash(password, 10); // salt rounds

  const userObj = {
    username,
    password: hashedPass,
    roles,
  };

  // Create and store new user to db
  const user = await User.create(userObj);

  if (user) {
    res.status(201).json({
      message: `User ${username} was created.`,
    });
  } else {
    res.status(400).json({
      message: "Invalid User data received.",
    });
  }
});

/**
 * @desc    Update a user
 * @route   PATCH /users
 * @access  Private
 */
export const updateUser = asyncHandler(async (req, res) => {
  const { id, username, roles, active, password } = req.body;

  // Confirm data
  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  ) {
    return res.status(400).json({
      message: "All Fields are required.",
    });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found." });
  }

  // Check for duplicate
  const duplicate = await User.findOne({ username }).lean().exec();

  if (duplicate && duplicate._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate Username found." });
  }

  user.username = username;
  user.roles = roles;
  user.active = active;

  if (password) {
    // hash password
    user.password = await bcrypt.hash(password, 10);
  }

  const updatedUser = await user.save();

  res.status(201).json({
    message: `${updatedUser.username} updated.`,
  });
});

/**
 * @desc    Delete a user
 * @route   DELETE /users
 * @access  Private
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({
      message: "User Id is required.",
    });
  }

  const note = await Note.findOne({ user: id }).lean().exec();

  if (note) {
    return res.status(400).json({
      message: "User has assigned note.",
    });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({
      message: "User not found.",
    });
  }

  const result = await User.deleteOne();

  const reply = `Username ${result.username} with ID ${id} is deleted.`;

  res.status(200).json({
    message: reply,
  });
});
