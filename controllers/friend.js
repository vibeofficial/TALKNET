const friendModel = require('../models/friend');
const frindModel = require('../models/friend');
const userModel = require('../models/user');


exports.searchUsers = async (req, res) => {
  try {
    const { search } = req.body;
    const users = await userModel.find({ $or: [{ fullname: search }, { username: search }] });
    users.map((e) => e.fullname.split(' ').includes(search) || e.username === search);
    res.status(200).json({ message: 'Searched users', data: users });
  } catch (error) {
    res.status(500).json({ message: `Cannot search user at this moment: ${error.message}` });
  }
};


exports.sendRequest = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    const friend = await userModel.findById(req.params.id);

    if (!user)
      return res.status(404).json({ message: 'Account is logged out' });

    if (!friend)
      return res.status(404).json({ message: 'Friend not found' });

    const friends = await frindModel.findOne({ $and: [{ userId: user._id }, { friendId: friend._id }] });
    if (friends)
      return res.status(400).json({ message: 'Friend added already' });

    const request = new frindModel({
      userId: user._id,
      friendId: friend._id
    });

    await request.save();
    res.status(200).json({
      message: 'Friend request sent succssfully', request, data: {
        fullname: friend.fullname,
        username: friend.username,
        profile: friend.profile
      }
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: `Cannot send friend request at this moment: ${error.message}` });
  }
};


exports.getAllRequests = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    const requests = await friendModel.find({ userId: user._id, status: false })
      .populate('friendId', 'fullname username email profile')
      .sort({ createdAt: -1 });

    if (!user)
      return res.status(404).json({ message: 'Account is logged out' });

    res.status(200).json({ message: 'All friend request', data: requests });
  } catch (error) {
    res.status(500).json({ message: `Cannot get all friend requests at this moment: ${error.message}` });
  }
};


exports.acceptRequest = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    const request = await friendModel.findById(req.params.id)
      .populate('friendId', 'fullname username email profile');

    if (!user)
      return res.status(404).json({ message: 'Account is logged out' });

    if (!request)
      return res.status(404).json({ message: 'Friend request not found' });

    if (request.status === true)
      return res.status(404).json({ message: 'Friend request accepted already' });

    request.status = true;
    await request.save();
    res.status(200).json({ message: 'Friend request accepted successfully' })
  } catch (error) {
    res.status(500).json({ message: `Cannot accept friend request at this moment: ${error.message}` });
  }
};


exports.declineRequest = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    const request = await friendModel.findById(req.params.id)
      .populate('friendId', 'fullname username email profile');

    if (!user)
      return res.status(404).json({ message: 'Account is logged out' });

    if (!request)
      return res.status(404).json({ message: 'Friend request not found' });

    const deletedRequest = await frindModel.findByIdAndDelete(request._id);
    res.status(200).json({ message: 'Friend request decliend' })
  } catch (error) {
    res.status(500).json({ message: `Cannot accept friend request at this moment: ${error.message}` });
  }
};