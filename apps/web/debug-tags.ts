
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { db } from "./db";
import { news } from "./db/schema";

async function debugTags() {
    try {
        const allNews = await db.query.news.findMany();
        console.log("Total news count:", allNews.length);
        allNews.forEach(n => {
            console.log(`ID: ${n.id} | Title: ${n.title} | Tags:`, n.tags);
        });
    } catch (e) {
        console.error(e);
    }
}

debugTags();
