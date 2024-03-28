import express from "express";
import mongoose from "mongoose";
import passport from "passport";
import LocalStrategy from "passport-local";
import bcrypt from "bcryptjs";
import session from "express-session";
import bodyParser from "body-parser";i
import dotenv from "dotenv";
dotenv.config();

// Versuch, eine Verbindung zur MongoDB aufzubauen
console.log("Versuche, eine Verbindung zur MongoDB aufzubauen...");

mongoose
  .connect(process.env.MONGO_URI, )
  .then(() => console.log("Erfolgreich mit MongoDB verbunden."))
  .catch((err) => console.error("Fehler bei der Verbindung zu MongoDB:", err));

// Mongoose-Modelle
const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
});
const User = mongoose.model("User", UserSchema);

const MessageSchema = new mongoose.Schema({
  username: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});
const Message = mongoose.model("Message", MessageSchema);

// Passport-Konfiguration
passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false);
      }
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          // Passwörter stimmen überein
          return done(null, user);
        } else {
          // Passwörter stimmen nicht überein
          return done(null, false);
        }
      });
    });
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({ secret: "geheimesWort", resave: false, saveUninitialized: true })
);
app.use(passport.initialize());
app.use(passport.session());

// Routen
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      // Passwort hashen
      const newUser = new User({ username, password: hash });
      newUser
        .save()
        .then((user) => {
          res.redirect("/login");
        })
        .catch((err) => console.log(err));
    });
  });
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

// Nachrichten speichern
app.post("/message", (req, res) => {
  const { username, message } = req.body;
  const newMessage = new Message({ username, message });
  newMessage
    .save()
    .then((message) => {
      res.redirect("/");
    })
    .catch((err) => console.log(err));
});

app.listen(3000, () => {
  console.log("Server läuft auf Port 3000");
});
