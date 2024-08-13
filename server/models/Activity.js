//activity schema
const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    commentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comment: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

<<<<<<< HEAD
module.exports = mongoose.model("Activity", activitySchema);
=======
module.exports = mongoose.model("Activity", activitySchema);
>>>>>>> e2080dec6c5ef2d42c0feb4e3c203f5c14403dfe
