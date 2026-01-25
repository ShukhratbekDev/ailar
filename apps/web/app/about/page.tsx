import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Target, Users, Zap } from "lucide-react";

export const metadata: Metadata = {
    title: "Biz haqimizda - Ailar",
    description: "Ailar - O'zbekistondagi eng yirik sun'iy intellekt platformasi haqida ma'lumot",
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative py-20 md:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 pointer-events-none" />

                <div className="container mx-auto px-4 md:px-6 relative">
                    <div className="max-w-3xl mx-auto text-center space-y-6">
                        <h1 className="font-heading text-4xl md:text-6xl font-black tracking-tight">
                            Biz haqimizda
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            Ailar - O'zbekistonda sun'iy intellekt texnologiyalarini ommalashtirish va rivojlantirishga qaratilgan platforma
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16 border-t border-border/40">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="text-center space-y-4">
                                <div className="inline-flex p-4 rounded-2xl bg-primary/10">
                                    <Target className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="font-bold text-lg">Maqsadimiz</h3>
                                <p className="text-sm text-muted-foreground">
                                    AI texnologiyalarini har bir o'zbek foydalanuvchiga yetkazish
                                </p>
                            </div>

                            <div className="text-center space-y-4">
                                <div className="inline-flex p-4 rounded-2xl bg-primary/10">
                                    <Users className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="font-bold text-lg">Hamjamiyat</h3>
                                <p className="text-sm text-muted-foreground">
                                    AI sohasida qiziquvchilar uchun ochiq va do'stona muhit yaratish
                                </p>
                            </div>

                            <div className="text-center space-y-4">
                                <div className="inline-flex p-4 rounded-2xl bg-primary/10">
                                    <Zap className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="font-bold text-lg">Innovatsiya</h3>
                                <p className="text-sm text-muted-foreground">
                                    Eng so'nggi AI vositalari va yangiliklarni tezkor yetkazish
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-16 border-t border-border/40">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="max-w-3xl mx-auto prose prose-gray dark:prose-invert">
                        <h2 className="font-heading text-3xl font-bold mb-6">Bizning hikoyamiz</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Ailar 2024-yilda sun'iy intellekt texnologiyalari O'zbekistonda tobora ommalashib borayotgan bir paytda tashkil topdi.
                            Biz ko'plab o'zbek foydalanuvchilar uchun AI vositalari va ma'lumotlari ingliz tilida bo'lishi muammo ekanligini angladik.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            Shuning uchun biz o'zbek tilida AI katalogi, yangiliklar, promptlar va foydali ma'lumotlarni taqdim etuvchi
                            birinchi platformani yaratdik. Bugungi kunda Ailar minglab foydalanuvchilarga xizmat ko'rsatmoqda va
                            O'zbekistonda AI sohasining rivojlanishiga hissa qo'shmoqda.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 border-t border-border/40">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="max-w-2xl mx-auto text-center space-y-6">
                        <h2 className="font-heading text-3xl font-bold">Bizga qo'shiling</h2>
                        <p className="text-muted-foreground">
                            AI sohasida qiziqasizmi? Bizning hamjamiyatimizga qo'shiling va eng so'nggi yangiliklardan boxabar bo'ling.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Link
                                href="https://t.me/ailar_uz"
                                target="_blank"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                            >
                                Telegram kanalimiz
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium"
                            >
                                Aloqa
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
