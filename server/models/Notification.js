//notificationschema
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: { type: String, required: true },
  assignedByEmail: {
    type: String,
    required: true,
  },
  cardId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  readStatus: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Notification", NotificationSchema);