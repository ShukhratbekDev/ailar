import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Star } from "lucide-react";

export default function CatalogPage() {
    return (
        <div className="container py-8 space-y-8 mx-auto px-4 md:px-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">AI Katalog</h1>
                    <p className="text-muted-foreground">Eng so'nggi va foydali sun'iy intellekt vositalari.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-8" placeholder="Izlash..." />
                    </div>
                    <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {/* Placeholder items */}
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <Card key={i} className="flex flex-col">
                        <div className="aspect-video w-full bg-muted rounded-t-lg" />
                        <CardHeader className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <Badge variant="secondary" className="text-xs">Chatbot</Badge>
                                <div className="flex items-center text-yellow-500 text-xs font-medium">
                                    <Star className="h-3 w-3 fill-current mr-1" />
                                    4.8
                                </div>
                            </div>
                            <CardTitle className="text-lg">ChatGPT {i}</CardTitle>
                            <CardDescription className="line-clamp-2 text-sm">
                                OpenAI tomonidan yaratilgan kuchli til modeli. Har qanday savollarga javob bera oladi.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 mt-auto pt-0">
                            <Button className="w-full" variant="secondary">Batafsil</Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
