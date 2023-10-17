import Image from "next/image";
import { getCurrentUser, requirePermission } from "@/lib/auth/server";
import * as People from "@/features/people";
import * as Calendar from "@/features/calendar";
import { notFound } from "next/navigation";
import { getUserName } from "@/components/UserHelpers";
import Form from "@/components/Form";
import { InputWrapper, SegmentedControl, Stack } from "@mantine/core";
import { UserPreferences } from "./UserPreferences";

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
      <h1>
        {user.avatar && (
          <Image
            src={user.avatar}
            alt=""
            width={96}
            height={96}
            className="max-h-[4.5rem] w-auto rounded-full py-2"
          />
        )}
        {getUserName(user)}
      </h1>
      <h2>Preferences</h2>
      <UserPreferences value={prefs} userID={user.user_id} />
      <h2>Add Calendar to Google Calendar</h2>
      <p>
        Add this URL as a new calendar in Google Calendar:
        <input
          disabled
          className="w-96"
          value={`${process.env.PUBLIC_URL}/iCal/${await Calendar.encodeUserID(
            user.user_id,
          )}`}
        />
      </p>
    </div>
  );
}
