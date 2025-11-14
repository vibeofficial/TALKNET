exports.generateRoomId = (sender, reciever) => {
  return [sender, reciever].sort().join("_");
};