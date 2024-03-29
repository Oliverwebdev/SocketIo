// import express from "express";
// import http from "http";
// import { Server } from "socket.io";
// import session from "express-session";
// import bodyParser from "body-parser";
// import passport from "passport";
// import "./config/db.js"; // Importieren der Datenbank-Konfigurationsdatei
// import { User, Message } from "./models.js"; // Annahme, dass models.js User- und Message-Modelle enthält
// import setupPassport from "./config/passport-setup.js"; // Passport-Konfiguration in einer separaten Datei

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server);

// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(
//   session({ secret: "geheimesWort", resave: false, saveUninitialized: true })
// );
// app.use(passport.initialize());
// app.use(passport.session());

// setupPassport(passport); // Passport mit Strategie und Serialisierung einrichten

// export { app, server, io };
