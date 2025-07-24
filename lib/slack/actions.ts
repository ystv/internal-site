import { type App } from "@slack/bolt";

import * as CheckWithTech from "@/features/calendar/check_with_tech_actions";

export async function setupActionHandlers(app: App) {
  // Check With Tech
  app.action(/^checkWithTech#.+/, async (action) => {
    await CheckWithTech.handleSlackAction(action);
  });
  app.view(/^checkWithTech#.+/, async (action) => {
    await CheckWithTech.handleSlackViewEvent(action);
  });

  app.action("userFeedback#searchSentry", async ({ ack }) => {
    await ack(); // no-op
  });
}
