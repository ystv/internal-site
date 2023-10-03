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

export async function listProjects() {
  return (await makeRequest("/projects/list.php", "GET")) as {
    projects_id: number;
    projects_name: string;
    clients_name: any;
    projects_manager: number;
    thisProjectManager: boolean;
    subprojects: unknown[];
  }[];
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
