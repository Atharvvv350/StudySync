import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Outlet } from "react-router-dom";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { NavLink } from "@/components/NavLink";
import { LayoutDashboard, BookOpen, GraduationCap, MessageSquare, Trophy, User, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();

  const NavItem = ({ to, icon: Icon, children }: { to: string; icon: any; children: React.ReactNode }) => (
    <NavLink
      to={to}
      onClick={() => setSidebarOpen(false)}
      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-all"
      activeClassName="bg-primary/10 text-primary font-semibold"
    >
      <Icon className="h-5 w-5" />
      {children}
    </NavLink>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar onMenuClick={() => setSidebarOpen(true)} showMenuButton hideGetStarted showUserControls />

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0 flex flex-col h-full bg-background/95 backdrop-blur-xl border-r border-border/50">

          {/* Header */}
          <div className="p-6 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
                S
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent gradient-primary">
                StudySync
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
            <NavItem to="/dashboard" icon={LayoutDashboard}>Dashboard</NavItem>
            <NavItem to="/materials" icon={BookOpen}>Study Materials</NavItem>
            <NavItem to="/quiz" icon={GraduationCap}>Quizzes</NavItem>
            <NavItem to="/forum" icon={MessageSquare}>Forum</NavItem>
            <NavItem to="/leaderboard" icon={Trophy}>Leaderboard</NavItem>
            {useAuth().user?.role === 'admin' && (
              <NavItem to="/admin/materials" icon={Shield}>Admin Dashboard</NavItem>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border/50 bg-muted/20">
            <div className="space-y-2">
              <NavItem to="/profile" icon={User}>My Profile</NavItem>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-4 py-3 text-red-500 hover:text-red-600 hover:bg-red-500/10 h-auto font-medium"
                onClick={() => {
                  setSidebarOpen(false);
                  logout();
                }}
              >
                <LogOut className="h-5 w-5" />
                Logout
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <div className="pt-16">
        <div className="container mx-auto px-4 py-8">
          <Outlet />
        </div>
      </div>

    </div>
  );
};
