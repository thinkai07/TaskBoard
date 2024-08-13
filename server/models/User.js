//user schema
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

module.exports = mongoose.model("User", userSchema);