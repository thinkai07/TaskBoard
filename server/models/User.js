<<<<<<< HEAD
//uwser schema
=======
//user schema
>>>>>>> e2080dec6c5ef2d42c0feb4e3c203f5c14403dfe
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: String,
  name: String,
  email: String,
  password: String,
  role: { type: String },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  status: { type: String, default: "UNVERIFY" },
});

<<<<<<< HEAD
module.exports = mongoose.model("User", userSchema);
=======
module.exports = mongoose.model("User", userSchema); 
>>>>>>> e2080dec6c5ef2d42c0feb4e3c203f5c14403dfe
