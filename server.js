const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;
const multer = require('multer');


// Multer configuration for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads'); // Save uploaded images to 'uploads' folder
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname); // Append timestamp to ensure unique filenames
    },
  });
  
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: true,
  sslValidate: true,
});
const propertySchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  link: String,
  image: String,
});

const Property = mongoose.model('Property', propertySchema);

app.get('/properties', async (req, res) => {
  try {
    const properties = await Property.find().sort({ price: 1 });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch properties', error: error.message });
  }
});

app.post('/properties', upload.single('image'), async (req, res) => {
    try {
      const { name, price, description, link } = req.body;
      const imagePath = req.file.path; // Path of the uploaded image
  
      const newProperty = new Property({
        name,
        price,
        description,
        link,
        image: imagePath, // Save image path to database
      });
  
      await newProperty.save();
      res.status(201).send(newProperty);
    } catch (error) {
      console.error('Error adding property:', error);
      res.status(500).send(error);
    }
  });

app.delete('/properties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Property.findByIdAndDelete(id);
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete property', error: error.message });
  }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
