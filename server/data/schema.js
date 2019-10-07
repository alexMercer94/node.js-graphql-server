import { importSchema } from 'graphql-import';

const typeDefs = importSchema('server/data/schema.graphql');

export { typeDefs };
