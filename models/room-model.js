const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const roomSchema = new Schema(
  {
    name: { type: String },
    description: { type: String },
    photoAddress: { type: String },
    owner: { type: Schema.Types.ObjectId }
  },
  {
    timestamps: true
  }
);

const Room  = mongoose.model('Room', roomSchema);

module.exports = Room;
