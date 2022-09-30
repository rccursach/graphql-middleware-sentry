import { ApolloError, gql } from 'apollo-server-express';

export const typeDefs = gql`
  type DummyResponse {
    id: String!
    message: String
  }

  type Query {
    "Get a dummy response"
    dummy_response(id: String): DummyResponse,
  }
`;

export const resolvers = {
  Query: {
    dummy_response: (obj, args, context, info) => {
      // const SomeObj = { value: false };
      // SomeObj.value = !SomeObj.value;
      // if (SomeObj.value) {
        throw new ApolloError('TEST_ERROR');
    //   }
    //   return {
    //     id: "0000-0000-1111",
    //     message: "AAAA-BBBB"
    //   }
    }
  },
};
