import mongoose from 'mongoose';

async function connectDB() {
  try {
    console.log('Versuche, eine Verbindung zur MongoDB herzustellen...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Mit der MongoDB erfolgreich verbunden');
  } catch (error) {
    console.error('Verbindungsfehler:', error);
  }
}

export { connectDB };
