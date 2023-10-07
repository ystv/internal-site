import Image from "next/image";
import { getCurrentUser, requirePermission } from "@/lib/auth/server";
import * as People from "@/features/people";
import * as Calendar from "@/features/calendar";
import { notFound } from "next/navigation";
import { getUserName } from "@/components/UserHelpers";
import {Button} from "@mantine/core";
import {ExposedUser} from "@/features/people";

let user: ExposedUser | null;

export default async function UserPage({ params }: { params: { id: string } }) {
  if (params.id === "me") {
    user = People.ExposedUserModel.parse(await getCurrentUser());
  } else {
    await requirePermission(
      "ManageMembers.Members.List",
      "ManageMembers.Members.Admin",
      "ManageMembers.Admin",
    );
    user = await People.getUser(parseInt(params.id, 10));
    if (!user) {
      notFound();
    }
  }
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
      <h2>Add Calendar to Google Calendar</h2>
      <p>
        Add this URL as a new calendar in Google Calendar:
        <input
          disabled
          className="w-96"
          value={`${
            process.env.WEBCAL_URL
          }/iCal/${await Calendar.encodeUserID(user.user_id)}`}
        /><br></br>
          Press this button to add this to your calendar: <Button
          className="h-full min-w-[2rem] align-middle text-2xl font-black [&_.mantine-Button-inner]:text-xl"
          onClick={async () => location.href = `${
              process.env.PUBLIC_URL
          }/iCal/${await Calendar.encodeUserID(user ? user.user_id : 0)}`}
          variant="danger"
          size="sm"
      >
          Add to calendar
      </Button>
      </p>
    </div>
  );
}
