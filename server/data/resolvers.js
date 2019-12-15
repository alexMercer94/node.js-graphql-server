import { Clients, Products, Orders, Users } from './db';
import { rejects } from 'assert';
import bcript from 'bcryptjs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const ObjectId = mongoose.Types.ObjectId;

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

// Generate Token
dotenv.config({ path: 'variables.env' });
const createToken = (loginUser, secret, expiresIn) => {
    const { user } = loginUser;

    return jwt.sign({ user }, secret, { expiresIn });
};

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
        getClients: (root, { limit, offset, seller }) => {
            let filtro;
            if (seller) {
                filtro = { seller: new ObjectId(seller) };
            }

            return Clients.find(filtro)
                .limit(limit)
                .skip(offset);
        },
        totalClients: (root, { seller }) => {
            return new Promise((resolve, object) => {
                let filtro;
                if (seller) {
                    filtro = { seller: new ObjectId(seller) };
                }
                Clients.countDocuments(filtro, (error, count) => {
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
        },
        getOrders: (root, { client }) => {
            return new Promise((resolve, object) => {
                Orders.find({ client: client }, (error, order) => {
                    if (error) rejects(error);
                    else resolve(order);
                });
            });
        },
        topClients: root => {
            return new Promise((resolve, object) => {
                Orders.aggregate(
                    [
                        {
                            $match: { state: 'COMPLETADO' }
                        },
                        {
                            $group: {
                                _id: '$client',
                                total: { $sum: '$total' }
                            }
                        },
                        {
                            $lookup: {
                                from: 'clients',
                                localField: '_id',
                                foreignField: '_id',
                                as: 'client'
                            }
                        },
                        {
                            $sort: { total: -1 }
                        },
                        {
                            $limit: 10
                        }
                    ],
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
            });
        },
        getUser: (root, args, { userActual }) => {
            if (!userActual) {
                return null;
            }

            // Obtener el usuario actual del request del JWT verificado
            const user = Users.findOne({ user: userActual.user });
            return user;
        },
        topSellers: root => {
            return new Promise((resolve, object) => {
                Orders.aggregate(
                    [
                        {
                            $match: { state: 'COMPLETADO' }
                        },
                        {
                            $group: {
                                _id: '$seller',
                                total: { $sum: '$total' }
                            }
                        },
                        {
                            $lookup: {
                                from: 'users',
                                localField: '_id',
                                foreignField: '_id',
                                as: 'seller'
                            }
                        },
                        {
                            $sort: { total: -1 }
                        },
                        {
                            $limit: 10
                        }
                    ],
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
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
                pedidos: input.pedidos,
                seller: input.seller
            });

            newClient.id = newClient._id;
            return new Promise((resolve, object) => {
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
                state: 'PENDIENTE',
                seller: input.seller
            });

            newOrder.id = newOrder._id;
            return new Promise((resolve, object) => {
                newOrder.save(error => {
                    if (error) rejects(error);
                    else resolve(newOrder);
                });
            });
        },
        updateState: (root, { input }) => {
            return new Promise((resolve, object) => {
                // Recorre y actualiza la cantidad de productos en base al estado del pedido
                const { state } = input;
                let instruction;
                if (state === 'COMPLETADO') {
                    instruction = '-';
                } else if (state === 'CANCELADO') {
                    instruction = '+';
                }

                input.order.forEach(order => {
                    Products.updateOne(
                        { _id: order.id },
                        { $inc: { stock: `${instruction}${order.amount}` } },
                        function(error) {
                            if (error) return new Error(error);
                        }
                    );
                });

                Orders.findOneAndUpdate({ _id: input.id }, input, { new: true }, error => {
                    if (error) rejects(error);
                    else resolve('Se actualizó correctamente');
                });
            });
        },
        createUser: async (root, { user, name, password, role }) => {
            // Revisar si un usuario ya existe
            const usersExist = await Users.findOne({ user });
            if (usersExist) {
                throw new Error('El usuario ya existe.');
            }

            const newUser = await new Users({
                user,
                name,
                password,
                role
            }).save();

            return 'Usuario creado correctamente.';
        },
        authenticateUser: async (root, { user, password }) => {
            const userName = await Users.findOne({ user });

            if (!userName) {
                throw new Error('El usuario no encontrado.');
            }

            const correctPassword = await bcript.compare(password, userName.password);

            // Si el password es incorrecto
            if (!correctPassword) {
                throw new Error('Password Incorrecto');
            }

            return {
                token: createToken(userName, process.env.SECRET, '1hr')
            };
        }
    }
};
