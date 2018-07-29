# graphql-middleware-sentry

[![CircleCI](https://circleci.com/gh/maticzav/graphql-middleware-sentry.svg?style=shield)](https://circleci.com/gh/maticzav/graphql-middleware-sentry)
[![npm version](https://badge.fury.io/js/graphql-middleware-sentry.svg)](https://badge.fury.io/js/graphql-middleware-sentry)

> GraphQL Middleware plugin for Sentry.

## Usage

> With GraphQL Yoga

```ts
import { GraphQLServer } from 'graphql-yoga'
import { sentry } from 'graphql-middleware-sentry'

const typeDefs = `
  type Query {
    hello: String!
    bug: String!
  }
`

const resolvers = {
  Query: {
    hello: () => `Hey there!`
    bug: () => {
      throw new Error(`Many bugs!`)
    }
  }
}

const sentryMiddleware = sentry({
  dsn: SENTRY_DSN
})

const server = GraphQLServer({
  typeDefs,
  resolvers,
  middlewares: [sentryMiddleware]
})

serve.start(() => `Server running on http://localhost:4000`)
```

## API & Configuration

```ts
export interface Options {
  dsn: string
  config?: ConstructorOptions
  forwardErrors?: boolean
}

function sentry(options: Options): IMiddlewareFunction
```

### Options

| property        | required | description                                                             |
| --------------- | -------- | ----------------------------------------------------------------------- |
| `dsn`           | true     | Your [Sentry DSN](https://docs.sentry.io/quickstart/#configure-the-dsn) |
| `config`        | false    | A config object for Raven                                               |
| `forwardErrors` | false    | Should middleware forward errors to the client or block them.           |

## License

This project is licensed under the [MIT License](LICENSE.md).
