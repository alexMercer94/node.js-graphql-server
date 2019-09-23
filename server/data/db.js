import mongoose from 'mongoose';

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/clients', { useNewUrlParser: true });

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

export { Clients };
