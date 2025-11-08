const User = require("../model/userModel");
const mongoose = require('mongoose');
const Message = require("../model/chatModel");

// Register new user
exports.signup = async (req, res) => {
  try {
    await User(req.body).save();
    res.json({ message: "User created", User });
  } catch (error) {
    res.json({ error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Check password
    if (user.password !== password) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Login success
    res.json({ message: "Login success", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};




// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.json({ error: err.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    res.json(user);
  } catch (err) {
    res.json({ error: err.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "User updated", updated });
  } catch (err) {
    res.json({ error: err.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.json({ error: err.message });
  }
};


// Get all users excluding current user, connected users, and pending requests
exports.getFilteredUsers = async (req, res) => {
  const { userId } = req.params;

  try {
    const currentUser = await User.findById(userId);

    if (!currentUser) return res.status(404).json({ error: "User not found" });

    // Collect IDs to exclude
    const excludeIds = [
      currentUser._id,
      ...currentUser.connections,
      ...currentUser.requestsSent
    ];

    // Get all other users excluding these
    const users = await User.find({ _id: { $nin: excludeIds } })
      .select("-password");

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Send connection request
exports.sendRequest = async (req, res) => {
  const { fromId, toId } = req.body;
  try {
    const fromUser = await User.findById(fromId);
    const toUser = await User.findById(toId);
    if (!fromUser || !toUser) return res.json({ error: "Users not found" });

    fromUser.requestsSent.push(toId);
    toUser.requestsReceived.push(fromId);
    await fromUser.save();
    await toUser.save();

    res.json({ message: "Request sent" });
  } catch (err) {
    res.json({ error: err.message });
  }
};

// Accept connection request - CORRECTED VERSION
// Accept connection request
exports.acceptRequest = async (req, res) => {
  const { fromId, toId } = req.body; 
  // fromId → user who SENT the request
  // toId → user who RECEIVED the request (accepting now)

  try {
    const fromUser = await User.findById(fromId);
    const toUser = await User.findById(toId);

    if (!fromUser || !toUser)
      return res.status(404).json({ error: "Users not found" });

    // Check if already connected
    if (
      fromUser.connections.includes(toId) ||
      toUser.connections.includes(fromId)
    ) {
      return res.status(400).json({ error: "Already connected" });
    }

    // ✅ Add each other to connections
    fromUser.connections.push(toId);
    toUser.connections.push(fromId);

    // ✅ Remove from pending request lists
    // Remove `toId` from `fromUser.requestsSent`
    fromUser.requestsSent = fromUser.requestsSent.filter(
      (id) => id.toString() !== toId.toString()
    );

    // Remove `fromId` from `toUser.requestsReceived`
    toUser.requestsReceived = toUser.requestsReceived.filter(
      (id) => id.toString() !== fromId.toString()
    );

    // Save both users
    await fromUser.save();
    await toUser.save();

    res.json({ message: "Connection request accepted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Reject connection request - CORRECTED VERSION
exports.rejectRequest = async (req, res) => {
  const { requestId, userId } = req.body;
  try {
    const requester = await User.findById(requestId);
    const receiver = await User.findById(userId);

    if (!requester || !receiver) return res.status(404).json({ error: "Users not found" });

    // Remove from requests - using toString() for proper comparison
    requester.requestsSent = requester.requestsSent.filter(id => id.toString() !== userId.toString());
    receiver.requestsReceived = receiver.requestsReceived.filter(id => id.toString() !== requestId.toString());

    await requester.save();
    await receiver.save();

    res.json({ message: "Request rejected" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cancel sent request - CORRECTED VERSION
exports.cancelRequest = async (req, res) => {
  const { requestId, userId } = req.body;
  try {
    const requester = await User.findById(userId);
    const receiver = await User.findById(requestId);

    if (!requester || !receiver) return res.status(404).json({ error: "Users not found" });

    // Remove from requests - using toString() for proper comparison
    requester.requestsSent = requester.requestsSent.filter(id => id.toString() !== requestId.toString());
    receiver.requestsReceived = receiver.requestsReceived.filter(id => id.toString() !== userId.toString());

    await requester.save();
    await receiver.save();

    res.json({ message: "Request cancelled" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Additional needed APIs for connection system

// Get received requests for a user
exports.getReceivedRequests = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('requestsReceived', 'name profilePic branch year connections')
      .select('requestsReceived connections');

    if (!user) return res.status(404).json({ error: "User not found" });

    // filter out already connected users
    const filtered = user.requestsReceived.filter(
      (reqUser) => !user.connections.some(conn => conn.toString() === reqUser._id.toString())
    );

    res.json(filtered);
  } catch (err) {
    res.json({ error: err.message });
  }
};


// Get sent requests for a user
exports.getSentRequests = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('requestsSent', 'name profilePic branch year connections')
      .select('requestsSent connections');

    if (!user) return res.status(404).json({ error: "User not found" });

    // filter out already connected users
    const filtered = user.requestsSent.filter(
      (reqUser) => !user.connections.some(conn => conn.toString() === reqUser._id.toString())
    );

    res.json(filtered);
  } catch (err) {
    res.json({ error: err.message });
  }
};


// Reject connection request
exports.rejectRequest = async (req, res) => {
  const { requestId, userId } = req.body;
  try {
    const requester = await User.findById(requestId);
    const receiver = await User.findById(userId);

    if (!requester || !receiver) return res.json({ error: "Users not found" });

    // Remove from requests
    requester.requestsSent = requester.requestsSent.filter(id => id != userId);
    receiver.requestsReceived = receiver.requestsReceived.filter(id => id != requestId);

    await requester.save();
    await receiver.save();

    res.json({ message: "Request rejected" });
  } catch (err) {
    res.json({ error: err.message });
  }
};

// Cancel sent request
exports.cancelRequest = async (req, res) => {
  const { requestId, userId } = req.body;
  try {
    const requester = await User.findById(userId);
    const receiver = await User.findById(requestId);

    if (!requester || !receiver) return res.json({ error: "Users not found" });

    // Remove from requests
    requester.requestsSent = requester.requestsSent.filter(id => id != requestId);
    receiver.requestsReceived = receiver.requestsReceived.filter(id => id != userId);

    await requester.save();
    await receiver.save();

    res.json({ message: "Request cancelled" });
  } catch (err) {
    res.json({ error: err.message });
  }
};

// Get user connections
exports.getConnections = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('connections', 'name profilePic branch year');
    res.json(user.connections || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Chat History
exports.getChatHistory = async (req, res) => {
  try {
    const userId1 = new mongoose.Types.ObjectId(req.params.userId1);
    const userId2 = new mongoose.Types.ObjectId(req.params.userId2);

    const messages = await Message.find({
      $or: [
        { sender: userId1, recipient: userId2 },
        { sender: userId2, recipient: userId1 }
      ]
    })
      .sort({ createdAt: 1 })
      .populate("sender recipient", "name profilePic");

    res.json(messages || []);
  } catch (err) {
    console.error("Error fetching chat history:", err);
    res.status(500).json({ message: err.message });
  }
};