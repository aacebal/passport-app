const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: { type: String },
    username: { type: String },
    encryptedPassword: { type: String }
  },

  {
    //adds createsAt & updatedAt
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
