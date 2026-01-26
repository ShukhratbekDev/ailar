'use client';

import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface SkillData {
    subject: string;
    A: number;
    fullMark: number;
}

interface SkillsRadarProps {
    data: SkillData[];
}

export function SkillsRadar({ data }: SkillsRadarProps) {
    if (!data || data.length === 0) {
        return (
            <Card className="rounded-[2.5rem] border-border/40 bg-card/40 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" /> Bilim Grafigi
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground text-sm font-light">
                    Ma&apos;lumot yetarli emas
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="rounded-[2.5rem] border-border/40 bg-card/40 backdrop-blur-xl overflow-hidden group">
            <CardHeader>
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" /> Bilim Grafigi
                </CardTitle>
            </CardHeader>
            <CardContent className="pb-8">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                            <PolarGrid stroke="#888888" strokeOpacity={0.1} />
                            <PolarAngleAxis
                                dataKey="subject"
                                tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 700 }}
                            />
                            <PolarRadiusAxis
                                angle={30}
                                domain={[0, 100]}
                                tick={false}
                                axisLine={false}
                            />
                            <Radar
                                name="Malaka"
                                dataKey="A"
                                stroke="#6366f1"
                                fill="#6366f1"
                                fillOpacity={0.3}
                                animationBegin={0}
                                animationDuration={1500}
                                animationEasing="ease-out"
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(0,0,0,0.8)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    color: '#fff'
                                }}
                                itemStyle={{ color: '#6366f1' }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                        Sizning AI sohasidagi malakangiz
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
