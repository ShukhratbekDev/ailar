import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowRight } from "lucide-react";

export default function NewsPage() {
    return (
        <div className="container py-8 space-y-8 mx-auto px-4 md:px-6">
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold tracking-tight">AI Yangiliklar</h1>
                <p className="text-muted-foreground">Texnologiya olamidagi eng qaynoq yangiliklar.</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Featured News */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="overflow-hidden">
                        <div className="aspect-[21/9] w-full bg-muted" />
                        <CardHeader>
                            <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                                <Badge>Asosiy</Badge>
                                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> 20 Yanvar, 2026</span>
                            </div>
                            <CardTitle className="text-2xl">OpenAI Yangi GPT-5 Modelini E'lon Qildi</CardTitle>
                            <CardDescription className="text-base">
                                Yangi model oldingilariga qaraganda 10 barobar tezroq va aniqroq ishlash qobiliyatiga ega.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button>O'qishni davom ettirish <ArrowRight className="ml-2 h-4 w-4" /></Button>
                        </CardContent>
                    </Card>

                    <div className="grid gap-6 sm:grid-cols-2">
                        {[1, 2, 3, 4].map((i) => (
                            <Card key={i}>
                                <div className="aspect-video w-full bg-muted rounded-t-lg" />
                                <CardHeader className="p-4">
                                    <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                                        <span>19 Yanvar</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 5 daqiqa</span>
                                    </div>
                                    <CardTitle className="text-lg">AI Tasvir Generatsiyasi {i}</CardTitle>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ommabop Mavzular</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                            {["ChatGPT", "Midjourney", "Google Gemini", "AI Startup", "Robotics", "Code Assistant"].map((tag) => (
                                <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                                    #{tag}
                                </Badge>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
