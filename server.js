const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer'); // Import multer for handling multipart/form-data
const app = express();

const PORT = process.env.PORT || 5000;

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: true,
  sslValidate: true,
});

// Define schema and model
const propertySchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  link: String,
  imageData: Buffer, // Store image as Buffer (binary data)
});

const Property = mongoose.model('Property', propertySchema);
app.use(cors());

// Multer middleware for handling image uploads
const storage = multer.memoryStorage(); // Use memory storage for handling files as buffers
const upload = multer({ storage: storage });

// Middleware to parse JSON bodies
app.use(express.json());

// Route to handle property addition with image upload
app.post('/properties', upload.single('image'), async (req, res) => {
  try {
    const { name, price, description, link } = req.body;
    const imageData = req.file.buffer; // Image data as Buffer from multer

    const newProperty = new Property({
      name,
      price,
      description,
      link,
      imageData,
    });

    await newProperty.save();
    res.status(201).send(newProperty);
  } catch (error) {
    console.error('Error adding property:', error);
    res.status(500).send(error);
  }
});

// Route to get all properties
app.get('/properties', async (req, res) => {
    try {
      const properties = await Property.find();
      // Convert imageData from Buffer to Base64
      const propertiesWithBase64 = properties.map(property => ({
        ...property.toJSON(),
        imageData: property.imageData.toString('base64')
      }));
      res.status(200).send(propertiesWithBase64);
    } catch (error) {
      console.error('Error fetching properties:', error);
      res.status(500).send(error);
    }
  });

// Route to delete a property
app.delete('/properties/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedProperty = await Property.findByIdAndDelete(id);
    if (!deletedProperty) {
      return res.status(404).send('Property not found');
    }
    res.status(200).send('Property deleted successfully');
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).send(error);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
