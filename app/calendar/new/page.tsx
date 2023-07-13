import { getCurrentUser } from "@/lib/auth/server";
import { schema } from "./schema";
import { CreateEventForm } from "@/app/calendar/new/form";
import {
  FormErrorResponse,
  FormResponse,
  zodErrorResponse,
} from "@/components/Form";

async function createEvent(data: FormData): Promise<FormResponse> {
  "use server";
  const user = await getCurrentUser();
  // TODO: there are separate permissions to allow creating each type of event
  //   (Calendar.Admin, Calendar.{Show,Meeting,Social}.Admin). Check those.
  const payload = schema.safeParse(data);
  if (!payload.success) {
    return zodErrorResponse(payload.error);
  }
  console.log(payload.data);
  return {
    ok: false,
    errors: {
      root: "It's all wrong!",
      name: "Test server-side error",
    },
  } satisfies FormErrorResponse;
}

export default async function NewEventPage() {
  const user = await getCurrentUser();
  // TODO: there are separate permissions to allow creating each type of event
  //   (Calendar.Admin, Calendar.{Show,Meeting,Social}.Admin). Check those.
  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-4xl">New Event</h1>
      <CreateEventForm action={createEvent} />
    </div>
  );
}
