import { doHandleUserReport } from "./actions";
import { UserReportForm } from "./form";

export default async function ReportPage() {
  return (
    <div>
      <h1>Report a problem or request a feature</h1>
      <p>
        We want to know how we can make the internal site better! Please let us
        know if you encounter any issues or have any ideas for new features.
      </p>
      <p>
        Your message will be sent to the Computing Team, and we may follow up
        with you via Slack.
      </p>
      <UserReportForm action={doHandleUserReport} />
    </div>
  );
}
