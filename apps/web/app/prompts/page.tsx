import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Copy, Terminal, Search } from "lucide-react";

export default function PromptsPage() {
    return (
        <div className="container py-8 space-y-8 mx-auto px-4 md:px-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Prompt Kutubxonasi</h1>
                    <p className="text-muted-foreground">Turli AI modellari uchun tayyor promptlar.</p>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-8" placeholder="Promptlarni izlash..." />
                </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
                {["Barchasi", "Dasturlash", "Marketing", "Dizayn", "Ta'lim", "Biznes"].map((cat, i) => (
                    <Button key={cat} variant={i === 0 ? "default" : "outline"} size="sm" className="whitespace-nowrap">
                        {cat}
                    </Button>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="flex flex-col">
                        <CardHeader>
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-primary/10 rounded-md text-primary">
                                        <Terminal className="h-4 w-4" />
                                    </div>
                                    <Badge variant="outline">Dasturlash</Badge>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Copy className="h-4 w-4" />
                                    <span className="sr-only">Nusxalash</span>
                                </Button>
                            </div>
                            <CardTitle className="mt-4">Kod refactoring ustasi</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="bg-muted p-4 rounded-md font-mono text-sm text-muted-foreground line-clamp-4">
                                You are an expert software engineer. Review the following code snippet and suggest improvements for readability, performance, and maintainability. Explain your reasoning for each suggestion.

                                Code:
                                [INSERT CODE HERE]
                            </div>
                        </CardContent>
                        <CardFooter>
                            <div className="flex gap-2 text-xs text-muted-foreground w-full">
                                <Badge variant="secondary" className="text-xs">ChatGPT</Badge>
                                <Badge variant="secondary" className="text-xs">Claude</Badge>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
