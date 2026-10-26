"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getMessages, sendMessage } from "@/actions/messages";
import {
  MessageSquare,
  Send,
  User,
  Search,
  School,
  ExternalLink,
  ArrowLeft,
  Clock,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";

interface ConversationItem {
  id: string;
  updatedAt: Date;
  otherUser: {
    id: string;
    name: string | null;
    profile: {
      username: string;
      displayName: string;
      avatar: string | null;
      campus: string | null;
      institution: string | null;
    } | null;
  } | null;
  lastMessage: {
    content: string;
    createdAt: Date;
    senderId: string;
  } | null;
  isUnread: boolean;
}

interface MessageItem {
  id: string;
  content: string;
  senderId: string;
  createdAt: Date;
  senderName: string;
  senderAvatar: string | null;
}

interface ChatInterfaceProps {
  initialConversations: ConversationItem[];
  initialActiveId?: string;
  currentUserId: string;
}

export function ChatInterface({
  initialConversations,
  initialActiveId,
  currentUserId,
}: ChatInterfaceProps) {
  const router = useRouter();
  const [conversations, setConversations] = useState(initialConversations);
  const [activeId, setActiveId] = useState<string | null>(
    initialActiveId || (conversations.length > 0 ? conversations[0].id : null)
  );
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileShowChat, setMobileShowChat] = useState(Boolean(initialActiveId));

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find((c) => c.id === activeId);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch messages when activeId changes
  useEffect(() => {
    if (!activeId) return;

    let isMounted = true;
    setLoadingMessages(true);

    getMessages(activeId).then((res) => {
      if (isMounted) {
        if (res.success && res.messages) {
          setMessages(res.messages as any);
        }
        setLoadingMessages(false);
        setTimeout(scrollToBottom, 100);
      }
    });

    // Mark unread as read in UI state
    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, isUnread: false } : c))
    );

    return () => {
      isMounted = false;
    };
  }, [activeId]);

  // Polling for incoming messages
  useEffect(() => {
    if (!activeId) return;

    const interval = setInterval(() => {
      getMessages(activeId).then((res) => {
        if (res.success && res.messages) {
          setMessages((prev) => {
            if (res.messages.length !== prev.length) {
              setTimeout(scrollToBottom, 100);
              return res.messages as any;
            }
            return prev;
          });
        }
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [activeId]);

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!inputText.trim() || !activeId || sending) return;

    const content = inputText.trim();
    setInputText("");
    setSending(true);

    // Optimistic message
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: MessageItem = {
      id: tempId,
      content,
      senderId: currentUserId,
      createdAt: new Date(),
      senderName: "You",
      senderAvatar: null,
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setTimeout(scrollToBottom, 50);

    const res = await sendMessage(activeId, content);
    setSending(false);

    if (res.success && res.message) {
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? (res.message as any) : m))
      );
      // Update sidebar latest message
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? {
                ...c,
                lastMessage: {
                  content,
                  createdAt: new Date(),
                  senderId: currentUserId,
                },
                updatedAt: new Date(),
              }
            : c
        )
      );
    }
  }

  const filteredConversations = conversations.filter((c) => {
    const name = c.otherUser?.profile?.displayName || c.otherUser?.name || "";
    const username = c.otherUser?.profile?.username || "";
    const q = searchTerm.toLowerCase();
    return name.toLowerCase().includes(q) || username.toLowerCase().includes(q);
  });

  return (
    <div className="card h-[calc(100vh-140px)] min-h-[500px] flex overflow-hidden border-white/10 bg-slate-900/60 backdrop-blur-xl">
      {/* Sidebar: Conversation List */}
      <div
        className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-white/10 bg-slate-950/40 shrink-0 ${
          mobileShowChat ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Search header */}
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search conversations..."
              className="input pl-9 w-full text-sm py-2 bg-white/5 border-white/10"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No conversations found</p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const displayName =
                conv.otherUser?.profile?.displayName || conv.otherUser?.name || "Peer";
              const username = conv.otherUser?.profile?.username;
              const institution = conv.otherUser?.profile?.institution;
              const isSelected = conv.id === activeId;

              return (
                <button
                  key={conv.id}
                  onClick={() => {
                    setActiveId(conv.id);
                    setMobileShowChat(true);
                  }}
                  className={`w-full p-4 flex items-start gap-3 text-left transition-colors relative ${
                    isSelected
                      ? "bg-blue-600/10 border-l-4 border-blue-500"
                      : "hover:bg-white/5"
                  }`}
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-md">
                    {displayName[0]?.toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-sm font-semibold truncate ${isSelected ? "text-white" : "text-slate-200"}`}>
                        {displayName}
                      </p>
                      {conv.lastMessage && (
                        <span className="text-[10px] text-slate-500 shrink-0">
                          {formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: false })}
                        </span>
                      )}
                    </div>

                    {institution && (
                      <p className="text-[11px] text-blue-400/80 truncate mt-0.5">
                        {institution}
                      </p>
                    )}

                    {conv.lastMessage && (
                      <p className={`text-xs truncate mt-1 ${conv.isUnread ? "text-white font-semibold" : "text-slate-400"}`}>
                        {conv.lastMessage.senderId === currentUserId ? "You: " : ""}
                        {conv.lastMessage.content}
                      </p>
                    )}
                  </div>

                  {conv.isUnread && (
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 self-center" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Panel */}
      <div
        className={`flex-1 flex flex-col min-w-0 bg-slate-900/30 ${
          !mobileShowChat ? "hidden md:flex" : "flex"
        }`}
      >
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-950/20 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileShowChat(false)}
                  className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center font-bold text-white text-sm">
                  {activeConversation.otherUser?.profile?.displayName?.[0]?.toUpperCase() ?? "P"}
                </div>

                <div>
                  <h2 className="font-bold text-white text-sm sm:text-base">
                    {activeConversation.otherUser?.profile?.displayName ?? "SkillBank Peer"}
                  </h2>
                  {activeConversation.otherUser?.profile?.institution && (
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <School className="w-3 h-3 text-blue-400" />
                      {activeConversation.otherUser.profile.institution}
                    </p>
                  )}
                </div>
              </div>

              {activeConversation.otherUser?.profile?.username && (
                <Link
                  href={`/profile/${activeConversation.otherUser.profile.username}`}
                  target="_blank"
                  className="btn btn-secondary btn-sm flex items-center gap-1.5 text-xs"
                >
                  <span>Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {/* Message Feed */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                  Loading chat history...
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 text-slate-400 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-white">Start the conversation</h3>
                  <p className="text-sm max-w-sm">
                    Say hello, coordinate time slots for a skill exchange, or discuss what you want to learn!
                  </p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.senderId === currentUserId;
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          isMe
                            ? "bg-blue-600 text-white rounded-br-xs"
                            : "bg-slate-800 text-slate-100 rounded-bl-xs border border-white/5"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.content}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 px-1">
                        {format(new Date(m.createdAt), "h:mm a")}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 sm:p-4 border-t border-white/10 bg-slate-950/30 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message..."
                disabled={sending}
                className="input flex-1 py-3 text-sm bg-white/5 border-white/10 focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || sending}
                className="btn btn-primary px-4 py-3 shrink-0 flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 text-slate-500">
            <MessageSquare className="w-14 h-14 mx-auto mb-3 opacity-30" />
            <p className="text-white font-medium">Select a conversation</p>
            <p className="text-sm mt-1">
              Choose an existing chat or visit a peer&apos;s profile to start messaging.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
