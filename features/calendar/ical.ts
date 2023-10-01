import { getUserName } from "@/components/UserHelpers";
import { prisma } from "@/lib/db";
import ical from "ical-generator";
import invariant from "tiny-invariant";

let key: CryptoKey | null = null;

async function getKey() {
  if (!key) {
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

function hexEncode(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexDecode(str: string): ArrayBuffer {
  return new Uint8Array(str.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)))
    .buffer;
}

export async function createICalTokenForUser(userID: number) {
  const payload = JSON.stringify({ userID });
  const signature = await crypto.subtle.sign(
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    await getKey(),
    new TextEncoder().encode(payload),
  );
  return (
    hexEncode(signature) + "." + hexEncode(new TextEncoder().encode(payload))
  );
}

export async function getUserFromICalToken(tok: string): Promise<number> {
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
  const { userID } = JSON.parse(
    new TextDecoder().decode(hexDecode(encodedPayload)),
  );
  return userID;
}

export async function generateICalFeedForUser(userID: number) {
  const user = await prisma.user.findFirstOrThrow({
    where: { user_id: userID },
  });
  const events = await prisma.event.findMany({
    where: {
      end_date: {
        gte: new Date(),
      },
    },
  });
  const calendar = ical({ name: `YSTV Calendar for ${getUserName(user)}` });
  for (const evt of events) {
    calendar.createEvent({
      summary: evt.name,
      start: evt.start_date,
      end: evt.end_date,
      description: evt.description,
      location: evt.location,
      url: `${process.env.PUBLIC_URL}/calendar/${evt.event_id}`,
    });
  }
  return calendar.toString();
}
