import { BackButton } from "@/components/navigation/BackButton";
import { PageInfo } from "@/components/util/PageInfo";
import { isSlackEnabled } from "@/lib/slack/slackApiConnection";
import { doHandleUserReport } from "./actions";
import { UserReportForm } from "./form";

export default async function ReportPage({
  searchParams,
}: {
  searchParams: {
    return_to?: string;
  };
}) {
  if (!isSlackEnabled) {
    return (
      <div>
        <PageInfo title="Feedback" />
        <BackButton
          path={
            searchParams.return_to && decodeURIComponent(searchParams.return_to)
          }
        />
        <h1>Not available</h1>
        <p>
          Unfortunately the slack integration isn&apos;t enabled for this site,
          please try messaging the computing team.
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageInfo title="Feedback" />
      <BackButton
        path={
          searchParams.return_to && decodeURIComponent(searchParams.return_to)
        }
      />
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
