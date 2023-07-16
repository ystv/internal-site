const BASE = `https://dash.adam-rms.com/api`;

let sessionCookie: string | undefined;

async function login() {
  const res = await fetch(`${BASE}/login/login.php`, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": sessionCookie ?? ""
    },
    body: new URLSearchParams({
      "username": process.env.ADAMRMS_USERNAME!,
      "password": process.env.ADAMRMS_PASSWORD!,
    }).toString()
  });
  const data = await res.json();
  if (data.result === true) {
    sessionCookie = res.headers.get("set-cookie")!;
    return;
  }
  throw new Error("Login failed: " + data.error.message);
}

async function makeAPIRequest(endpoint: string, method: "GET" | "POST", params: Record<string, string>): Promise<unknown> {
  const res = await fetch(`${BASE}/${endpoint}`, {
    method,
    credentials: "include",
    cache: "force-cache",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": sessionCookie ?? ""
    },
    body: new URLSearchParams(params).toString()
  });
  const data = await res.json();
  if (data.result === true) {
    return data;
  }
  throw new Error("API request failed: " + data.error.message);
}

export async function 
