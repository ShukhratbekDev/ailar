import { Metadata } from "next";
import { Mail, Send, MessageSquare } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Aloqa - Ailar",
    description: "Ailar bilan bog'lanish. Savollaringiz yoki takliflaringiz bo'lsa, biz bilan bog'laning",
};

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative py-20 md:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 pointer-events-none" />

                <div className="container mx-auto px-4 md:px-6 relative">
                    <div className="max-w-3xl mx-auto text-center space-y-6">
                        <h1 className="font-heading text-4xl md:text-6xl font-black tracking-tight">
                            Aloqa
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            Savollaringiz yoki takliflaringiz bo'lsa, biz bilan bog'laning. Biz har doim yordam berishga tayyormiz!
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Methods */}
            <section className="py-16 border-t border-border/40">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">

                        {/* Telegram */}
                        <Link
                            href="https://t.me/ailar_uz"
                            target="_blank"
                            className="group p-8 rounded-2xl border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10"
                        >
                            <div className="space-y-4">
                                <div className="inline-flex p-4 rounded-xl bg-blue-500/10 group-hover:bg-blue-500 transition-colors">
                                    <Send className="h-8 w-8 text-blue-500 group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="font-bold text-lg">Telegram</h3>
                                <p className="text-sm text-muted-foreground">
                                    Bizning rasmiy Telegram kanalimizga qo'shiling
                                </p>
                                <span className="text-sm text-primary font-medium">@ailar_uz →</span>
                            </div>
                        </Link>

                        {/* Email */}
                        <div className="p-8 rounded-2xl border border-border">
                            <div className="space-y-4">
                                <div className="inline-flex p-4 rounded-xl bg-primary/10">
                                    <Mail className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="font-bold text-lg">Email</h3>
                                <p className="text-sm text-muted-foreground">
                                    Bizga email orqali murojaat qiling
                                </p>
                                <a href="mailto:info@ailar.uz" className="text-sm text-primary font-medium hover:underline">
                                    info@ailar.uz
                                </a>
                            </div>
                        </div>

                        {/* Feedback */}
                        <div className="p-8 rounded-2xl border border-border">
                            <div className="space-y-4">
                                <div className="inline-flex p-4 rounded-xl bg-primary/10">
                                    <MessageSquare className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="font-bold text-lg">Fikr-mulohaza</h3>
                                <p className="text-sm text-muted-foreground">
                                    Platformani yaxshilash bo'yicha takliflaringizni yuboring
                                </p>
                                <span className="text-sm text-muted-foreground">
                                    Tez orada forma qo'shiladi
                                </span>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 border-t border-border/40">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="font-heading text-3xl font-bold mb-8 text-center">Tez-tez so'raladigan savollar</h2>

                        <div className="space-y-6">
                            <div className="p-6 rounded-xl border border-border">
                                <h3 className="font-bold mb-2">Ailar platformasi bepulmi?</h3>
                                <p className="text-sm text-muted-foreground">
                                    Ha, Ailar platformasining barcha asosiy xususiyatlari mutlaqo bepul. Biz AI texnologiyalarini
                                    barcha uchun ochiq qilishga intilamiz.
                                </p>
                            </div>

                            <div className="p-6 rounded-xl border border-border">
                                <h3 className="font-bold mb-2">Qanday qilib hissa qo'shishim mumkin?</h3>
                                <p className="text-sm text-muted-foreground">
                                    Agar sizda AI vositalari, yangiliklar yoki foydali ma'lumotlar bo'lsa, bizga Telegram yoki
                                    email orqali yuboring. Biz har doim hamjamiyat hissasini qadrlaymiz!
                                </p>
                            </div>

                            <div className="p-6 rounded-xl border border-border">
                                <h3 className="font-bold mb-2">Reklama joylash mumkinmi?</h3>
                                <p className="text-sm text-muted-foreground">
                                    Ha, Ailar platformasida reklama joylash imkoniyati mavjud. Batafsil ma'lumot uchun
                                    bizga email orqali murojaat qiling.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
