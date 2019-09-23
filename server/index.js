import express from 'express';
// GraphQL
import graphqlHTTP from 'express-graphql';
import { schema } from './data/schema';
// Resolvers
import resolvers from './data/resolvers';

const app = express();

app.get('/', (req, res) => {
    res.send('Ready!');
});

app.use(
    '/graphql',
    graphqlHTTP({
        // Schema que va a utilizar
        schema,
        // utilizar GraphiQL
        graphiql: true
    })
);

app.listen(5000, () => {
    console.log('Server started');
});
