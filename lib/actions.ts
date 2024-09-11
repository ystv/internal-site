import * as Sentry from "@sentry/nextjs";

/**
 * Wraps a server action with Sentry instrumentation.
 */
export function wrapServerAction<T extends (...args: any[]) => Promise<any>>(
  name: string,
  fn: T,
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
  return async (...args: Parameters<T>) =>
    await Sentry.withServerActionInstrumentation(name, () => fn(...args));
}
