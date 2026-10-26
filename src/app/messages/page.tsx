import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getConversations, getOrCreateConversation } from "@/actions/messages";
import { ChatInterface } from "@/components/messages/chat-interface";
import { MessageSquare } from "lucide-react";

export const metadata = { title: "Messages" };
export const dynamic = "force-dynamic";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: { id?: string; userId?: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  let initialActiveId = searchParams.id;

  // If userId is provided, find or start a conversation with them
  if (searchParams.userId && searchParams.userId !== session.user.id) {
    const res = await getOrCreateConversation(searchParams.userId);
    if (res.success && res.conversationId) {
      initialActiveId = res.conversationId;
    }
  }

  const convsRes = await getConversations();
  const conversations = convsRes.success ? (convsRes.conversations as any) : [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-3">
          <MessageSquare className="w-7 h-7 text-indigo-400" />
          Messages
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Coordinate sessions, ask questions, and connect with peers
        </p>
      </div>

      <ChatInterface
        initialConversations={conversations}
        initialActiveId={initialActiveId}
        currentUserId={session.user.id}
      />
    </div>
  );
}
