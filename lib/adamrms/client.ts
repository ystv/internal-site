import makeFetchCookie from "fetch-cookie";

const fetchCookie = makeFetchCookie(fetch);

export class AdamRMSError extends Error {
  constructor(
    message: string,
    public readonly fullPayload: unknown,
  ) {
    super(message);
    this.name = "AdamRMSError";
  }
}

export async function makeRequest(
  endpoint: string,
  method: "GET" | "POST",
  params?: Record<string, string>,
  shouldRetryOnAuthFail = true,
): Promise<unknown> {
  let url = process.env.ADAMRMS_BASE + "/api" + endpoint;
  const init: RequestInit = {
    method,
    headers: {},
  };
  if (method === "GET") {
    url += "?" + new URLSearchParams(params).toString();
  } else {
    (init.headers as Record<string, string>)["Content-Type"] =
      "application/x-www-form-urlencoded";
    init.body = new URLSearchParams(params).toString();
  }
  const res = await fetchCookie(url, init);
  const data = await res.json();
  if (data.result !== true) {
    if (data.error.message.startsWith("AUTH FAIL")) {
      if (shouldRetryOnAuthFail) {
        console.log("AUTH FAIL - retrying");
        await login();
        return await makeRequest(endpoint, method, params, false);
      }
    }
    throw new AdamRMSError(data.error.message, data);
  }
  return data.response;
}

export async function login() {
  await makeRequest(
    "/login/login.php",
    "POST",
    {
      formInput: process.env.ADAMRMS_EMAIL!,
      password: process.env.ADAMRMS_PASSWORD!,
    },
    false,
  );
}
