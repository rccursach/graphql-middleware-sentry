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
  dsn: process.env.SENTRY_DSN
  config: {
    environment: process.env.NODE_ENV,
    release: process.env.npm_package_version
  },
  extras: [
    { name:'body', path: 'body'},
    { name:'origin', path: 'request.headers.origin'},
    { name:'user-agent', path: "request.headers['user-agent']"}
  ]
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
  config?: Sentry.NodeOptions
  extras?: Extra[]
  captureReturnedErrors?: boolean
  forwardErrors?: boolean
}

function sentry(options: Options): IMiddlewareFunction
```

### Extra Content

```ts
interface Extra {
  name: string
  path: string // path from ctx
}
```

The `path` is used to get a value from the context object. It uses [lodash.get](https://lodash.com/docs/4.17.11#get) and it should follow its rules.

### Options

| property                | required | description                                                                                                                                                                |
| ----------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dsn`                   | true     | Your [Sentry DSN](https://docs.sentry.io/error-reporting/quickstart/?platform=node#configure-the-sdk)                                                                      |
| `config`                | false    | [Sentry's config object](https://docs.sentry.io/error-reporting/configuration/?platform=node)                                                                              |
| `extras`                | false    | [Extra content](https://docs.sentry.io/enriching-error-data/context/?platform=node#extra-context) to send with the captured error.                                         |
| `captureReturnedErrors` | false    | Capture errors returned from other middlewares, e.g., `graphql-shield` [returns errors](https://github.com/maticzav/graphql-shield#custom-errors) from rules and resolvers |
| `forwardErrors`         | false    | Should middleware forward errors to the client or block them.                                                                                                              |

## License

This project is licensed under the [MIT License](LICENSE.md).
