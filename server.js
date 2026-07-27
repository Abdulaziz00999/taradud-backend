const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const rooms = {};

io.on('connection', (socket) => {
  socket.on('join-frequency', ({ frequency, pin }) => {
    socket.join(frequency);
    if (!rooms[frequency]) {
      rooms[frequency] = { count: 0, pin: pin || null };
    }
    rooms[frequency].count += 1;

    socket.emit('joined', {
      frequency,
      hasPin: !!rooms[frequency].pin,
      userCount: rooms[frequency].count
    });

    io.to(frequency).emit('user-count', rooms[frequency].count);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
