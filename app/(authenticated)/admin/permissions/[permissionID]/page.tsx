import {notFound} from "next/navigation";
import {twMerge} from "tailwind-merge";
import {getPermission} from "@/features/permission";

export default async function PermissionPage({params}: { params: { permissionID: string } }) {
    const permission = await getPermission(parseInt(params.permissionID, 10));
    if (!permission) {
        notFound();
    }
    return (
        <>
            <div className="w-fit grow font-bold">
                <h1 className={twMerge("text-4xl font-bold")}>
                    {permission.name}
                </h1>
                <h4 className={twMerge("text-4xl font-bold")}>
                    {permission.permission_id}
                </h4>
                <h4 className={twMerge("text-4xl font-bold")}>
                    {permission.name}
                </h4>
                <h4 className={twMerge("text-4xl font-bold")}>
                    {permission.description}
                </h4>
            </div>
        </>
    );
}
