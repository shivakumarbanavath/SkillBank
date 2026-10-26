import { redirect } from "next/navigation";

export default function UserShortcutPage({
  params,
}: {
  params: { username: string };
}) {
  redirect(`/profile/${params.username}`);
}
