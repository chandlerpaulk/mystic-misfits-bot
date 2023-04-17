import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

// Connect to MongoDB
const DB_URI = process.env.DB_URI || 'mongodb://localhost:27017/bot-db'
mongoose.connect(DB_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define the user schema and model
const userSchema = new mongoose.Schema({
  userId: String,
  inventory: {
    health: { type: Number, default: 100 },
    stamina: { type: Number, default: 100 },
    level: { type: Number, default: 1 },
    experience: { type: Number, default: 0 },
    currency: { type: Number, default: 0 },
    items: { type: Map, of: Number, default: {} },
  },
});

const UserModel = mongoose.model('User', userSchema);

export default UserModel;