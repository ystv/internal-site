import * as Sentry from "@sentry/nextjs";
import { getCurrentUserOrNull } from "./auth/server";

/**
 * Wraps a server action with Sentry instrumentation.
 */
export function wrapServerAction<T extends (...args: any[]) => Promise<any>>(
  name: string,
  fn: T,
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
  return async (...args: Parameters<T>) => {
    const user = await getCurrentUserOrNull();
    if (user && typeof user === "object") {
      Sentry.setUser({
        id: user.user_id,
        email: user.email,
      });
    } else {
      Sentry.setUser(null);
    }
    return await Sentry.withServerActionInstrumentation(name, () =>
      fn(...args),
    );
  };
}
