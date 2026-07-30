import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Crown, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

import { useAuth } from "@/hooks/useAuth";

const Leaderboard = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const { data } = await api.get('/leaderboard');
            console.log("Leaderboard data:", data);
            setUsers(data);
        } catch (error) {
            console.error("Error fetching leaderboard:", error);
            toast({
                title: "Error",
                description: "Could not load leaderboard.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0:
                return <Crown className="h-6 w-6 text-yellow-500 fill-yellow-500" />;
            case 1:
                return <Medal className="h-6 w-6 text-gray-400 fill-gray-400" />;
            case 2:
                return <Medal className="h-6 w-6 text-amber-700 fill-amber-700" />;
            default:
                return <span className="text-lg font-bold text-muted-foreground w-6 text-center">{index + 1}</span>;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Global Leaderboard</h1>
                <p className="text-muted-foreground">Top students competing for glory!</p>
            </div>

            <Card className="glass border-0 shadow-lg overflow-hidden">
                <CardHeader className="bg-primary/5 border-b border-border/50">
                    <div className="grid grid-cols-12 gap-4 font-semibold text-sm text-muted-foreground px-4">
                        <div className="col-span-2 md:col-span-1 text-center">Rank</div>
                        <div className="col-span-7 md:col-span-8">User</div>
                        <div className="col-span-3 text-right">XP</div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {users.map((user, index) => (
                        <div
                            key={user._id}
                            className={`grid grid-cols-12 gap-4 items-center p-4 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors ${index < 3 ? "bg-primary/5" : ""
                                }`}
                        >
                            <div className="col-span-2 md:col-span-1 flex justify-center">
                                {getRankIcon(index)}
                            </div>
                            <div className="col-span-7 md:col-span-8 flex items-center gap-3">
                                <Avatar className={`h-10 w-10 border-2 ${index === 0 ? 'border-yellow-500' : 'border-transparent'}`}>
                                    <AvatarFallback className="gradient-primary text-white">
                                        {user.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                                    <span className="font-semibold">{user.username || user.name}</span>
                                    {user.badges && user.badges.length > 0 && (
                                        <div className="flex gap-1">
                                            {user.badges.slice(0, 3).map((badge: string, i: number) => (
                                                <Badge key={i} variant="outline" className="text-[10px] h-5 px-1 bg-background/50">
                                                    {badge}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="col-span-3 text-right font-bold text-primary">
                                {user.xp} XP
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
};

export default Leaderboard;
