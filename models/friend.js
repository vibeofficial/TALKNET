const { Schema, model, default: mongoose } = require('mongoose');

const friendSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  friendId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  status: { type: String, enum: ['pending', 'true'], default: 'pending' }
}, { timestamps: true });

const friendModel = model('friends', friendSchema);

module.exports = friendModel;