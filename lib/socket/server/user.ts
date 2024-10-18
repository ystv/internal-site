import { io } from ".";

export async function socketUpdateUserProfile(userID: number) {
  io.in(`userOnly:id:${userID}`).emit(`userUpdate:${userID}`);
}
