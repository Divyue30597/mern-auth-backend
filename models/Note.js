import mongoose from "mongoose";
import mongooseSequence from "mongoose-sequence";

const AutoIncrement = mongooseSequence(mongoose);

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: [
        true,
        "Note should be assigned to a User. Please select a User.",
      ],
      ref: "User",
    },
    title: {
      type: String,
      required: [true, "Title should not be empty."],
    },
    text: {
      type: String,
      required: [true, "Text cannot be empty."],
      maxLength: 500,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

noteSchema.plugin(AutoIncrement, {
  inc_field: "ticket",
  id: "ticketNums",
  start_seq: 500,
});

const model = mongoose.model("Note", noteSchema);

export default model;
