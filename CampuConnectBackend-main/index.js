// importing
const express = require('express');
const dotenv = require("dotenv");
const UserRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const Message = require('./model/chatModel'); // Make sure you have this model created



// initialize
const app = express();
dotenv.config();
require("./config/connection");

// middleware
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));


// routes
app.use("/api/user", UserRoutes);
app.use("/api/posts", postRoutes);

// Create HTTP server
const server = http.createServer(app);

// Socket.IO setup
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["my-custom-header"],
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Handle user joining their personal room
  socket.on('join', ({ userId }) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  // Handle sending messages
  socket.on('sendMessage', async (message) => {
    try {
      // Save message to database
      const newMessage = new Message({
        sender: message.sender,
        recipient: message.recipient,
        content: message.content,
        timestamp: new Date()
      });

      const savedMessage = await newMessage.save();

      // Emit to both sender and recipient
      io.to(message.sender).emit('message', savedMessage);
      io.to(message.recipient).emit('message', savedMessage);
      
    } catch (err) {
      console.error('Error saving message:', err);
      // Emit error back to sender
      socket.emit('messageError', { error: 'Failed to send message' });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling middleware (should be after all other middleware and routes)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// port setting
const PORT = process.env.PORT || 3006;

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});