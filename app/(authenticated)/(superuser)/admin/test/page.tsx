import { prisma } from "@/lib/db";

export default async function TestPage() {
  const users = await prisma.user.findMany({
    where: {
      username: "vqt501",
    },
    include: {
      identities: true,
    },
  });
  console.log(users);
  return <></>;
}
