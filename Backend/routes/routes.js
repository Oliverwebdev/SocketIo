import express from "express";
import passport from "../config/passport-setup.js";
import bcrypt from "bcryptjs";
import { User, Message } from "../config/db.js";

const router = express.Router();

// Render the registration page
router.get("/register", (req, res) => {
  res.render("register");
});

// Handle registration
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  try {
    const newUser = new User({ username, password: hash });
    await newUser.save();
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error registering new user.");
  }
});

// Render the login page
router.get("/login", (req, res) => {
  res.render("login");
});

// Handle login
router.post("/login", passport.authenticate("local", {
  successRedirect: "/", // Bei Erfolg zur Startseite umleiten
  failureRedirect: "/login", // Bei Misserfolg zurück zur Login-Seite
  failureFlash: true // Aktiviert Flash-Nachrichten für Fehlermeldungen
}));

// Logout
router.get('/logout', function(req, res) {
  req.logout(function(err) {
      if (err) {
          console.error(err);
          return res.status(500).send('Ein Fehler ist aufgetreten');
      }
      res.redirect('/'); // Änderung hier: Weiterleitung zur Wurzel, die index.ejs rendert
  });
});

// Save message
router.get("/messages/new", (req, res) => {
  // Render die Seite für das Erstellen einer neuen Nachricht
  // Hier müssen Sie sicherstellen, dass Sie eine entsprechende EJS-Datei haben (z.B. newMessage.ejs im views-Ordner)
  res.render("message");
});

// Optionale Startseite
router.get("/", (req, res) => {
  res.render("login", { user: req.user });
});

export default router;
