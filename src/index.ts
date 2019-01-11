import { Scope } from '@sentry/core'

import { IMiddlewareFunction } from 'graphql-middleware/dist/types'

export type ExceptionScope<Context> = (
  scope: Scope,
  error: Error,
  context: Context,
) => void

// Options for graphql-middleware-sentry
export interface Options<Context> {
  sentryInstance: any
  withScope?: ExceptionScope<Context>
  captureReturnedErrors?: boolean
  forwardErrors?: boolean
}

export class SentryError extends Error {}

export const sentry = <Context>({
  sentryInstance = null,
  withScope,
  captureReturnedErrors = false,
  forwardErrors = false,
}: Options<Context>): IMiddlewareFunction => {
  // Check if Sentry DSN is present
  if (!sentryInstance) {
    throw new SentryError(`The Sentry instance is missing in the options.`)
  }

  // Return middleware resolver
  return async (resolve, parent, args, ctx, info) => {
    try {
      const res = await resolve(parent, args, ctx, info)
      if (captureReturnedErrors && res instanceof Error) {
        captureException(sentryInstance, res, ctx, withScope)
      }
      return res
    } catch (error) {
      captureException(sentryInstance, error, ctx, withScope)

      // Forward error
      if (forwardErrors) {
        throw error
      }
    }
  }
}

function captureException<Context>(
  sentryInstance,
  error: Error,
  ctx: Context,
  withScope: ExceptionScope<Context>,
) {
  sentryInstance.withScope(scope => {
    withScope(scope, error, ctx)
    sentryInstance.captureException(error)
  })
}
