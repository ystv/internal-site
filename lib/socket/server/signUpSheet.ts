import "server-only";
import { io } from ".";

export async function socketUpdateSignupSheet(signupSheetID: number) {
  io.in("authenticatedUsers").emit(`signupSheetUpdate:${signupSheetID}`);
}
