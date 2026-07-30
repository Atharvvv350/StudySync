import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const ADMIN_ID = "500119480";

export const AdminGate = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [inputID, setInputID] = useState("");
    const { toast } = useToast();
    const { user, loading } = useAuth();

    if (loading) return null;

    // Strict Role Check: If not admin, redirect immediately
    if (!user || user.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputID === ADMIN_ID) {
            setIsAuthenticated(true);
            toast({
                title: "Access Granted",
                description: "Welcome to the Admin Dashboard.",
            });
        } else {
            toast({
                title: "Access Denied",
                description: "Invalid Admin ID.",
                variant: "destructive",
            });
            setInputID("");
        }
    };

    if (isAuthenticated) {
        return <Outlet />;
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 animate-fade-in">
            <Card className="w-full max-w-md bg-card border-border shadow-2xl">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center">
                        <Shield className="h-8 w-8 text-indigo-500" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl text-foreground">Admin Access</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Enter your SAP ID to verify your identity.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="password"
                                    placeholder="Enter Admin ID"
                                    value={inputID}
                                    onChange={(e) => setInputID(e.target.value)}
                                    className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-indigo-500"
                                />
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            Verify Access
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
