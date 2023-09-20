import { PrismaClient } from "@prisma/client";

if (process.env.NEXT_RUNTIME) {
  throw new Error("Can only run as a standalone script");
}

const email = process.argv[3];
if (!email) {
  throw new Error("Must provide email");
}
const roleName = process.argv[4] ?? "SuperUser";

(async function(){
  const prisma = new PrismaClient();
  const role = await prisma.role.findFirstOrThrow({
    where: {
      name: roleName,
    }
  });
  const user = await prisma.user.findFirstOrThrow({
    where: {
      email: email,
    }
  });
  await prisma.user.update({
    where: {
      user_id: user.user_id,
    },
    data: {
      role_members: {
        connectOrCreate: [{
          where: {
            user_id_role_id: {
              user_id: user.user_id,
              role_id: role.role_id,
            },
          },
          create: {
            role_id: role.role_id,
          }
        }]
      }
    }
  });
  console.log(`Promoted ${email} to ${roleName}`);
})();
