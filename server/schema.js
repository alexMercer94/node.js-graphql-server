import { buildSchema } from 'graphql';

const schema = buildSchema(`
    type Client {
        id: ID
        name: String
        surname: String
        enterprise: String
        emails: [Email]
    }
    type Email {
        email: String
    }
    type Query {
        client: Client
    }
`);

export default schema;
