import { Clients, Products, Orders } from './db';
import { resolve } from 'url';
import { rejects } from 'assert';

class Client {
    constructor(id, { name, surname, company, email, age, type, pedidos }) {
        this.id = id;
        this.name = name;
        this.surname = surname;
        this.company = company;
        this.email = email;
        this.age = age;
        this.type = type;
        this.pedidos = pedidos;
    }
}

export const resolvers = {
    Query: {
        getClient: (root, { id }) => {
            return new Promise((resolve, object) => {
                Clients.findById(id, (error, client) => {
                    if (error) {
                        rejects(error);
                    } else resolve(client);
                });
            });
        },
        getClients: (root, { limit, offset }) => {
            return Clients.find({})
                .limit(limit)
                .skip(offset);
        },
        totalClients: root => {
            return new Promise((resolve, object) => {
                Clients.countDocuments({}, (error, count) => {
                    if (error) rejects(error);
                    else resolve(count);
                });
            });
        },
        getProducts: (root, { limit, offset, stock }) => {
            let filtro;
            if (stock) {
                filtro = { stock: { $gt: 0 } };
            }
            return Products.find({ filtro })
                .limit(limit)
                .skip(offset);
        },
        getProduct: (root, { id }) => {
            return new Promise((resolve, object) => {
                Products.findById(id, (error, product) => {
                    if (error) rejects(error);
                    else resolve(product);
                });
            });
        },
        totalProducts: root => {
            return new Promise((resolve, object) => {
                Products.countDocuments({}, (error, count) => {
                    if (error) rejects(error);
                    else resolve(count);
                });
            });
        }
    },
    Mutation: {
        createClient: (root, { input }) => {
            const newClient = new Clients({
                name: input.name,
                surname: input.surname,
                company: input.company,
                emails: input.emails,
                age: input.age,
                type: input.type,
                pedidos: input.pedidos
            });

            newClient.id = newClient._id;
            return new Promise((resolve, object) => {
                // Recorrer y actualizar la cantidad de productos
                input.order.forEach(order => {
                    Products.updateOne(
                        { _id: order.id },
                        {
                            $inc: {
                                stock: -order.amount
                            }
                        },
                        function(error) {
                            if (error) return new Error(error);
                        }
                    );
                });
                newClient.save(error => {
                    if (error) {
                        rejects(error);
                    } else resolve(newClient);
                });
            });
        },
        updateClient: (root, { input }) => {
            return new Promise((resolve, object) => {
                Clients.findOneAndUpdate({ _id: input.id }, input, { new: true }, (error, client) => {
                    if (error) {
                        rejects(error);
                    } else resolve(client);
                });
            });
        },
        deleteClient: (root, { id }) => {
            return new Promise((resolve, object) => {
                Clients.findOneAndRemove({ _id: id }, error => {
                    if (error) rejects(error);
                    else resolve('El cliente se eliminó correctamente');
                });
            });
        },
        newProduct: (root, { input }) => {
            const newProduct = new Products({
                name: input.name,
                price: input.price,
                stock: input.stock
            });
            // MongoDB crea ID que se asigna al objeto
            newProduct.id = newProduct._id;

            return new Promise((resolve, object) => {
                newProduct.save(error => {
                    if (error) {
                        rejects(error);
                    } else resolve(newProduct);
                });
            });
        },
        updateProduct: (roo, { input }) => {
            return new Promise((resolve, product) => {
                Products.findOneAndUpdate({ _id: input.id }, input, { new: true }, (error, product) => {
                    if (error) rejects(error);
                    else resolve(product);
                });
            });
        },
        deleteProduct: (root, { id }) => {
            return new Promise((resolve, object) => {
                Products.findOneAndRemove({ _id: id }, error => {
                    if (error) rejects(error);
                    else resolve('El producto se eliminó correctamente');
                });
            });
        },
        newOrder: (root, { input }) => {
            const newOrder = new Orders({
                order: input.order,
                total: input.total,
                date: new Date(),
                client: input.client,
                state: 'PENDIENTE'
            });

            newOrder.id = newOrder._id;
            return new Promise((resolve, object) => {
                newOrder.save(error => {
                    if (error) rejects(error);
                    else resolve(newOrder);
                });
            });
        }
    }
};
