import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Erfolgreich mit MongoDB verbunden.");
  } catch (err) {
    console.error("Fehler bei der Verbindung zu MongoDB:", err);
    process.exit(1); // Beendet den Prozess mit einem Fehler
  }
};

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
});
const User = mongoose.model("User", UserSchema);

const MessageSchema = new mongoose.Schema({
  username: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});
const Message = mongoose.model("Message", MessageSchema);

export { connectDB, User, Message };
