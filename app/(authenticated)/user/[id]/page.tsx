import { getCurrentUser, logout, requirePermission } from "@/lib/auth/server";
import * as People from "@/features/people";
import * as Calendar from "@/features/calendar";
import { notFound } from "next/navigation";
import { getUserName } from "@/components/UserHelpers";
import { Avatar, Button, Card, Group, Space, Stack } from "@mantine/core";
import { UserPreferences } from "./UserPreferences";
import { ICalCopyButton } from "@/components/ICalCopyButton";

export default async function UserPage({ params }: { params: { id: string } }) {
  let user: People.SecureUser;
  if (params.id === "me") {
    user = People.SecureUserModel.parse(await getCurrentUser());
  } else {
    await requirePermission(
      "ManageMembers.Members.List",
      "ManageMembers.Members.Admin",
      "ManageMembers.Admin",
    );
    const dbUser = await People.getUser(parseInt(params.id, 10));
    if (!dbUser) {
      notFound();
    }
    user = People.SecureUserModel.parse(dbUser);
  }
  const prefs = People.preferenceDefaults(user.preferences);
  return (
    <div>
      <Card withBorder>
        <Group>
          {user.avatar && (
            <>
              <Avatar src={user.avatar} radius={28} size={56} />
            </>
          )}
          <Stack gap={3}>
            <h2 className="my-0">{getUserName(user)}</h2>
            <h4 className="my-0 text-[--mantine-color-placeholder]">
              {user.email}
            </h4>
          </Stack>
          <form
            action={async () => {
              "use server";
              logout();
            }}
            className="ml-auto"
          >
            <Button
              variant="filled"
              color="red"
              className="ml-auto"
              type="submit"
            >
              Sign Out
            </Button>
          </form>
        </Group>
      </Card>
      <Space h={"md"} />
      <Card withBorder>
        <Stack gap={0}>
          <h2 className="mt-0">Preferences</h2>
          <UserPreferences value={prefs} userID={user.user_id} />
        </Stack>
      </Card>
      <Space h={"md"} />
      <Card withBorder>
        <Group>
          <Stack gap={0} className="w-full">
            <h2 className="mt-0">Add Calendar to Google Calendar</h2>
            <Stack gap={0}>
              <p>Add this URL as a new calendar in Google Calendar:</p>
              {await (async () => {
                const link = `${
                  process.env.PUBLIC_URL
                }/iCal/${await Calendar.encodeUserID(user.user_id)}`;

                return (
                  <Group>
                    <input disabled className="sm:max-w-96" value={link} />
                    <ICalCopyButton link={link} />
                  </Group>
                );
              })()}
            </Stack>
          </Stack>
        </Group>
      </Card>
    </div>
  );
}
