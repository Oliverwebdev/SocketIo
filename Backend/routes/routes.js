// router.js
import express from "express";
import passport from "../config/passport-setup.js";
import { User, Message } from "../config/db.js";
import bcrypt from "bcryptjs";
// Entfernt: Importe, die nicht direkt verwendet werden, um Klarheit zu schaffen.

const router = express.Router();

// Render the registration page
router.get("/register", (req, res) => {
  // Keine zusätzlichen Daten werden hier übergeben, aber du könntest z.B. Fehlermeldungen oder Formularwerte übergeben, falls nötig.
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
    // Leitet den Benutzer nach erfolgreicher Registrierung zur Login-Seite um.
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    // Hier könntest du eine angepasste Fehlerseite rendern oder den Benutzer zur Registrierungsseite zurückleiten mit einer Fehlermeldung.
    res.status(500).send("Error registering new user.");
  }
});

// Render the login page
router.get("/login", (req, res) => {
  // Ähnlich wie bei der Registrierungsseite könnten hier Fehlermeldungen oder andere relevante Daten übergeben werden.
  res.render("login");
});

// Handle login
router.post("/login", passport.authenticate("local", {
  successRedirect: "/", // Bei Erfolg zur Startseite umleiten
  failureRedirect: "/login", // Bei Misserfolg zurück zur Login-Seite
  failureFlash: true // Aktiviert Flash-Nachrichten für Fehlermeldungen
}));

// Logout
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

// Save message
router.post("/message", async (req, res) => {
  const { username, message } = req.body;
  try {
    const newMessage = new Message({ username, message });
    await newMessage.save();
    // Hier könntest du eine Bestätigungsseite rendern oder einfach zur Startseite umleiten.
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving message.");
  }
});

// Optionale Startseite
router.get("/", (req, res) => {
  // Beispiel: Ein einfaches Willkommen rendern, könnte aber erweitert werden, um z.B. Nachrichten anzuzeigen.
  res.render("index", { user: req.user });
});

export default router;
