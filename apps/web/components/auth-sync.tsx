import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function AuthSync() {
    const user = await currentUser();
    if (!user) return null;

    try {
        const email = user.emailAddresses[0]?.emailAddress ?? "";
        const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || email;
        const imageUrl = user.imageUrl;

        // Check if user exists
        const dbUser = await db.query.users.findFirst({
            where: eq(users.id, user.id),
        });

        if (!dbUser) {
            await db.insert(users).values({
                id: user.id,
                email,
                fullName,
                imageUrl,
                role: "USER",
            });
            console.log(`User created in DB: ${user.id}`);
        } else if (dbUser.email !== email || dbUser.fullName !== fullName || dbUser.imageUrl !== imageUrl) {
            await db.update(users)
                .set({ email, fullName, imageUrl })
                .where(eq(users.id, user.id));
            console.log(`User updated in DB: ${user.id}`);
        }
    } catch (error) {
        console.error("AuthSync Error:", error);
    }

    return null; // This component renders nothing
}
