//task schema

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    id: String,
    name: String,
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    card: [{ type: mongoose.Schema.Types.ObjectId, ref: "Card" }],
    createdBy: String,
    updatedBy: String,
    movedBy: [{ type: String }],
    deletedBy: String,
    movedDate: [{ type: Date }],
  },
  {
    timestamps: {
      createdAt: "createdDate",
      updatedAt: "updatedDate",
    },
  }
);

<<<<<<< HEAD
module.exports = mongoose.model("Task", taskSchema);


=======
module.exports = mongoose.model("Task", taskSchema);
>>>>>>> e2080dec6c5ef2d42c0feb4e3c203f5c14403dfe
