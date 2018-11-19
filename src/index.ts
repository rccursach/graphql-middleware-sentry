import * as Sentry from '@sentry/node'
import * as _ from 'lodash'

import { IMiddlewareFunction } from 'graphql-middleware/dist/types'

interface Extra {
  name: string
  path: string
}

// Options for graphql-middleware-sentry
export interface Options {
  dsn: string
  config?: Sentry.NodeOptions
  extras?: Extra[]
  captureReturnedErrors?: boolean
  forwardErrors?: boolean
}

export class SentryError extends Error {
  constructor(...props) {
    super(...props)
  }
}

export const sentry = ({
  dsn,
  config = {},
  extras = [],
  captureReturnedErrors = false,
  forwardErrors = false,
}: Options): IMiddlewareFunction => {
  // Check if Sentry DSN is present
  if (!dsn) {
    throw new SentryError(`Missing dsn parameter in configuration.`)
  }

  // Init Sentry
  Sentry.init({ dsn, ...config })

  // Return middleware resolver
  return async function(resolve, parent, args, ctx, info) {
    try {
      const res = await resolve(parent, args, ctx, info)
      if (captureReturnedErrors && res instanceof Error) {
        captureException(res, ctx, extras)
      }
      return res
    } catch (err) {
      captureException(err, ctx, extras)

      // Forward error
      if (forwardErrors) {
        throw err
      }
    }
  }
}

function captureException(err, ctx, extras: Extra[]) {
  Sentry.withScope(scope => {
    extras.forEach(extra => {
      scope.setExtra(extra.name, _.get(ctx, extra.path))
    })
    Sentry.captureException(err)
  })
}
