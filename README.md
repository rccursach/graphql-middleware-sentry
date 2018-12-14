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
  config: {
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    release: process.env.npm_package_version
  },
  withScope: (scope, error, context) => {
    scope.setUser({
      id: context.authorization.userId,
    });
    scope.setExtra('body', context.request.body)
    scope.setExtra('origin', context.request.headers.origin)
    scope.setExtra('user-agent', context.request.headers['user-agent'])
  },
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
export interface Options<Context> {
  config: Sentry.NodeOptions
  withScope?: ExceptionScope<Context>
  captureReturnedErrors?: boolean
  forwardErrors?: boolean
}

function sentry<Context>(options: Options<Context>): IMiddlewareFunction
```

### Sentry context

To enrich events sent to Sentry, you can modify the [context](https://docs.sentry.io/enriching-error-data/context/?platform=javascript).
This can be done using the `withScope` configuration option.

The `withScope` option is a function that is called with the current Sentry scope, the error, and the GraphQL Context.

```ts
type ExceptionScope<Context> = (
  scope: Sentry.Scope,
  error: any,
  context: Context,
) => void
```

### Options

| property                | required | description                                                                                                                                                                |
| ----------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `config`                | true     | [Sentry's config object](https://docs.sentry.io/error-reporting/configuration/?platform=node)                                                                              |
| `withScope`             | false    | Function to modify the [Sentry context](https://docs.sentry.io/enriching-error-data/context/?platform=node) to send with the captured error.                               |
| `captureReturnedErrors` | false    | Capture errors returned from other middlewares, e.g., `graphql-shield` [returns errors](https://github.com/maticzav/graphql-shield#custom-errors) from rules and resolvers |
| `forwardErrors`         | false    | Should middleware forward errors to the client or block them.                                                                                                              |

## License

This project is licensed under the [MIT License](LICENSE.md).
