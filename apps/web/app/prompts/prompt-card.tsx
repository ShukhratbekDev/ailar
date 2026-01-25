"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Terminal, Check, CheckCircle2 } from "lucide-react";

interface Prompt {
    id: number;
    title: string;
    prompt: string | null;
    category: string | null;
    tool?: string | null;
    tags?: string[] | null;
}

export function PromptCard({ prompt }: { prompt: Prompt }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (prompt.prompt) {
            navigator.clipboard.writeText(prompt.prompt);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <Card className="flex flex-col border-border/50 hover:border-border hover:shadow-xl transition-all duration-300 group bg-card/40 backdrop-blur-sm overflow-hidden h-full">
            <CardHeader className="p-4 pb-3">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-600">
                            <Terminal className="h-4 w-4" />
                        </div>
                        <Badge variant="secondary" className="text-[10px] uppercase tracking-wider bg-purple-500/10 text-purple-600 border-0">
                            {prompt.category || "Umumiy"}
                        </Badge>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 transition-all duration-300 ${copied ? 'text-emerald-500 bg-emerald-500/10' : 'hover:bg-purple-500/10 hover:text-purple-600'}`}
                        onClick={handleCopy}
                    >
                        {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        <span className="sr-only">Nusxalash</span>
                    </Button>
                </div>
                <CardTitle className="text-xl group-hover:text-purple-600 transition-colors line-clamp-1 mb-2">
                    {prompt.title}
                </CardTitle>
                {prompt.tags && prompt.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                        {prompt.tags.map((tag, idx) => (
                            <span key={idx} className="text-[9px] text-muted-foreground/60">#{tag}</span>
                        ))}
                    </div>
                )}
            </CardHeader>

            <CardContent className="p-4 py-3 flex-1">
                <div className="bg-muted/30 p-4 rounded-xl font-mono text-[10px] text-muted-foreground line-clamp-4 leading-relaxed border border-border/10 group-hover:bg-muted/50 transition-colors h-24 overflow-hidden">
                    {prompt.prompt}
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-3 border-t border-border/10 bg-muted/5 mt-auto">
                <div className="flex items-center justify-between w-full">
                    <div className="flex gap-1.5">
                        {prompt.tool && (
                            <Badge variant="outline" className="text-[10px] border-border/50 text-muted-foreground">
                                {prompt.tool}
                            </Badge>
                        )}
                        {!prompt.tool && <Badge variant="outline" className="text-[10px] border-border/50 text-muted-foreground">Universal</Badge>}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                        <Check className="h-3.5 w-3.5" />
                        Active
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}
