import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Maxfiylik siyosati - Ailar",
    description: "Ailar platformasining maxfiylik siyosati va foydalanuvchi ma'lumotlarini himoya qilish tamoyillari",
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative py-20 md:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 pointer-events-none" />

                <div className="container mx-auto px-4 md:px-6 relative">
                    <div className="max-w-3xl mx-auto text-center space-y-6">
                        <h1 className="font-heading text-4xl md:text-6xl font-black tracking-tight">
                            Maxfiylik siyosati
                        </h1>
                        <p className="text-muted-foreground">
                            Oxirgi yangilanish: 24-yanvar, 2026
                        </p>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="py-16 border-t border-border/40">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="max-w-3xl mx-auto prose prose-gray dark:prose-invert">

                        <h2>Kirish</h2>
                        <p>
                            Ailar platformasi sifatida biz foydalanuvchilarimizning maxfiyligini jiddiy qabul qilamiz.
                            Ushbu maxfiylik siyosati platformamizdan foydalanganingizda qanday ma'lumotlar to'planishi,
                            ulardan qanday foydalanilishi va himoya qilinishini tushuntiradi.
                        </p>

                        <h2>To'planadigan ma'lumotlar</h2>
                        <p>Biz quyidagi turdagi ma'lumotlarni to'playmiz:</p>
                        <ul>
                            <li><strong>Autentifikatsiya ma'lumotlari:</strong> Clerk autentifikatsiya xizmati orqali email manzil va profil ma'lumotlari</li>
                            <li><strong>Foydalanish ma'lumotlari:</strong> Platformadan qanday foydalanishingiz haqida umumiy statistika</li>
                            <li><strong>Cookie'lar:</strong> Tajribangizni yaxshilash uchun cookie'lardan foydalanamiz</li>
                        </ul>

                        <h2>Ma'lumotlardan foydalanish</h2>
                        <p>Yig'ilgan ma'lumotlar quyidagi maqsadlarda ishlatiladi:</p>
                        <ul>
                            <li>Platformaning to'g'ri ishlashini ta'minlash</li>
                            <li>Foydalanuvchi tajribasini yaxshilash</li>
                            <li>Xavfsizlikni ta'minlash</li>
                            <li>Statistik tahlil o'tkazish</li>
                        </ul>

                        <h2>Ma'lumotlarni himoya qilish</h2>
                        <p>
                            Biz foydalanuvchi ma'lumotlarini himoya qilish uchun zamonaviy xavfsizlik choralarini qo'llaymiz.
                            Ma'lumotlaringiz shifrlangan holda saqlanadi va faqat zarur hollarda ishlatiladi.
                        </p>

                        <h2>Uchinchi tomon xizmatlari</h2>
                        <p>Ailar quyidagi uchinchi tomon xizmatlaridan foydalanadi:</p>
                        <ul>
                            <li><strong>Clerk:</strong> Autentifikatsiya va foydalanuvchi boshqaruvi</li>
                            <li><strong>Vercel:</strong> Hosting va deploy</li>
                            <li><strong>Neon:</strong> Ma'lumotlar bazasi</li>
                        </ul>
                        <p>
                            Ushbu xizmatlarning har biri o'z maxfiylik siyosatiga ega va biz ularning xavfsizlik
                            standartlariga ishonch bildiramiz.
                        </p>

                        <h2>Cookie'lar</h2>
                        <p>
                            Biz platformaning ishlashi va foydalanuvchi tajribasini yaxshilash uchun cookie'lardan foydalanamiz.
                            Brauzer sozlamalarida cookie'larni o'chirib qo'yishingiz mumkin, ammo bu ba'zi funksiyalarning
                            ishlashiga ta'sir qilishi mumkin.
                        </p>

                        <h2>Foydalanuvchi huquqlari</h2>
                        <p>Siz quyidagi huquqlarga egasiz:</p>
                        <ul>
                            <li>O'z ma'lumotlaringizga kirish</li>
                            <li>Ma'lumotlarni yangilash yoki o'chirish</li>
                            <li>Ma'lumotlar to'plashga rozi bo'lmaslik</li>
                            <li>Hisobingizni o'chirish</li>
                        </ul>

                        <h2>Bolalar maxfiyligi</h2>
                        <p>
                            Ailar platformasi 13 yoshdan kichik bolalar uchun mo'ljallanmagan. Biz ongli ravishda
                            13 yoshdan kichik bolalardan shaxsiy ma'lumotlar to'plamaymiz.
                        </p>

                        <h2>Siyosatdagi o'zgarishlar</h2>
                        <p>
                            Biz vaqti-vaqti bilan ushbu maxfiylik siyosatini yangilashimiz mumkin. Barcha o'zgarishlar
                            ushbu sahifada e'lon qilinadi va yangilanish sanasi ko'rsatiladi.
                        </p>

                        <h2>Bog'lanish</h2>
                        <p>
                            Agar maxfiylik siyosati bo'yicha savollaringiz bo'lsa, bizga{" "}
                            <a href="mailto:info@ailar.uz">info@ailar.uz</a> orqali murojaat qiling.
                        </p>

                    </div>
                </div>
            </section>
        </div>
    );
}
