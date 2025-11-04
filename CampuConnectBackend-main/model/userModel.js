const mongoose = require("mongoose");

// Email regex (simple version)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone number regex (10 digits)
const phoneRegex = /^\d{10}$/;

// Password regex (at least 8 chars, 1 uppercase, 1 lowercase, 1 number)
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Name is required"] },

  email: {
    type: String,
    unique: true,
    required: [true, "Email is required"],
    match: [emailRegex, "Please enter a valid email address"]
  },

  password: {
    type: String,
    required: [true, "Password is required"],
    match: [
      passwordRegex,
      "Password must be at least 8 characters long, include 1 uppercase, 1 lowercase, and 1 number"
    ]
  },

  phone: {
    type: String,
    validate: {
      validator: function (v) {
        return !v || phoneRegex.test(v); // optional field
      },
      message: "Phone number must be 10 digits"
    }
  },

  profilePic: { type: String, default: "" },
  bio: { type: String, default: "" },
  branch: { type: String },
  year: { type: String },
  skills: { type: [String], default: [] },

  // Connection system
  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  requestsSent: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  requestsReceived: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],

  userType: { type: String, enum: ["admin", "user"], default: "user" }
}, { timestamps: true });

const userModel = mongoose.model("user", userSchema);
module.exports = userModel;
