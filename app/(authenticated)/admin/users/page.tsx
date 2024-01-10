import { getCurrentUser, logout, requirePermission } from "@/lib/auth/server";
import * as People from "@/features/people";
import * as Calendar from "@/features/calendar";
import { notFound } from "next/navigation";
import { getUserName } from "@/components/UserHelpers";
import {
    Avatar,
    Button,
    Card,
    CopyButton,
    Group,
    Skeleton,
    Space,
    Stack,
} from "@mantine/core";
import { ICalCopyButton } from "@/components/ICalCopyButton";

import SlackLoginButton from "@/components/slack/SlackLoginButton";
import SlackUserInfo from "@/components/slack/SlackUserInfo";
import { Suspense } from "react";
import { isSlackEnabled } from "@/lib/slack/slackApiConnection";

export default async function UserPage({ params }: { params: { id: string } }) {
    // let user: People.SecureUser;
    // if (params.id === "me") {
    //     user = People.SecureUserModel.parse(await getCurrentUser());
    // } else {
        await requirePermission(
            "SuperUser"
        );
    //     const dbUser = await People.getUser(parseInt(params.id, 10));
    //     if (!dbUser) {
    //         notFound();
    //     }
    //     user = People.SecureUserModel.parse(dbUser);
    // }
    // const prefs = People.preferenceDefaults(user.preferences);
    return (
        <div>
            <Card withBorder>
                <Group>
                    {/*{user.avatar && (*/}
                    {/*    <>*/}
                    {/*        <Avatar src={user.avatar} radius={28} size={56} />*/}
                    {/*    </>*/}
                    {/*)}*/}
                    <Stack gap={3}>
                        <h2 className="my-0">Users</h2>
                        {/*<h4 className="my-0 text-[--mantine-color-placeholder]">*/}
                        {/*    {user.email}*/}
                        {/*</h4>*/}
                    </Stack>
                    <form
                        action={async () => {
                            "use server";
                            logout();
                        }}
                        className="ml-auto"
                    >
                        <Button
                            variant="filled"
                            color="red"
                            className="ml-auto"
                            type="submit"
                        >
                            Sign Out
                        </Button>
                    </form>
                </Group>
            </Card>
            <Space h={"md"} />
            <Card withBorder>
                <Stack gap={0}>
                    <h2 className="mt-0">Preferences</h2>
                </Stack>
            </Card>
            <Space h={"md"} />
            <Card withBorder>
                <Group>
                    <Stack gap={0} className="w-full">
                        <h2 className="mt-0">Add Calendar to Google Calendar</h2>
                        {/*<Stack gap={0}>*/}
                        {/*    <p>Add this URL as a new calendar in Google Calendar:</p>*/}
                        {/*    {await (async () => {*/}
                        {/*        const link = `${*/}
                        {/*            process.env.PUBLIC_URL*/}
                        {/*        }/iCal/${await Calendar.encodeUserID(user.user_id)}`;*/}

                        {/*        return (*/}
                        {/*            <Group>*/}
                        {/*                <input disabled className="sm:max-w-96" value={link} />*/}
                        {/*                <ICalCopyButton link={link} />*/}
                        {/*            </Group>*/}
                        {/*        );*/}
                        {/*    })()}*/}
                        {/*</Stack>*/}
                    </Stack>
                </Group>
            </Card>
            <Space h={"md"} />
            {/*{isSlackEnabled && (*/}
            {/*    <>*/}
            {/*        {!user.slack_user_id ? (*/}
            {/*            <Card withBorder>*/}
            {/*                <h2 className="mt-0">Link your account to Slack</h2>*/}
            {/*                <Suspense>*/}
            {/*                    <SlackLoginButton />*/}
            {/*                </Suspense>*/}
            {/*            </Card>*/}
            {/*        ) : (*/}
            {/*            <Card withBorder>*/}
            {/*                <h2 className="mt-0">Manage Slack link</h2>*/}
            {/*                /!*<Suspense*!/*/}
            {/*                /!*    fallback={*!/*/}
            {/*                /!*        <>*!/*/}
            {/*                /!*            <Card withBorder>*!/*/}
            {/*                /!*                <Group>*!/*/}
            {/*                /!*                    <Skeleton height={38} circle />*!/*/}
            {/*                /!*                </Group>*!/*/}
            {/*                /!*            </Card>*!/*/}
            {/*                /!*        </>*!/*/}
            {/*                /!*    }*!/*/}
            {/*                /!*>*!/*/}
            {/*                /!*    <SlackUserInfo slack_user_id={user.slack_user_id} />*!/*/}
            {/*                /!*</Suspense>*!/*/}
            {/*            </Card>*/}
            {/*        )}*/}
            {/*    </>*/}
            {/*)}*/}
        </div>
    );
}
