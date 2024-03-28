import express from "express";
import mongoose from "mongoose";
import passport from "passport";
import LocalStrategy from "passport-local";
import bcrypt from "bcryptjs";
import session from "express-session";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

console.log("Versuche, eine Verbindung zur MongoDB aufzubauen...");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Erfolgreich mit MongoDB verbunden."))
  .catch((err) => console.error("Fehler bei der Verbindung zu MongoDB:", err));

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true }, // Stellen Sie die Einzigartigkeit sicher
  password: String,
});
const User = mongoose.model("User", UserSchema);

const MessageSchema = new mongoose.Schema({
  username: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});
const Message = mongoose.model("Message", MessageSchema);

passport.use(new LocalStrategy((username, password, done) => {
  User.findOne({ username: username }, (err, user) => {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done(null, false, { message: 'Benutzer nicht gefunden.' }); // Flash-Nachricht hinzugefügt
    }
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return done(err);
      }
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Falsches Passwort.' }); // Flash-Nachricht hinzugefügt
      }
    });
  });
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: "geheimesWort", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    let user = await User.findOne({ username });
    if (user) {
      // Optional: Flash-Nachricht senden, dass Benutzer bereits existiert
      return res.redirect("/register");
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    user = new User({ username, password: hash });
    await user.save();
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    // Optional: Flash-Nachricht senden, dass ein Fehler aufgetreten ist
    res.redirect("/register");
  }
});

app.post("/login", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true, // Stellen Sie sicher, dass connect-flash konfiguriert ist
}));

app.get("/logout", (req, res) => {
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
    console.log(err);
    // Optional: Redirect mit Fehlermeldung
    res.redirect("/");
  }
});

// Korrektur des Render-Aufrufs
app.get("/", (req, res) => {
  res.render("index", { title: "Startseite" });
});

app.get("/login", (req, res) => {
  res.render("login", { title: "Login" });
});

app.listen(3000, () => {
  console.log("Server läuft auf Port 3000");
});
