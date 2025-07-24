"use server";

import { revalidatePath } from "next/cache";

import { type FormResponse } from "@/components/Form";
import { zodErrorResponse } from "@/components/FormServerHelpers";
import {
  addWebcamFeed,
  editWebcamFeed,
  removeWebcamFeed,
} from "@/features/webcams";

import {
  addWebcamSchema,
  editWebcamSchema,
  removeWebcamSchema,
} from "./schema";

export async function addWebcam(unsafeData: unknown): Promise<FormResponse> {
  const parsedData = await addWebcamSchema.safeParseAsync(unsafeData);

  if (!parsedData.success) {
    return zodErrorResponse(parsedData.error);
  }

  const data = parsedData.data;

  await addWebcamFeed(data);

  revalidatePath("webcam");

  return { ok: true };
}

export async function editWebcam(unsafeData: unknown): Promise<FormResponse> {
  const parsedData = await editWebcamSchema.safeParseAsync(unsafeData);

  if (!parsedData.success) {
    return zodErrorResponse(parsedData.error);
  }

  const data = parsedData.data;

  await editWebcamFeed(data);

  revalidatePath("webcam");

  return { ok: true };
}

export async function removeWebcam(unsafeData: unknown): Promise<FormResponse> {
  const parsedData = await removeWebcamSchema.safeParseAsync(unsafeData);

  if (!parsedData.success) {
    return zodErrorResponse(parsedData.error);
  }

  const data = parsedData.data;

  await removeWebcamFeed(data);

  revalidatePath("webcam");

  return { ok: true };
}
