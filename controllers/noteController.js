import asyncHandler from "express-async-handler";

import Note from "../models/Note.js";
import User from "../models/User.js";

/**
 * @desc    Get all Notes
 * @route   Get /notes
 * @access  Private
 */
export const getAllNotes = asyncHandler(async (req, res, next) => {
  const notes = await Note.find().lean();

  if (!notes.length) {
    return res.status(400).json({ message: "No Notes found." });
  }

  const notesWithUser = await Promise.all(
    notes.map(async (note) => {
      const user = await User.findById(note.user).lean().exec();
      return { ...note, username: user.username };
    })
  );

  res.status(200).json({
    notesWithUser,
  });
});

/**
 * @desc    Create Note
 * @route   POST /notes
 * @access  Private
 */
export const createNewNote = asyncHandler(async (req, res, next) => {
  // Look for the user.
  const { user, title, text } = req.body;

  if (!user || !title || !text) {
    res.status(400).json({
      message: "All Fields are required.",
    });
  }

  const username = User.findOne({ username: user }).lean().exec();

  if (!username) {
    res.status(400).json({
      message: "User not found.",
    });
  }

  const hasDuplicate = await Note.findOne({ title }).lean().exec();

  if (hasDuplicate) {
    return res.status(409).json({
      message: "Duplicate record found.",
    });
  }

  const noteObj = {
    user,
    title,
    text,
  };

  const note = await Note.create(noteObj);

  if (note) {
    res.status(201).json({
      message: `Note ${title} was created.`,
    });
  } else {
    res.status(400).json({
      message: "Invalid Note Data was sent.",
    });
  }
});

/**
 * @desc    Update Note
 * @route   UPDATE /notes
 * @access  Private
 */
export const updateNote = asyncHandler(async (req, res, next) => {
  const { id, username, title, text, completed } = req.body;

  if (!id || !username || !title || !text || !completed) {
    return res.status(400).json({
      message: "All fields are required.",
    });
  }

  const note = await Note.findById(id).exec();

  if (!note) {
    return res.status(400).json({
      message: "Note not found",
    });
  }

  const hasDuplicate = await Note.findOne({ title }).lean().exec();

  if (hasDuplicate && hasDuplicate?._id.toString() !== id) {
    return res.status(409).json({
      message: "Duplicate note found.",
    });
  }

  note.username = username;
  note.title = title;
  note.text = text;
  note.completed = completed;

  const updatedNote = await note.save();

  res.status(201).json({
    message: `Note ${updatedNote.title} is updated.`,
  });
});

/**
 * @desc    Delete Note
 * @route   Delete /notes
 * @access  Private
 */
export const deleteNote = asyncHandler(async (req, res, next) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({
      message: "Note ID is required.",
    });
  }

  const note = await Note.findById(id).exec();

  if (!note) {
    return res.status(400).json({
      message: "Note not found.",
    });
  }

  const result = await note.deleteOne();

  const reply = `Note ${note.title} with id ${note.id} is deleted.`;

  res.status(200).json({
    message: reply,
  });
});
