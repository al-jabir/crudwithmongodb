const express = require('express');
const mongoose = require('mongoose');
const PORT = 3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(200).send('Welcome');
});

// create product schema

const prodoctsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  ccreatedAt: { type: Date, default: Date.now },
});

// create product model

const Product = mongoose.model('products', prodoctsSchema);

// connect to database

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/testProductDB');
    console.log(`db is connected`);
  } catch (err) {
    console.log('db is not connected');
    console.log(err.message);
    process.exit(1);
  }
};

// listen for server events

app.listen(PORT, async () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  await connectDB();
});

// get products from db

app.post('/products', async (req, res) => {
  try {
    // get data from request body

    // const title = req.body.title;
    // const price = Number(req.body.price);

    const newProduct = new Product({
      title: req.body.title,
      price: req.body.price,
    });

    const productData = await newProduct.save();
    res.status(201).send({ success: true, message: 'Product saved successfully', productData });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

app.get('/products', async (req, res) => {
  try {
    const price = req.query.price;
    let products;
    if (price) {
      products = await Product.find({ price: { $gt: price } });
    } else {
      products = await Product.find();
    }

    if (products) {
      res.status(200).send({
        success: true,
        message: 'return all products',
        data: products,
      });
    } else {
      res.status(404).send({ message: 'products not found' });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

app.get('/products/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findOne({ _id: req.params.id });
    if (product) {
      res.status(200).send({
        success: true,
        message: 'return single product',
        data: product,
      });
    } else {
      res.status(404).send({ success: false, message: 'products not found' });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

app.delete('/products/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const dproduct = await Product.findByIdAndDelete({ _id: id });
    if (!dproduct) {
      res.status(404).send({ success: false, message: 'product not found' });
    } else {
      res.status(200).send({ success: true, message: 'deleted successfully', data: dproduct });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

app.put('/products/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const uProduct = await Product.findByIdAndUpdate(
      { _id: id },
      { title: req.body.title, price: req.body.price },
      { new: true }
    );
    if (!uProduct) {
      res.status(404).send({ message: 'updated not successfully' });
    } else {
      res.status(200).send({ success: true, message: 'updated successfully', data: uProduct });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// post: /products -> create a new product
// Get: /products -> Return a list of products
// Get: /products/:id -> return a specific product
// put: /products/:id -> update a specific product
// delete: /products/:id -> delete a specific product
