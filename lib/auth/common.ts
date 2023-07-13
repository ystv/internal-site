import "server-only";
import {getCurrentUser} from "@/lib/auth/legacy";

/**
 * Available permissions. Should contain all the ones that users are expected
 * to have, along with some special ones:
 * * MEMBER - any logged in user
 * * PUBLIC - open to the world with no authentication
 * * SUDO - superuser, can do anything (don't use this unless you know what you're doing)
 */
export type Permission = "PUBLIC" | "MEMBER" | "SUDO" | "Watch.Admin";

/**
 * Ensures that the currently signed in user has at least one of the given permissions,
 * or throws an error (to the closest error boundary).
 * Must only be called from pages, not from API endpoints (use the auth meta system there instead).
 * @param perms
 */
export async function requirePermission(...perms: Permission[]) {
    // TODO: legacy auth doesn't have permissions integrated yet,
    // so this will always work.
    // In future this will throw an error if there are missing permissions.
    return await getCurrentUser();
}

