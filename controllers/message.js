const { generateRoomId } = require('../helper/room');
const messageModel = require('../models/message');
const userModel = require('../models/user');


exports.sendMessage = async (req, res) => {
  try {
    const sender = await userModel.findById(req.user.id);
    const receiver = await userModel.findById(req.params.recieverId);
    const io = req.app.get("io");
    const { text } = req.body;

    if (!sender) 
      return res.status(404).json({ message: "Sender not found" });
    
    if (!receiver) 
      return res.status(400).json({ message: "Receiver not found" });

    if (!text || text.trim() === "") 
      return res.status(400).json({ message: "Message text cannot be empty" });
    
    const roomId = await generateRoomId(sender._id, receiver._id);

    const newMessage = await messageModel.create({
      senderId: sender._id,
      recieverId: receiver._id,
      text,
      roomId
    });

    io.to(roomId).emit("message", newMessage);
    res.status(201).json({message: "Message created successfully",data: newMessage
    });
  } catch (error) {
    res.status(500).json({ message: `Cannot accept friend request at this moment: ${error.message}`});
  }
};