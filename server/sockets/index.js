const User = require('./User');

module.exports = (io) => {
  // Connection
  io.on('connection', (socket) => {
    // Send online user list
    socket.emit('get online user', User.getOnlineUser());

    let connectedUser = new User(socket.id, false);
    User.users.set(socket.id, connectedUser);

    // Login
    socket.on('login', (fullName) => {
      // Check user
      let isUsing = false;
      User.users.forEach((key) => {
        if (key.fullname == fullName) {
          isUsing = true;
        }
      });
      socket.emit('check user', isUsing);

      // Add User
      if (User.users.has(socket.id) && !isUsing) {
        let currentUser = User.users.get(socket.id);
        currentUser.isLogin = true;
        currentUser.fullname = fullName;
        io.emit('new user', fullName);
      }
    });

    // LoginId
    socket.on('loginId', (Id) => {
      let currentUser = User.users.get(socket.id);

      if (currentUser) {
        currentUser.isLogin = true;
        currentUser.Id = Id;
        io.emit('userId', currentUser.Id);
      }
    });

    // Join private room
    socket.on('joinPrivateRoom', ({ user1, user2 }) => {
      const roomName = createRoomName(user1, user2);
      socket.join(roomName);
      // Optionally, emit an event to inform users about the private room joining
      io.to(roomName).emit('privateRoomJoined', roomName);
    });

    // Send private message
    socket.on('sendPrivateMessage', ({ room, message }) => {
      // Broadcast the message to all users in the private room
      io.to(room).emit('newPrivateMessage', message);
    });

    // Send message to all connected users
    socket.on('send message', (message) => {
      socket.broadcast.emit('new message', message);
    });

    // Disconnect
    socket.on('disconnect', (reason) => {
      // let currentUser = User.users.get(socket.id);
      // if (currentUser.isLogin) {
      //   io.emit('exit user', currentUser.fullname);
      // }

      User.users.delete(socket.id);
      // Send new online user list to all online users
      io.emit('get online user', User.getOnlineUser());
    });
  });
};

function createRoomName(user1, user2) {
  // You can implement a logic to create a unique room name based on user IDs or names
  // For simplicity, let's concatenate the user IDs
  return `privateRoom_${user1}_${user2}`;
}
