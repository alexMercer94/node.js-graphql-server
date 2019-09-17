import express from 'express';
// GraphQL
import graphqlHTTP from 'express-graphql';
import schema from './schema';

const app = express();

app.get('/', (req, res) => {
    res.send('Ready!');
});

// Resolver
const root = {
    client: () => {
        return {
            id: 21434124123,
            name: 'Marty',
            surname: 'McFly',
            enterprise: 'System Master',
            emails: [{ email: 'email@email.com' }, { email: 'enterprise@email.com' }]
        };
    }
};

app.use(
    '/graphql',
    graphqlHTTP({
        // Schema que va a utilizar
        schema,
        // el resolver se pasa como rootValue
        rootValue: root,
        // utilizar GraphiQL
        graphiql: true
    })
);

app.listen(5000, () => {
    console.log('Server started');
});
