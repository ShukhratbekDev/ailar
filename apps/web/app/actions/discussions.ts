'use server';

import { db } from "@/db";
import { discussions, notifications, discussionLikes } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { isEditor } from "@/lib/auth";
import { auth, currentUser } from "@clerk/nextjs/server";

export type DiscussionTargetType = 'lesson' | 'news' | 'tool';

export async function addDetailedDiscussion(params: {
    targetType: DiscussionTargetType;
    targetId: number;
    content: string;
    parentId?: number;
}) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const userName = `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`.trim() || "Foydalanuvchi";
    const userImage = user.imageUrl;

    const { targetType, targetId, content, parentId } = params;

    await db.insert(discussions).values({
        lessonId: targetType === 'lesson' ? targetId : null,
        newsId: targetType === 'news' ? targetId : null,
        toolId: targetType === 'tool' ? targetId : null,
        userId: user.id,
        userName,
        userImage,
        content,
        parentId
    });

    // Notify parent author if it's a reply
    if (parentId) {
        const parentComment = await db.query.discussions.findFirst({
            where: eq(discussions.id, parentId)
        });

        if (parentComment && parentComment.userId !== user.id) {
            await db.insert(notifications).values({
                userId: parentComment.userId,
                type: 'reply',
                title: 'Yangi javob',
                message: `${userName} sizning izohingizga javob yozdi.`,
                isRead: false
            });
        }
    }

    if (targetType === 'lesson') {
        revalidatePath(`/learn`, 'layout');
    } else if (targetType === 'news') {
        revalidatePath(`/news`, 'layout');
    } else if (targetType === 'tool') {
        revalidatePath(`/tools`, 'layout');
    }

    return { success: true };
}

export async function deleteDetailedDiscussion(id: number) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const comment = await db.query.discussions.findFirst({
        where: eq(discussions.id, id)
    });

    if (!comment) throw new Error("Topilmadi");

    const hasPermission = await isEditor();
    if (comment.userId !== userId && !hasPermission) {
        throw new Error("Ruxsat berilmagan");
    }

    await db.delete(discussions).where(eq(discussions.id, id));

    // Rudimentary revalidation
    revalidatePath(`/learn`, 'layout');
    revalidatePath(`/news`, 'layout');
    revalidatePath(`/tools`, 'layout');

    return { success: true };
}

export async function toggleDetailedDiscussionLike(discussionId: number) {
    const { userId } = await auth();
    if (!userId) throw new Error("Avval tizimga kiring");

    try {
        const existingLike = await db.query.discussionLikes.findFirst({
            where: and(
                eq(discussionLikes.discussionId, discussionId),
                eq(discussionLikes.userId, userId)
            )
        });

        if (existingLike) {
            await db.delete(discussionLikes).where(
                and(
                    eq(discussionLikes.discussionId, discussionId),
                    eq(discussionLikes.userId, userId)
                )
            );
            await db.update(discussions)
                .set({ upvotes: sql`${discussions.upvotes} - 1` })
                .where(eq(discussions.id, discussionId));
        } else {
            await db.insert(discussionLikes).values({
                discussionId,
                userId,
                createdAt: new Date()
            });
            await db.update(discussions)
                .set({ upvotes: sql`${discussions.upvotes} + 1` })
                .where(eq(discussions.id, discussionId));
        }

        revalidatePath('/learn', 'layout');
        revalidatePath('/news', 'layout');
        revalidatePath('/tools', 'layout');
        return { success: true, liked: !existingLike };
    } catch (error) {
        console.error("Like error:", error);
        throw new Error("Xatolik yuz berdi");
    }
}
