const express = require('express');
const bodyParser = require('body-parser');
const { Product } = require('./models');
const { Sequelize } = require('./models');

const app = express();
app.use(bodyParser.json());

// POST /products - Add a new product
app.post('/products', async (req, res) => {
    try {
        const { name, price, description, category } = req.body;
        const product = await Product.create({ name, price, description, category });
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ error: 'Invalid data' });
    }
});

// GET /products - Get all products with pagination and search
app.get('/products', async (req, res) => {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    const products = await Product.findAndCountAll({
        where: {
            name: { [Sequelize.Op.like]: `%${search}%` },
            category: { [Sequelize.Op.like]: `%${search}%` }
        },
        limit: parseInt(limit),
        offset: parseInt(offset),
    });

    res.json({ total: products.count, products: products.rows });
});

// GET /products/:id - Get a single product by ID
app.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /products/:id - Update an existing product
app.put('/products/:id', async (req, res) => {
    try {
        const { name, price, description, category } = req.body;
        const product = await Product.findByPk(req.params.id);
        if (product) {
            await product.update({ name, price, description, category });
            res.json(product);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        res.status(400).json({ error: 'Invalid data' });
    }
});

// DELETE /products/:id - Delete a product by ID
app.delete('/products/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (product) {
            await product.destroy();
            res.json({ message: 'Product deleted' });
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
