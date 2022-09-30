import { ApolloServer, makeExecutableSchema } from 'apollo-server-express';
import * as dummySchema from '../helpers/dummy.gqlmodule';
import { sentry as sentryMw } from '../../dist/index';
import * as Sentry from '@sentry/node';
import { applyMiddleware } from 'graphql-middleware'
import request from 'supertest';
import express from 'express';

const app = express();

const importedSchema = makeExecutableSchema({
  typeDefs: dummySchema.typeDefs,
  resolvers: dummySchema.resolvers,
});

const spy = jest.fn();

jest
  .spyOn(Sentry, "captureException")
  .mockImplementation((err) => spy(err));

const sentryMiddleware = sentryMw({
  sentryInstance: Sentry,
  captureReturnedErrors: true,
  forwardErrors: true,
});

const schema = applyMiddleware(importedSchema, sentryMiddleware);

const server = new ApolloServer(schema);

server.applyMiddleware({ app });

describe('For a server instance', () => {
  it('graphql middleware will capture exception', async () => {

    const response = await request(app)
    .post('/graphql')
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .send({
      "query": "query dummy_response {\n  dummy_response {\n    id\n    message\n  }\n}",
      "operationName": "dummy_response"
    });

    expect(response.body.errors).toBeDefined();
    expect(response.body.data['dummy_response']).toBe(null);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.lastCall[0] instanceof Error).toBe(true);
    expect(response.statusCode).toEqual(200);

    await server.stop();
  });
});
