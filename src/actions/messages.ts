"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getConversations() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated", conversations: [] };

  const userId = session.user.id;

  try {
    const participants = await prisma.conversationParticipant.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            participants: {
              where: { userId: { not: userId } },
              include: {
                user: {
                  include: {
                    profile: true,
                  },
                },
              },
            },
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
      },
      orderBy: { conversation: { updatedAt: "desc" } },
    });

    const formatted = participants.map((p) => {
      const otherParticipant = p.conversation.participants[0]?.user;
      const lastMessage = p.conversation.messages[0] || null;
      const isUnread =
        lastMessage &&
        lastMessage.senderId !== userId &&
        (!p.lastReadAt || new Date(p.lastReadAt) < new Date(lastMessage.createdAt));

      return {
        id: p.conversationId,
        updatedAt: p.conversation.updatedAt,
        otherUser: otherParticipant
          ? {
              id: otherParticipant.id,
              name: otherParticipant.name,
              profile: otherParticipant.profile,
            }
          : null,
        lastMessage: lastMessage
          ? {
              content: lastMessage.content,
              createdAt: lastMessage.createdAt,
              senderId: lastMessage.senderId,
            }
          : null,
        isUnread: Boolean(isUnread),
      };
    });

    return { success: true, conversations: formatted };
  } catch (error) {
    console.error("getConversations error:", error);
    return { success: false, error: "Failed to fetch conversations", conversations: [] };
  }
}

export async function getOrCreateConversation(otherUserId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const currentUserId = session.user.id;
  if (currentUserId === otherUserId) {
    return { success: false, error: "Cannot create conversation with yourself" };
  }

  try {
    // Find shared conversation
    const existing = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: currentUserId } } },
          { participants: { some: { userId: otherUserId } } },
        ],
      },
    });

    if (existing) {
      return { success: true, conversationId: existing.id };
    }

    // Create new conversation with 2 participants
    const newConv = await prisma.conversation.create({
      data: {
        participants: {
          create: [
            { userId: currentUserId },
            { userId: otherUserId },
          ],
        },
      },
    });

    revalidatePath("/messages");
    return { success: true, conversationId: newConv.id };
  } catch (error) {
    console.error("getOrCreateConversation error:", error);
    return { success: false, error: "Failed to start conversation" };
  }
}

export async function getMessages(conversationId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated", messages: [] };

  const userId = session.user.id;

  try {
    // Verify participant
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });

    if (!participant) {
      return { success: false, error: "Not authorized to view this conversation", messages: [] };
    }

    // Update lastReadAt
    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
      data: { lastReadAt: new Date() },
    });

    const messages = await prisma.message.findMany({
      where: { conversationId, isDeleted: false },
      orderBy: { createdAt: "asc" },
      take: 100,
      include: {
        sender: {
          include: { profile: true },
        },
      },
    });

    return {
      success: true,
      messages: messages.map((m) => ({
        id: m.id,
        content: m.content,
        senderId: m.senderId,
        createdAt: m.createdAt,
        senderName: m.sender.profile?.displayName || m.sender.name || "User",
        senderAvatar: m.sender.profile?.avatar || null,
      })),
    };
  } catch (error) {
    console.error("getMessages error:", error);
    return { success: false, error: "Failed to fetch messages", messages: [] };
  }
}

export async function sendMessage(conversationId: string, content: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const trimmed = content.trim();
  if (!trimmed) return { success: false, error: "Message cannot be empty" };

  const userId = session.user.id;

  try {
    // Verify participant
    const participants = await prisma.conversationParticipant.findMany({
      where: { conversationId },
      include: { user: { include: { profile: true } } },
    });

    const isMember = participants.some((p) => p.userId === userId);
    if (!isMember) return { success: false, error: "Not authorized in this conversation" };

    const senderProfile = participants.find((p) => p.userId === userId)?.user.profile;
    const senderName = senderProfile?.displayName || session.user.name || "A user";

    // Create message & update conversation timestamp
    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId,
          senderId: userId,
          content: trimmed,
        },
      }),
      prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      }),
      prisma.conversationParticipant.update({
        where: { conversationId_userId: { conversationId, userId } },
        data: { lastReadAt: new Date() },
      }),
    ]);

    // Send notifications to other participants
    const otherParticipants = participants.filter((p) => p.userId !== userId);
    for (const other of otherParticipants) {
      await prisma.notification.create({
        data: {
          userId: other.userId,
          type: "NEW_MESSAGE",
          title: `New message from ${senderName}`,
          body: trimmed.slice(0, 100),
          link: `/messages?id=${conversationId}`,
        },
      });
    }

    revalidatePath("/messages");
    return {
      success: true,
      message: {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        createdAt: message.createdAt,
        senderName,
        senderAvatar: senderProfile?.avatar || null,
      },
    };
  } catch (error) {
    console.error("sendMessage error:", error);
    return { success: false, error: "Failed to send message" };
  }
}
