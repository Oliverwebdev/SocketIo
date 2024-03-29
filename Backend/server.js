import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";
import passport from "./config/passport-setup.js";
import router from "./routes/routes.js";
import { registerChatHandlers } from "./config/chat.js";
// Importiere registerChatHandlers nicht hier, wenn es zirkuläre Abhängigkeiten gibt

dotenv.config();
connectDB();

const app = express();
const server = createServer(app); // Erstelle den HTTP-Server mit Express
const io = new Server(server); // Verbinde den HTTP-Server mit Socket.io

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(router);

registerChatHandlers(io); // Registriere die Chat-Handler für Socket.io

server.listen(3000, () => {
  console.log("Server läuft auf Port 3000");
});

export { io }; // Exportiere io für die Verwendung in anderen Dateien
