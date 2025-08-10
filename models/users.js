const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true,
    lowercase: true, // store in lowercase for case-insensitive match
    validate: {
      validator: function(v) {
        // allow letters, numbers, underscores, dots, and some special chars but avoid dangerous ones
        return /^[a-z0-9._@!#$%^&*()-+=|[\]\\:'",?/]+$/i.test(v);
      },
      message: props => `${props.value} contains invalid characters`
    }
  },
  email: { type: String, required: true, unique: true, index: true,lowercase: true, trim: true},
  password: { type: String, required: true, minlength: 7},
  role: { type: String, enum: ["admin", "hr", "employee"],  default: "employee" },

  // disable users
  isDisabled: { type: Boolean, default: false },
  disabledAt: { type: Date, default: null },
  disabledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

}, { timestamps: true }); // add timestamps for createdAt and updatedAt

// make username uniqueness truly case-insensitive at the MongoDB level
userSchema.index({ username: 1 }, { unique: true });

module.exports = mongoose.model("Users", userSchema);
