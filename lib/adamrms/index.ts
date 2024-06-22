import invariant from "@/lib/invariant";
import { login, makeRequest } from "./client";

async function findIDOfUser(email: string): Promise<number | null> {
  const usersSearchResult = (await makeRequest("/instances/users.php", "GET", {
    q: email,
  })) as {
    users: {
      users_userid: number;
      users_email: string;
    }[];
    pagination: unknown;
  };
  switch (usersSearchResult.users.length) {
    case 0:
      return null;
    case 1:
      return usersSearchResult.users[0].users_userid;
    default:
      throw new Error("More than one user matched search");
  }
}

export interface Project {
  projects_id: number;
  projects_name: string;
  clients_name: any;
  projects_manager: number;
  thisProjectManager: boolean;
  subprojects: unknown[];
}

export async function listProjects() {
  return (await makeRequest("/projects/list.php", "GET")) as Project[];
}

export async function createProject(
  name: string,
  projectManagerEmail: string,
  projectTypeID = parseInt(process.env.ADAMRMS_PROJECT_TYPE_ID!),
) {
  // Find the project manager by searching the list of users
  // It's not guaranteed to exist, so fall back to our login email (which is guaranteed to exist)
  let userID = await findIDOfUser(projectManagerEmail);
  if (userID === null) {
    userID = await findIDOfUser(process.env.ADAMRMS_EMAIL!);
    if (userID === null) {
      throw new Error("Could not find user ID of PM user or our own user");
    }
  }
  const res = (await makeRequest("/projects/new.php", "POST", {
    projects_name: name,
    projects_manager: userID!.toString(10),
    projectsType_id: projectTypeID.toString(10),
  })) as { projects_id: number };
  return res.projects_id;
}

export async function changeProjectDates(
  projectID: number,
  startDate: Date,
  endDate: Date,
  type: "dates",
): Promise<{}>;
export async function changeProjectDates(
  projectID: number,
  startDate: Date,
  endDate: Date,
  type: "deliver_dates",
): Promise<{ changed: boolean }>;
export async function changeProjectDates(
  projectID: number,
  startDate: Date,
  endDate: Date,
  type: "dates" | "deliver_dates",
) {
  switch (type) {
    case "dates":
      return (await makeRequest("/projects/changeProjectDates.php", "POST", {
        projects_id: projectID.toString(10),
        projects_dates_use_start: startDate.toUTCString(),
        projects_dates_use_end: endDate.toUTCString(),
      })) as {};
    case "deliver_dates":
      return (await makeRequest(
        "/projects/changeProjectDeliverDates.php",
        "POST",
        {
          projects_id: projectID.toString(10),
          projects_dates_deliver_start: startDate.toUTCString(),
          projects_dates_deliver_end: endDate.toUTCString(),
        },
      )) as { changed: boolean };
    default:
      invariant(false, type);
  }
}

export async function newQuickProjectComment(
  projectID: number,
  comment: string,
) {
  return (await makeRequest("/projects/newQuickComment.php", "POST", {
    projects_id: projectID.toString(10),
    text: comment,
  })) as {};
}

export async function setProjectStatus(projectID: number, status: "tentative" | "confirmed" | "cancelled") {
  let statusIDStr;
  switch (status) {
    case "tentative":
      statusIDStr = process.env.ADAMRMS_TENTATIVE_STATUS_ID;
      break;
    case "confirmed":
      statusIDStr = process.env.ADAMRMS_CONFIRMED_STATUS_ID;
      break;
    case "cancelled":
      statusIDStr = process.env.ADAMRMS_CANCELLED_STATUS_ID;
      break;
    default:
      invariant(false, `Invalid project status ${status}`);;
  }
  invariant(statusIDStr, "Missing status ID for status " + status);
  const statusID = parseInt(statusIDStr, 10);

  // We still need to check for kit clashes - it's possible that changing a cancelled
  // project to un-cancelled will cause a clash.
  const res = await makeRequest("/projects/changeStatus.php", "POST", {
    projects_id: projectID.toString(10),
    projects_status: statusID.toString(10),
  }) as { changed: boolean };
  return res.changed;
}
