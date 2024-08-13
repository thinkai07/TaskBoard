//cardsschema
const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    assignedTo: { type: String },
    status: {
      type: String,
      enum: ["inprogress", "completed", "pending"],
      default: "pending",
    },
    createdDate: { type: Date },
    updatedDate: [{ type: Date }],
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    assignDate: { type: Date },
    dueDate: { type: Date },
    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
    createdBy: String,
    updatedBy: [{ type: String }],
    movedBy: [{ type: String }],
    movedDate: [{ type: Date }],
    deletedBy: String,
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  },
  {
    timestamps: { deletedDate: "deletedDate" },
  }
);

<<<<<<< HEAD
module.exports = mongoose.model("Card", cardSchema);

=======
module.exports = mongoose.model("Card", cardSchema);
>>>>>>> e2080dec6c5ef2d42c0feb4e3c203f5c14403dfe
