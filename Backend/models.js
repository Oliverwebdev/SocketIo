// models.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

// User Model
const UserSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', UserSchema);

// Message Model
const MessageSchema = new Schema({
  username: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', MessageSchema);

export { User, Message };
