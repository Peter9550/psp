const fileService = require('./fileService');
let dataFilePath;

const init = (filePath) => {
    dataFilePath = filePath;
};

const findAll = (title) => {
    const products = fileService.readData(dataFilePath);
    if (title) {
        return products.filter(p =>
            p.title.toLowerCase().includes(title.toLowerCase())
        );
    }
    return products;
};

const findOne = (id) => {
    const products = fileService.readData(dataFilePath);
    return products.find(p => p.id === id);
};

const create = (productData) => {
    const products = fileService.readData(dataFilePath);
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProduct = { id: newId, ...productData };
    products.push(newProduct);
    fileService.writeData(dataFilePath, products);
    return newProduct;
};

const update = (id, productData) => {
    const products = fileService.readData(dataFilePath);
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;
    products[index] = { ...products[index], ...productData, id };
    fileService.writeData(dataFilePath, products);
    return products[index];
};

const remove = (id) => {
    const products = fileService.readData(dataFilePath);
    const filtered = products.filter(p => p.id !== id);
    if (filtered.length === products.length) return false;
    fileService.writeData(dataFilePath, filtered);
    return true;
};

module.exports = { init, findAll, findOne, create, update, remove };
