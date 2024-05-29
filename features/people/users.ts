import { prisma } from "@/lib/db";
import { string, z } from "zod";
import { UserPreferencesSchema } from "@/lib/db/preferences";
import { zodErrorResponse } from "@/components/FormServerHelpers";
import { FormResponse } from "@/components/Form";
import {
  Identity,
  Position,
  Prisma,
  Role,
  RolePermission,
  User,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { createPositionSchema } from "@/app/(authenticated)/(superuser)/admin/users/schema";
import { getTsQuery } from "@/lib/search";
import { UserWithIdentities } from "@/components/UsersContext";
import { editUserSchema } from "@/app/(authenticated)/(superuser)/admin/users/[userID]/schema";
import { mustGetCurrentUser, requirePermission } from "@/lib/auth/server";

/**
 * Fields of a user object that we (usually) want to expose to the world.
 * Ensure that all calls to any of these methods are passed through this whenever the raw JSON value
 * will be user-visible, otherwise you may accidentally leak some fields (eg `password`, which would be bad).
 */
export const ExposedUserModel = z.object({
  user_id: z.number(),
  first_name: z.string(),
  last_name: z.string(),
  nickname: z.string().optional(),
  avatar: z.string().nullable(),
});

export type ExposedUser = z.infer<typeof ExposedUserModel>;

export interface RoleWithPermissions extends Role {
  role_permissions: RolePermission[];
}

export interface UserWithIdentitiesRoles extends User {
  identities: Identity[];
  roles: RoleWithPermissions[];
}

const IdentitySchema = z.object({
  provider: z.enum(["google", "slack"]),
  provider_key: z.string(),
});

/**
 * Additional fields that we can expose to the current user or admins, but
 * not everyone.
 */
export const SecureUserModel = ExposedUserModel.extend({
  preferences: UserPreferencesSchema,
  identities: z.array(IdentitySchema), // this is okay - the only thign stored is IDs
  email: z.string(),
});

export type SecureUser = z.infer<typeof SecureUserModel>;

export async function getAllUsers(): Promise<ExposedUser[]> {
  const users = await prisma.user.findMany({
    orderBy: [{ last_name: "asc" }, { first_name: "asc" }],
  });
  return users.map((user) => ExposedUserModel.parse(user));
}

export async function getUser(id: number): Promise<ExposedUser | null> {
  const user = await prisma.user.findUnique({
    where: { user_id: id },
  });
  if (!user) return null;
  return ExposedUserModel.parse(user);
}

export async function setUserPreference<
  K extends keyof PrismaJson.UserPreferences,
>(userID: number, key: K, value: PrismaJson.UserPreferences[K]) {
  await prisma.$transaction(async ($db) => {
    const { preferences } = await $db.user.findFirstOrThrow({
      where: { user_id: userID },
      select: { preferences: true },
    });
    preferences[key] = value;
    // run through Zod to double-check it's still valid
    UserPreferencesSchema.parse(preferences);
    await $db.user.update({
      where: { user_id: userID },
      data: { preferences },
    });
  });
}

export async function removeSlackLink(user_id: number): Promise<boolean> {
  return await prisma.$transaction(async ($db) => {
    const num_identities = await $db.identity.count({
      where: {
        user_id: user_id,
      },
    });

    if (num_identities <= 1) {
      return false;
    }

    await $db.identity.deleteMany({
      where: {
        user_id: user_id,
        provider: "slack",
      },
    });

    return true;
  });
}

export async function fetchUsers(data: {
  count: number;
  page: number;
  query?: string;
}) {
  "use server";

  let totalMatching: number;

  const queryExists = data.query && data.query.trim() != "";

  const searchQuery = getTsQuery(data.query || "");

  if (queryExists) {
    const actualTotalMatching = await prisma.$transaction(async ($db) => {
      return await $db.$queryRaw<{ count: number }[]>(
        Prisma.sql`SELECT COUNT(*) 
          FROM users 
          WHERE to_tsvector('english', user_id || ' ' || first_name || ' ' || nickname || ' ' || last_name || ' ' || email) @@ to_tsquery('english', ${searchQuery});`,
      );
    });

    totalMatching = Number(z.bigint().parse(actualTotalMatching[0].count));
  } else {
    totalMatching = await prisma.user.count();
  }

  const availablePages = Math.ceil(totalMatching / data.count);

  if (data.page > availablePages) {
    data.page = availablePages;
  }

  if (data.page == 0) {
    data.page = 1;
  }

  const skipValue = data.count * (data.page - 1);

  let searchResultUsers: User[];

  if (queryExists) {
    searchResultUsers = await prisma.$transaction(async ($db) => {
      return await $db.$queryRaw<User[]>(
        Prisma.sql`SELECT * 
          FROM users 
          WHERE to_tsvector('english', user_id || ' ' || first_name || ' ' || nickname || ' ' || last_name || ' ' || email) @@ to_tsquery('english', ${searchQuery})
          ORDER BY user_id DESC
          LIMIT ${data.count}
          OFFSET ${skipValue >= 0 ? skipValue : 0};`,
      );
    });
  } else {
    searchResultUsers = await prisma.user.findMany({
      take: data.count,
      skip: skipValue >= 0 ? skipValue : 0,
      orderBy: {
        user_id: "desc",
      },
    });
  }

  const user_ids = searchResultUsers.map((user) => user.user_id);

  const userIdentities = await prisma.identity.findMany({
    where: {
      user_id: {
        in: user_ids,
      },
    },
  });

  const userRoles = await prisma.roleMember.findMany({
    where: {
      user_id: {
        in: user_ids,
      },
    },
    select: {
      user_id: true,
      roles: true,
    },
  });

  const usersWithIdentities = searchResultUsers.map((user) => {
    const searchUserIdentities = userIdentities.filter(
      (identity) => identity.user_id == user.user_id,
    );
    const searchUserRoles = userRoles
      .filter((userRole) => userRole.user_id == user.user_id)
      .map((userRole) => userRole.roles);
    return {
      ...user,
      identities: searchUserIdentities,
      roles: searchUserRoles,
    };
  });

  return {
    users: usersWithIdentities,
    page: data.page,
    total: totalMatching,
  };
}

export async function fetchUserForAdmin(data: { user_id: number }) {
  const user = await prisma.user.findFirst({
    where: {
      user_id: data.user_id,
    },
    include: {
      identities: true,
      role_members: {
        include: {
          roles: {
            include: {
              role_permissions: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    return undefined;
  }

  let outputUser = {
    ...user,
    roles: user?.role_members.map((role_member) => role_member.roles),
  } as UserWithIdentitiesRoles;

  return outputUser;
}

export async function editUserAdmin(data: unknown): Promise<FormResponse> {
  "use server";
  await requirePermission("Admin.Users.Admin");

  const parsedData = editUserSchema.safeParse(data);

  if (!parsedData.success) {
    return zodErrorResponse(parsedData.error);
  }

  const user = await mustGetCurrentUser();

  const updatedUser = await prisma.user.update({
    where: {
      user_id: parsedData.data.user_id,
    },
    data: {
      first_name: parsedData.data.first_name,
      nickname: parsedData.data.nickname,
      last_name: parsedData.data.last_name,
    },
  });

  return { ok: true };
}

export async function searchUsers(
  data: unknown,
): Promise<FormResponse<{ positions: Position[] }>> {
  "use server";
  const dataSchema = z.object({
    query: z.string().optional(),
    // count: z.number(),
    // page: z.number(),
  });

  const safeData = dataSchema.safeParse(data);

  if (!safeData.success) {
    return zodErrorResponse(safeData.error);
  }

  const searchResults = await prisma.position.findMany({
    where: {
      name: {
        contains: safeData.data.query,
      },
    },
    take: 10,
  });

  return { ok: true, positions: searchResults };
}

export const numUsers = prisma.position.count({
  where: { is_custom: false },
});
