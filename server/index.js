import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dontenv from 'dotenv';
dontenv.config({ path: 'variables.env' });
// GraphQL
import { ApolloServer } from 'apollo-server-express';
import { typeDefs } from './data/schema';
// Resolvers
import { resolvers } from './data/resolvers';

const app = express();
app.use(cors());
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
        // obtener el token del servidor
        const token = req.headers[`authorization`];
        // Verificar token del Front (Client)
        if (token !== 'null') {
            try {
                const userActual = await jwt.verify(token, process.env.SECRET);
                // Se agrega el usuario actual al request
                req.userActual = userActual;
                return {
                    userActual
                };
            } catch (error) {
                console.error(error);
            }
        }
    }
});

server.applyMiddleware({ app });
app.listen({ port: 5002 }, () => {
    console.log(`Server is running on http://localhost:5002${server.graphqlPath}`);
});
