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
    currency: Number,
    items: Object,
  },
});

const UserModel = mongoose.model('User', userSchema);

export default UserModel;