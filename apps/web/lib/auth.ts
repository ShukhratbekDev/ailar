import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export type UserRole = "ADMIN" | "EDITOR" | "USER";

export async function getUserRole() {
    const { userId } = await auth();
    if (!userId) return null;

    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
    });

    return (user?.role as UserRole) ?? "USER";
}

export async function isAdmin() {
    const role = await getUserRole();
    return role === "ADMIN";
}

export async function isEditor() {
    const role = await getUserRole();
    return role === "ADMIN" || role === "EDITOR";
}
