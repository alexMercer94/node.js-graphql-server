// #1 Import mongoose
const mongoose = require('mongoose');

// #2 Create a query string to connect to MongoDB server
const DB_URI = 'mongodb://localhost:27017/clients';

mongoose.connect(DB_URI, { useUnifiedTopology: true, useNewUrlParser: true });
mongoose.connection.once('open', () => console.log('Connected to MongoDB instance'));
mongoose.connection.on('error', error => console.error(error));
mongoose.Promise = global.Promise;

// Definir el SCHEMA de clientes
const clientsSchema = new mongoose.Schema({
    name: String,
    surname: String,
    company: String,
    emails: Array,
    age: Number,
    type: String,
    pedidos: Array
});

const Clients = mongoose.model('clients', clientsSchema);

// Products
const productsSchema = new mongoose.Schema({
    name: String,
    price: Number,
    stock: Number
});

const Products = mongoose.model('products', productsSchema);

// Orders
const ordersSchema = new mongoose.Schema({
    order: Array,
    total: Number,
    date: Date,
    client: mongoose.Types.ObjectId,
    state: String
});

const Orders = mongoose.model('orders', ordersSchema);

export { Clients, Products, Orders };
