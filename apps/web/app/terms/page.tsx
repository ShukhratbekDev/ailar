import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Foydalanish shartlari - Ailar",
    description: "Ailar platformasidan foydalanish shartlari va qoidalari",
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative py-20 md:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 pointer-events-none" />

                <div className="container mx-auto px-4 md:px-6 relative">
                    <div className="max-w-3xl mx-auto text-center space-y-6">
                        <h1 className="font-heading text-4xl md:text-6xl font-black tracking-tight">
                            Foydalanish shartlari
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
                            Ailar platformasidan foydalanish orqali siz ushbu foydalanish shartlariga rozilik bildirasiz.
                            Agar siz ushbu shartlarga rozi bo'lmasangiz, platformadan foydalanmang.
                        </p>

                        <h2>Xizmat tavsifi</h2>
                        <p>
                            Ailar - bu O'zbekistonda sun'iy intellekt texnologiyalari bo'yicha ma'lumot, vositalar va
                            yangiliklar taqdim etuvchi platformadir. Biz quyidagi xizmatlarni taqdim etamiz:
                        </p>
                        <ul>
                            <li>AI vositalari katalogi</li>
                            <li>AI sohasidagi yangiliklar</li>
                            <li>Foydali promptlar to'plami</li>
                            <li>Ta'lim materiallari va maqolalar</li>
                        </ul>

                        <h2>Foydalanuvchi majburiyatlari</h2>
                        <p>Platformadan foydalanishda siz quyidagilarga majbursiz:</p>
                        <ul>
                            <li>To'g'ri va aniq ma'lumotlar taqdim etish</li>
                            <li>O'z hisobingiz xavfsizligini ta'minlash</li>
                            <li>Platformadan qonuniy maqsadlarda foydalanish</li>
                            <li>Boshqa foydalanuvchilar huquqlarini hurmat qilish</li>
                            <li>Platformaning intellektual mulk huquqlarini hurmat qilish</li>
                        </ul>

                        <h2>Taqiqlangan harakatlar</h2>
                        <p>Quyidagi harakatlar qat'iyan man etiladi:</p>
                        <ul>
                            <li>Platformaga zarar yetkazishga urinish</li>
                            <li>Boshqa foydalanuvchilarning ma'lumotlarini o'g'irlash</li>
                            <li>Spam yoki noo'rin kontent yuborish</li>
                            <li>Platformadan avtomatlashtirilgan vositalar orqali noo'rin foydalanish</li>
                            <li>Yolg'on yoki chalg'ituvchi ma'lumotlar tarqatish</li>
                        </ul>

                        <h2>Intellektual mulk</h2>
                        <p>
                            Ailar platformasidagi barcha kontent, dizayn va kod intellektual mulk huquqlari bilan himoyalangan.
                            Platformadagi materiallardan shaxsiy, notijorat maqsadlarida foydalanishingiz mumkin, ammo
                            tijorat maqsadlarida foydalanish uchun ruxsat olish kerak.
                        </p>

                        <h2>Foydalanuvchi kontenti</h2>
                        <p>
                            Agar siz platformaga kontent yuklasangiz (masalan, izohlar, promptlar), siz quyidagilarga
                            rozilik bildirasiz:
                        </p>
                        <ul>
                            <li>Kontentga egalik huquqiga egasiz yoki uni joylashtirish huquqiga egasiz</li>
                            <li>Kontent qonun va axloq me'yorlariga mos keladi</li>
                            <li>Ailar kontentni platformada ko'rsatish va tarqatish huquqiga ega</li>
                        </ul>

                        <h2>Javobgarlikdan voz kechish</h2>
                        <p>
                            Ailar platformasi "bor holatida" taqdim etiladi. Biz platformaning uzluksiz ishlashini,
                            xatosizligini yoki ma'lum maqsadga muvofiqligini kafolatlamaymiz. Platformadan foydalanish
                            natijasida yuzaga kelgan har qanday zarar uchun javobgar emasmiz.
                        </p>

                        <h2>Uchinchi tomon havolalari</h2>
                        <p>
                            Platformada uchinchi tomon veb-saytlariga havolalar bo'lishi mumkin. Biz ushbu saytlar
                            kontenti uchun javobgar emasmiz va ularning maxfiylik siyosati yoki amaliyotlarini
                            nazorat qilmaymiz.
                        </p>

                        <h2>Hisobni to'xtatish</h2>
                        <p>
                            Biz ushbu shartlarni buzgan foydalanuvchilarning hisoblarini ogohlantirishsiz to'xtatish
                            yoki o'chirish huquqini saqlab qolamiz.
                        </p>

                        <h2>Shartlardagi o'zgarishlar</h2>
                        <p>
                            Biz vaqti-vaqti bilan ushbu foydalanish shartlarini yangilashimiz mumkin. Muhim o'zgarishlar
                            haqida foydalanuvchilar xabardor qilinadi. Platformadan foydalanishni davom ettirish orqali
                            siz yangilangan shartlarga rozilik bildirasiz.
                        </p>

                        <h2>Qonun va yurisdiktsiya</h2>
                        <p>
                            Ushbu shartlar O'zbekiston Respublikasi qonunlariga muvofiq tartibga solinadi. Har qanday
                            nizolar O'zbekiston Respublikasi sudlarida hal qilinadi.
                        </p>

                        <h2>Bog'lanish</h2>
                        <p>
                            Foydalanish shartlari bo'yicha savollaringiz bo'lsa, bizga{" "}
                            <a href="mailto:info@ailar.uz">info@ailar.uz</a> orqali murojaat qiling.
                        </p>

                    </div>
                </div>
            </section>
        </div>
    );
}
