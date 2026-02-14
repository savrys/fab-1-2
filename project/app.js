const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Начальные данные товаров (с полями: id, название, стоимость)
let products = [
    { id: 1, name: 'Смартфон XYZ Pro', price: 29990 },
    { id: 2, name: 'Ноутбук ABC Air', price: 54990 },
    { id: 3, name: 'Наушники SoundMax', price: 4990 },
    { id: 4, name: 'Планшет Tab Ultra', price: 19990 },
    { id: 5, name: 'Умные часы Watch Pro', price: 8990 }
];

// Middleware
app.use(express.json()); // для парсинга JSON
app.use(express.urlencoded({ extended: true })); // для парсинга данных форм
app.use(express.static('public')); // для статических файлов
app.use(express.static(path.join(__dirname, '/'))); // для доступа к index.html и css

// Собственное middleware для логирования
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Главная страница с карточкой товара (из 1-й части)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// CRUD операции для товаров

// CREATE - Создание нового товара
app.post('/api/products', (req, res) => {
    const { name, price } = req.body;
    
    // Валидация
    if (!name || !price) {
        return res.status(400).json({ error: 'Необходимо указать название и стоимость товара' });
    }
    
    const newProduct = {
        id: Date.now(), // используем timestamp как уникальный id
        name: name,
        price: Number(price)
    };
    
    products.push(newProduct);
    res.status(201).json(newProduct);
});

// READ - Получение всех товаров
app.get('/api/products', (req, res) => {
    res.json(products);
});

// READ - Получение товара по id
app.get('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id == req.params.id);
    
    if (!product) {
        return res.status(404).json({ error: 'Товар не найден' });
    }
    
    res.json(product);
});

// UPDATE - Обновление товара по id
app.put('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id == req.params.id);
    
    if (!product) {
        return res.status(404).json({ error: 'Товар не найден' });
    }
    
    const { name, price } = req.body;
    
    // Обновляем только переданные поля
    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = Number(price);
    
    res.json(product);
});

// UPDATE - Частичное обновление товара по id (PATCH)
app.patch('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id == req.params.id);
    
    if (!product) {
        return res.status(404).json({ error: 'Товар не найден' });
    }
    
    const { name, price } = req.body;
    
    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = Number(price);
    
    res.json(product);
});

// DELETE - Удаление товара по id
app.delete('/api/products/:id', (req, res) => {
    const productIndex = products.findIndex(p => p.id == req.params.id);
    
    if (productIndex === -1) {
        return res.status(404).json({ error: 'Товар не найден' });
    }
    
    products.splice(productIndex, 1);
    res.json({ message: 'Товар успешно удален' });
});

// Дополнительный маршрут для получения статистики
app.get('/api/stats', (req, res) => {
    const stats = {
        totalProducts: products.length,
        averagePrice: products.reduce((acc, p) => acc + p.price, 0) / products.length,
        minPrice: Math.min(...products.map(p => p.price)),
        maxPrice: Math.max(...products.map(p => p.price))
    };
    res.json(stats);
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
    console.log(`API доступно по адресу http://localhost:${port}/api/products`);
});
