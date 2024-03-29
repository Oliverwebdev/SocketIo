//chat.js

import { Message } from "./db.js"; // Pfad anpassen, falls notwendig

export const registerChatHandlers = (io) => {
  const users = {}; // Verwaltet die Socket-ID und Benutzernamen
  const rooms = {}; // Verwaltet die Räume und deren Mitglieder

  io.on("connection", (socket) => {
    console.log(`Ein Benutzer ist verbunden ${socket.id}`);

    socket.emit("your id", socket.id);

    socket.on("register user", (userName) => {
      if (!userName || typeof userName !== "string" || userName.length > 50) {
        socket.emit("registration failed", "Ungültiger Benutzername.");
        return;
      }
      if (Object.values(users).some((user) => user.userName === userName)) {
        socket.emit(
          "registration failed",
          "Dieser Benutzername ist bereits vergeben."
        );
        return;
      }
      users[socket.id] = { userName, online: true };
      io.emit(
        "user list",
        Object.values(users).map((user) => user.userName)
      );
    });

    socket.on("private message", async ({ msg, toUserId }) => {
      if (
        !msg ||
        typeof msg !== "string" ||
        msg.length > 300 ||
        !toUserId ||
        !users[toUserId]
      ) {
        socket.emit(
          "message failed",
          "Nachrichtenübermittlung fehlgeschlagen."
        );
        return;
      }
      try {
        // Erstelle und speichere die Nachricht in der Datenbank
        const message = new Message({
          username: users[socket.id].userName, // Absender
          message: msg,
          // eventuell weitere Felder wie timestamp oder roomId
        });
        await message.save();

        // Sende die Nachricht an den Empfänger
        socket
          .to(toUserId)
          .emit("private message", {
            fromUser: users[socket.id].userName,
            msg,
          });
      } catch (err) {
        console.error("Fehler beim Speichern der Nachricht:", err);
        socket.emit(
          "message failed",
          "Nachricht konnte nicht gespeichert werden."
        );
      }
    });

    socket.on("create room", (roomName) => {
      if (!roomName || typeof roomName !== "string" || roomName.length > 50) {
        socket.emit("room creation failed", "Ungültiger Raumname.");
        return;
      }
      if (rooms[roomName]) {
        socket.emit("room creation failed", "Raumname ist bereits vergeben.");
        return;
      }
      rooms[roomName] = { name: roomName, members: [socket.id] };
      socket.join(roomName);
      socket.emit("room created", roomName);
    });

    socket.on("join room", (roomName) => {
      if (!rooms[roomName]) {
        socket.emit("join failed", "Raum existiert nicht.");
        return;
      }
      rooms[roomName].members.push(socket.id);
      socket.join(roomName);
      socket.emit("joined room", roomName);
      io.to(roomName).emit("user joined", {
        roomName,
        userName: users[socket.id].userName,
      });
    });

    socket.on("send room message", async ({ msg, roomName }) => {
      if (
        !msg ||
        typeof msg !== "string" ||
        msg.length > 300 ||
        !rooms[roomName]
      ) {
        socket.emit(
          "message failed",
          "Nachrichtenübermittlung fehlgeschlagen."
        );
        return;
      }
      try {
        // Erstelle und speichere die Nachricht in der Datenbank
        const message = new Message({
          username: users[socket.id].userName, // Absender
          message: msg,
          roomName, // Name des Raums, an den die Nachricht gesendet wurde
          // eventuell weitere Felder wie timestamp
        });
        await message.save();

        // Sende die Nachricht an alle Mitglieder im Raum
        io.to(roomName).emit("room message", {
          fromUser: users[socket.id].userName,
          msg,
        });
      } catch (err) {
        console.error("Fehler beim Speichern der Nachricht:", err);
        socket.emit(
          "message failed",
          "Nachricht konnte nicht gespeichert werden."
        );
      }
    });

    socket.on("leave room", (roomName) => {
      if (!rooms[roomName] || !rooms[roomName].members.includes(socket.id)) {
        socket.emit("leave failed", "Fehler beim Verlassen des Raumes.");
        return;
      }
      rooms[roomName].members = rooms[roomName].members.filter(
        (member) => member !== socket.id
      );
      if (rooms[roomName].members.length === 0) {
        delete rooms[roomName];
      }
      socket.leave(roomName);
      socket.emit("left room", roomName);
    });

    socket.on("disconnect", () => {
      delete users[socket.id];
      // Aktualisiere die Benutzerliste bei allen Clients
      io.emit(
        "user list",
        Object.values(users).map((user) => user.userName)
      );
    });
  });
};
