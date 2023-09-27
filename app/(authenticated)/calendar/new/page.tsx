import { getCurrentUser } from "@/lib/auth/server";
import { schema } from "./schema";
import { CreateEventForm } from "@/app/(authenticated)/calendar/new/form";
import { FormResponse } from "@/components/Form";
import { zodErrorResponse } from "@/components/FormServerHelpers";
import {
  canCreate,
  creatableEventTypes,
} from "@/features/calendar/permissions";
import * as Calendar from "@/features/calendar/events";
import { Forbidden, Permission } from "@/lib/auth/common";

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
  const evt = await Calendar.createEvent(
    {
      name: payload.data.name,
      description: payload.data.description,
      event_type: payload.data.type,
      start_date: payload.data.startDate,
      end_date: payload.data.endDate,
      location: payload.data.location,
      is_private: payload.data.private,
      is_tentative: payload.data.tentative,
    },
    user.user_id,
  );
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
      <h1 className="mb-4 mt-0 text-4xl font-bold">New Event</h1>
      <CreateEventForm
        action={createEvent}
        permittedEventTypes={permittedEventTypes}
      />
    </div>
  );
}
