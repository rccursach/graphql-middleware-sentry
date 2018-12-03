import * as Sentry from '@sentry/node'

import { IMiddlewareFunction } from 'graphql-middleware/dist/types'

export type ExceptionScope<Context> = (
  scope: Sentry.Scope,
  error: any,
  context: Context,
) => void

// Options for graphql-middleware-sentry
export interface Options<Context> {
  config: Sentry.NodeOptions
  withScope?: ExceptionScope<Context>
  captureReturnedErrors?: boolean
  forwardErrors?: boolean
}

export class SentryError extends Error {}

export const sentry = <Context>({
  config = {},
  withScope,
  captureReturnedErrors = false,
  forwardErrors = false,
}: Options<Context>): IMiddlewareFunction => {
  // Check if Sentry DSN is present
  if (!config.dsn) {
    throw new SentryError(`Missing dsn parameter in configuration.`)
  }

  // Init Sentry
  Sentry.init(config)

  // Return middleware resolver
  return async function(resolve, parent, args, ctx, info) {
    try {
      const res = await resolve(parent, args, ctx, info)
      if (captureReturnedErrors && res instanceof Error) {
        captureException(res, ctx, withScope)
      }
      return res
    } catch (err) {
      captureException(err, ctx, withScope)

      // Forward error
      if (forwardErrors) {
        throw err
      }
    }
  }
}

function captureException<Context>(
  err,
  ctx: Context,
  withScope: ExceptionScope<Context>,
) {
  Sentry.withScope(scope => {
    withScope(scope, err, ctx)
    Sentry.captureException(err)
  })
}
