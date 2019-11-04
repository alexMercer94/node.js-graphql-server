import express from 'express';
import cors from 'cors';
// GraphQL
import { ApolloServer } from 'apollo-server-express';
import { typeDefs } from './data/schema';
// Resolvers
import { resolvers } from './data/resolvers';

const app = express();
app.use(cors());
const server = new ApolloServer({ typeDefs, resolvers });

server.applyMiddleware({ app });
app.listen({ port: 5002 }, () => {
    console.log(`Server is running on http://localhost:5002${server.graphqlPath}`);
});
