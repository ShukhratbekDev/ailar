import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Bot, Newspaper, Terminal, Send } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero */}
      <section className="flex-1 py-12 md:py-24 lg:py-32 flex flex-col items-center text-center space-y-4 px-4 md:px-6 bg-gradient-to-b from-background to-muted/50">
        <Badge variant="secondary" className="mb-2">
          O'zbek tilidagi #1 AI Portal
        </Badge>
        <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
          Sun'iy Intellekt Dunyosini Kashf Eting
        </h1>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
          Eng so'nggi AI vositalari, yangiliklar va promptlar to'plami. Barchasi o'zbek tilida.
        </p>
        <div className="w-full max-w-sm space-y-2 pt-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8" placeholder="AI vositalarni qidirish..." type="search" />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container px-4 md:px-6 py-12 space-y-12 mx-auto">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <Bot className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>AI Katalog</CardTitle>
              <CardDescription>
                Yuzlab AI vositalari to'plami. Har bir vosita uchun batafsil qo'llanma va sharhlar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full justify-start pl-0">
                Katalogni ko'rish &rarr;
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Newspaper className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>AI Yangiliklar</CardTitle>
              <CardDescription>
                Texnologiya olamidagi eng so'nggi yangiliklar va tahliliy maqolalar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full justify-start pl-0">
                O'qishni boshlash &rarr;
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Terminal className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Prompt Kutubxonasi</CardTitle>
              <CardDescription>
                ChatGPT, Midjourney va boshqa modellar uchun tayyor promptlar toplami.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full justify-start pl-0">
                Promptlarni izlash &rarr;
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Newsletter */}
      <section className="container px-4 md:px-6 py-12 md:py-24 lg:py-32 mx-auto">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Telegram kanalimizga obuna bo'ling
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Eng qizg'in yangiliklar va eksklyuziv kontentlarni telegram kanalimizda kuzatib boring.
            </p>
          </div>
          <Button size="lg" className="gap-2">
            <Send className="h-4 w-4" /> Telegramga o'tish
          </Button>
        </div>
      </section>

      <footer className="py-6 w-full shrink-0 items-center px-4 md:px-6 border-t mt-auto">
        <p className="text-xs text-center text-muted-foreground">
          © 2026 Ailar. Barcha huquqlar himoyalangan.
        </p>
      </footer>
    </main>
  );
}
