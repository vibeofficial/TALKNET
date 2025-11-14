const { Schema, model, default: mongoose } = require('mongoose');

const messageSchema = new Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  recieverId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  roomId: { type: String, unique: true, required: true },
  text: { type: String, trim: true, required: true }
}, { timestamps: true });

const messageModel = model('messages', messageSchema);

module.exports = messageModel;