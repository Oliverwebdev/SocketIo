// chat.js

export const registerChatHandlers = (io) => {
    io.on('connection', (socket) => {
      console.log(`Ein Benutzer ist verbunden ${socket.id}`);
  
      socket.emit('your id', socket.id);
  
      socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
      });
  
      socket.on('disconnect', () => {
        console.log('Ein Benutzer hat die Verbindung getrennt');
      });
    });
  };
  