import {
  Forbidden,
  getCurrentUser,
  hasPermission,
  Permission,
} from "@/lib/auth/server";
import { schema } from "./schema";
import { CreateEventForm } from "@/app/calendar/new/form";
import { FormResponse } from "@/components/Form";
import { zodErrorResponse } from "@/components/FormServerHelpers";
import { createEvent as doCreateEvent } from "@/features/calendar";
import { EventType } from "@/features/calendar/types";
import {
  canCreate,
  creatableEventTypes,
} from "@/features/calendar/permissions";

async function createEvent(
  data: unknown,
): Promise<FormResponse<{ id: number }>> {
  "use server";
  const user = await getCurrentUser();
  const payload = schema.safeParse(data);
  if (!payload.success) {
    return zodErrorResponse(payload.error);
  }
  if (!canCreate(payload.data.type, user)) {
    throw new Forbidden([
      "Calendar.Admin",
      `Calendar.${payload.data.type}.Creator` as Permission,
      `Calendar.${payload.data.type}.Admin` as Permission,
    ]);
  }
  const evt = await doCreateEvent({
    name: payload.data.name,
    description: payload.data.description,
    event_type: payload.data.type,
    start_date: payload.data.startDate,
    end_date: payload.data.endDate,
    location: payload.data.location,
    created_by: (await getCurrentUser()).user_id,
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
  const permittedEventTypes = creatableEventTypes(
    (await getCurrentUser()).permissions,
  );
  if (permittedEventTypes.length === 0) {
    throw new Forbidden([
      "Calendar.Admin or Calendar.{Show,Meeting,Social}.{Creator,Admin}" as any,
    ]);
  }
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-4xl">New Event</h1>
      <CreateEventForm
        action={createEvent}
        permittedEventTypes={permittedEventTypes}
      />
    </div>
  );
}
