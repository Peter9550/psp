const productsService = require('../services/productsService');

const getAllProducts = (req, res) => {
    const { title } = req.query;
    const products = productsService.findAll(title);
    res.json(products);
};

const getProductById = (req, res) => {
    const id = parseInt(req.params.id);
    const product = productsService.findOne(id);
    if (!product) return res.status(404).json({ error: 'Карточка не найдена' });
    res.json(product);
};

const createProduct = (req, res) => {
    const { title, price, src } = req.body;
    if (!title || !price || !src) {
        return res.status(400).json({ error: 'Поля title, price, src обязательны' });
    }
    const newProduct = productsService.create(req.body);
    res.status(201).json(newProduct);
};

const updateProduct = (req, res) => {
    const id = parseInt(req.params.id);
    const updated = productsService.update(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Карточка не найдена' });
    res.json(updated);
};

const deleteProduct = (req, res) => {
    const id = parseInt(req.params.id);
    const success = productsService.remove(id);
    if (!success) return res.status(404).json({ error: 'Карточка не найдена' });
    res.status(204).send();
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
