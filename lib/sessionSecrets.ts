import invariant from "./invariant";
import { encode as b64Encode, decode as b64Decode } from "base64-arraybuffer";

function urlbase64Unescape(str: string) {
  return (str + "===".slice((str.length + 3) % 4))
    .replace(/-/g, "+")
    .replace(/_/g, "/");
}

function urlbase64Escape(str: string) {
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

let key: CryptoKey | null = null;

async function getKey() {
  if (!key) {
    invariant(process.env.SESSION_SECRET, "no SESSION_SECRET set");
    key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(process.env.SESSION_SECRET),
      {
        name: "HMAC",
        hash: "SHA-256",
      },
      false,
      ["sign", "verify"],
    );
  }
  return key!;
}

function urlb64Encode(buf: ArrayBuffer): string {
  return urlbase64Escape(b64Encode(buf));
}

function hexDecode(str: string): ArrayBuffer {
  return b64Decode(urlbase64Unescape(str));
}

export async function encode(data: Record<string, unknown>) {
  const payload = JSON.stringify(data);
  const signature = await crypto.subtle.sign(
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    await getKey(),
    new TextEncoder().encode(payload),
  );
  return (
    urlb64Encode(signature) +
    "." +
    urlb64Encode(new TextEncoder().encode(payload))
  );
}

export async function decode(tok: string): Promise<unknown> {
  const [signature, encodedPayload] = tok.split(".");
  if (
    !(await crypto.subtle.verify(
      {
        name: "HMAC",
        hash: "SHA-256",
      },
      await getKey(),
      hexDecode(signature),
      hexDecode(encodedPayload),
    ))
  ) {
    throw new Error("Invalid signature");
  }
  const data = JSON.parse(new TextDecoder().decode(hexDecode(encodedPayload)));
  return data;
}
