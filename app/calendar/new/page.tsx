import { Forbidden, getCurrentUser, hasPermission } from "@/lib/auth/server";
import { EventType, schema } from "./schema";
import { CreateEventForm } from "@/app/calendar/new/form";
import { FormResponse } from "@/components/Form";
import { zodErrorResponse } from "@/components/FormServerHelpers";
import { createEvent as doCreateEvent } from "@/features/calendar";

async function createEvent(
  data: unknown,
): Promise<FormResponse<{ id: number }>> {
  "use server";
  const payload = schema.safeParse(data);
  if (!payload.success) {
    return zodErrorResponse(payload.error);
  }
  if (!(await hasPermission("Calendar.Admin"))) {
    switch (payload.data.type) {
      case "show":
        if (
          !(await hasPermission("Calendar.Show.Admin")) &&
          !(await hasPermission("Calendar.Show.Creator"))
        ) {
          throw new Forbidden(["Calendar.Show.Admin", "Calendar.Show.Creator"]);
        }
        break;
      case "meeting":
        if (
          !(await hasPermission("Calendar.Meeting.Admin")) &&
          !(await hasPermission("Calendar.Meeting.Creator"))
        ) {
          throw new Forbidden([
            "Calendar.Meeting.Admin",
            "Calendar.Meeting.Creator",
          ]);
        }
        break;
      case "social":
        if (
          !(await hasPermission("Calendar.Social.Admin")) &&
          !(await hasPermission("Calendar.Social.Creator"))
        ) {
          throw new Forbidden([
            "Calendar.Social.Admin",
            "Calendar.Social.Creator",
          ]);
        }
        break;
      case "other":
        break;
      default:
        throw new Error("Invalid event type");
    }
  }
  const evt = await doCreateEvent({
    name: payload.data.name,
    description: payload.data.description,
    event_type: payload.data.type,
    start_date: payload.data.startDate,
    end_date: payload.data.endDate,
    location: payload.data.location,
    created_by: (await getCurrentUser()).id,
    is_private: payload.data.private,
    is_cancelled: false,
    is_tentative: payload.data.tentative,
  });
  return {
    ok: true,
    id: evt.event_id,
  };
}

export default async function NewEventPage() {
  const permittedEventTypes: EventType[] = [];
  if (await hasPermission("Calendar.Admin")) {
    permittedEventTypes.push("show", "meeting", "social", "other");
  } else {
    if (
      (await hasPermission("Calendar.Show.Admin")) ||
      (await hasPermission("Calendar.Show.Creator"))
    ) {
      permittedEventTypes.push("show");
    }
    if (
      (await hasPermission("Calendar.Meeting.Admin")) ||
      (await hasPermission("Calendar.Meeting.Creator"))
    ) {
      permittedEventTypes.push("meeting");
    }
    if (
      (await hasPermission("Calendar.Social.Admin")) ||
      (await hasPermission("Calendar.Social.Creator"))
    ) {
      permittedEventTypes.push("social");
    }
  }

  if (permittedEventTypes.length === 0) {
    throw new Forbidden([
      "Calendar.Admin or Calendar.{Show,Meeting,Social}.{Creator,Admin}" as any,
    ]);
  }
  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-4xl">New Event</h1>
      <CreateEventForm
        action={createEvent}
        permittedEventTypes={permittedEventTypes}
      />
    </div>
  );
}
