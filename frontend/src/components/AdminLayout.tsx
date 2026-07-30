import { Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Shield } from "lucide-react";

export const AdminLayout = () => {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-indigo-500/30">
            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <Outlet />
            </main>
        </div>
    );
};
