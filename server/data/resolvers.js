import mongoose from 'mongoose';
import { Clients } from './db';
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
        getClient: ({ id }) => {
            return new Client(id, clientsDB[id]);
        }
    },
    Mutation: {
        createClient: (root, { input }) => {
            const newClient = new Clients({
                name: input.name,
                surname: input.surname,
                company: input.company,
                email: input.email,
                age: input.age,
                type: input.type,
                pedidos: input.pedidos
            });

            newClient.id = newClient._id;
            return new Promise((resolve, object) => {
                newClient.save(error => {
                    if (error) {
                        rejects(error);
                    } else resolve(newClient);
                });
            });
        }
    }
};
