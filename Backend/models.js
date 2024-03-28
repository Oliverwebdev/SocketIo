// Importieren der benötigten Module
import express from "express";
import passport from "passport";
import LocalStrategy from "passport-local";
import bcrypt from "bcryptjs";
import session from "express-session";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { User, Message, connectDB } from "./models"; // Importiert aus models.js

dotenv.config();

// Verbindung zur Datenbank herstellen
connectDB();

// Passport-Local Strategie für die Authentifizierung
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return done(null, false, { message: 'Benutzer nicht gefunden.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      return done(null, user);
    } else {
      return done(null, false, { message: 'Falsches Passwort.' });
    }
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

// Initialisierung der Express-App
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: "geheimesWort", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Routen
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    let user = await User.findOne({ username });
    if (user) {
      return res.redirect("/register");
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    user = new User({ username, password: hash });
    await user.save();
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.redirect("/register");
  }
});

app.post("/login", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true
}));

app.get("/logout", (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect("/login");
  });
});

app.post("/message", async (req, res) => {
  const { username, message } = req.body;
  try {
    const newMessage = new Message({ username, message });
    await newMessage.save();
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

// Starten des Servers
app.listen(3000, () => {
  console.log("Server läuft auf Port 3000");
});

// Bitte beachten Sie: Die Socket.IO-Logik aus `registerChatHandlers` und die spezifischen Front-End-Seiten (EJS-Vorlagen)
// sind hier nicht inkludiert. Diese müssen entsprechend Ihrer Anwendung und Infrastruktur integriert werden.
