const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
mongoose.connect('mongodb+srv://naman:<password>@cluster0.watcwoc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const propertySchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  photo: String,
  video: String,
});

const Property = mongoose.model('Property', propertySchema);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

app.get('/properties', async (req, res) => {
  const properties = await Property.find().sort({ price: 1 });
  res.json(properties);
});

app.post('/properties', upload.fields([{ name: 'photo' }, { name: 'video' }]), async (req, res) => {
  const { name, price, description } = req.body;
  const photo = req.files.photo[0].path;
  const video = req.files.video[0].path;
  const newProperty = new Property({ name, price, description, photo, video });
  await newProperty.save();
  res.json(newProperty);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
