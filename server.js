const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

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

app.post('/properties', async (req, res) => {
  try {
    const { name, price, description, link } = req.body;
    const newProperty = new Property({ name, price, description, link });
    await newProperty.save();
    res.json(newProperty);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add property', error: error.message });
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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
