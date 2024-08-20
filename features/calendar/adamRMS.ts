import { prisma } from "@/lib/db";
import * as AdamRMS from "@/lib/adamrms";
import { env } from "@/lib/env";

export async function addProjectToAdamRMS(
  eventID: number,
  currentUserID: number,
) {
  const me = await prisma.user.findFirstOrThrow({
    where: {
      user_id: currentUserID,
    },
    select: {
      email: true,
    },
  });
  const event = await prisma.event.findFirstOrThrow({
    where: {
      event_id: eventID,
    },
  });
  const projectId = await AdamRMS.createProject(event.name, me.email);
  await AdamRMS.changeProjectDates(
    projectId,
    event.start_date,
    event.end_date,
    "dates",
  );
  await AdamRMS.changeProjectDates(
    projectId,
    event.start_date,
    event.end_date,
    "deliver_dates",
  );
  await prisma.event.update({
    where: {
      event_id: eventID,
    },
    data: {
      adam_rms_project_id: projectId,
    },
  });
  await AdamRMS.newQuickProjectComment(
    projectId,
    `This project is linked to the Calendar event "${event.name}" (${env.PUBLIC_URL}/calendar/${event.event_id}).`,
  );
}

export async function getAdamRMSLinkCandidates() {
  // Fetch the list of events that have an AdamRMS project ID, to filter them out
  const projects = await prisma.event.findMany({
    where: {
      adam_rms_project_id: {
        not: null,
      },
    },
    select: {
      adam_rms_project_id: true,
    },
  });
  const projectIDs = new Set(projects.map((p) => p.adam_rms_project_id));
  const upcomingProjects = await AdamRMS.listProjects();

  return upcomingProjects.filter((x) => !projectIDs.has(x.projects_id));
}

export async function linkAdamRMS(eventID: number, projectID: number) {
  const event = await prisma.event.findFirstOrThrow({
    where: {
      event_id: eventID,
    },
  });
  // Try changing deliver dates first to trigger kit clash check
  const result = await AdamRMS.changeProjectDates(
    projectID,
    event.start_date,
    event.end_date,
    "deliver_dates",
  );
  if (!result.changed) {
    return { ok: false, error: "kit_clash" };
  }
  await AdamRMS.changeProjectDates(
    projectID,
    event.start_date,
    event.end_date,
    "dates",
  );
  await prisma.event.update({
    where: {
      event_id: eventID,
    },
    data: {
      adam_rms_project_id: projectID,
    },
  });
  await AdamRMS.newQuickProjectComment(
    projectID,
    `This project is linked to the Calendar event "${event.name}" (${env.PUBLIC_URL}/calendar/${event.event_id}).`,
  );
  return { ok: true };
}

export async function unlinkAdamRMS(eventID: number) {
  const event = await prisma.event.findFirstOrThrow({
    where: {
      event_id: eventID,
    },
  });
  if (!event.adam_rms_project_id) {
    return;
  }
  await prisma.event.update({
    where: {
      event_id: eventID,
    },
    data: {
      adam_rms_project_id: null,
    },
  });
  await AdamRMS.newQuickProjectComment(
    event.adam_rms_project_id,
    `This project was unlinked from the Calendar event "${event.name}".`,
  );
}
