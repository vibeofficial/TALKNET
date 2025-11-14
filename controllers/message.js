const { generateRoomId } = require('../helper/room');
const messageModel = require('../models/message');
const userModel = require('../models/user');


exports.sendMessage = async (req, res) => {
  const io = req.app.get("io");
  const { text } = req.body;
  const { recieverId } = req.params;
  if (!recieverId) return res.status(400).json({ message: "Reciever's id not provided" })
  const sender = await userModel.findById(req.user.id);
  if (!sender) return res.status(404).json({ message: 'Sender not found' });

  const newMessage = await messageModel.create({
    senderId: sender._id,
    recieverId: recieverId,
    text,
    roomId: await generateRoomId(sender._id, recieverId)
  })

  io.to(roomId).emit("message", newMessage);
  res.status(201).json({ message: 'Message created successfully' })
};