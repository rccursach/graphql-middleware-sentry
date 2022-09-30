import * as Sentry from '@sentry/node';
import { GraphQLResolveInfo } from 'graphql';

import { IMiddlewareFunction } from 'graphql-middleware';

function captureException<Context>(
  sentryInstance,
  error: Error,
  ctx: Context,
  withScope: ExceptionScope<Context>,
  reportError?: (res) => boolean,
  info?: GraphQLResolveInfo,
) {
  if ((reportError && reportError(error)) || reportError === undefined) {
    // try to get operation name
    let operationName = 'unknown_operation';
    if (
      ['Query', 'Mutation'].includes(String(info.parentType)) &&
      !info.fieldName.startsWith('_') &&
      info.operation.name?.value
    ) {
      operationName = info.operation.name?.value;
    }
    sentryInstance.withScope(scope => {
      try {
        scope.setContext('Operation_Info', {
          operationName,
        });
      } catch (err) {
        console.log(
          `scope.setContext for Error in ${operationName} :`,
          err.message,
        );
      }
      withScope(scope, error, ctx);
      sentryInstance.captureException(error);
    });
  }
}

export type ExceptionScope<Context> = (
  scope: Sentry.Scope,
  error: Error,
  context: Context,
  reportError?: (res: Error | any) => boolean,
) => void;

// Options for graphql-middleware-sentry
export interface Options<Context> {
  sentryInstance?: any;
  config?: Sentry.NodeOptions;
  withScope?: ExceptionScope<Context>;
  captureReturnedErrors?: boolean;
  forwardErrors?: boolean;
  reportError?: (res: Error | any) => boolean;
}

export class SentryError extends Error {}

export const sentry = <Context>({
  sentryInstance = null,
  config = {},
  withScope = () => {},
  captureReturnedErrors = false,
  forwardErrors = false,
  reportError,
}: Options<Context>): IMiddlewareFunction => {
  // Check if either sentryInstance or config.dsn is present
  if (!sentryInstance && !config.dsn) {
    throw new SentryError(
      `Missing the sentryInstance or the dsn parameter in configuration.`,
    );
  }

  if (!sentryInstance && config.dsn) {
    // Init Sentry
    sentryInstance = Sentry;
    Sentry.init(config);
  }

  // Return middleware resolver
  return async (resolve, parent, args, ctx, info) => {
    try {
      const res = await resolve(parent, args, ctx, info);

      if (captureReturnedErrors && res instanceof Error) {
        captureException(
          sentryInstance,
          res,
          ctx,
          withScope,
          reportError,
          info,
        );
      }

      return res;
    } catch (error) {
      captureException(
        sentryInstance,
        error,
        ctx,
        withScope,
        reportError,
        info,
      );

      // Forward error
      if (forwardErrors) {
        throw error;
      }
    }
  };
};
