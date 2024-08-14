//commentschema
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    comment: { type: String, required: true },
    commentBy: { type: String, required: true },
    card: { type: mongoose.Schema.Types.ObjectId, ref: "Card", required: true },
  },
  {
    timestamps: true,
  }
);

<<<<<<< HEAD
module.exports = mongoose.model("Comment", commentSchema);
=======
module.exports = mongoose.model("Comment", commentSchema);
>>>>>>> 8153153255c5360b0a271a54212e5094728a3356
