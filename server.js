const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer'); // Middleware for handling multipart/form-data
const upload = multer(); // Initialize multer

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
  imageData: String, // Store image as base64 encoded string
});

const Property = mongoose.model('Property', propertySchema);
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Route to handle property addition with optional image upload
app.post('/properties', upload.single('image'), async (req, res) => {
  try {
    const { name, price, description, link } = req.body;
    let imageData;

    if (req.file) {
      imageData = req.file.buffer.toString('base64'); // Convert image buffer to base64 string
    }

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

app.get('/properties', async (req, res) => {
    try {
      const properties = await Property.find().sort({ price: 1 }); // Sort by price in ascending order
      res.status(200).send(properties);
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
