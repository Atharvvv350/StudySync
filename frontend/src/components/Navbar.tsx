import { useState, useEffect } from "react";
import { Bell, Menu, User, Check, Trash2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import api from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

interface NavbarProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
  hideGetStarted?: boolean;
  showUserControls?: boolean;
}

import { useAuth } from "@/hooks/useAuth";
import { ModeToggle } from "@/components/mode-toggle";

export const Navbar = ({ onMenuClick, showMenuButton = false, hideGetStarted = false, showUserControls = true }: NavbarProps) => {
  const { logout } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (showUserControls) {
      fetchNotifications();
      // Poll for notifications every minute
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [showUserControls]);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.isRead).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Ideally backend should have an endpoint for this, but for now loop or just refresh
      // Assuming we implement a loop or a bulk update if backend supports it.
      // For now, let's just optimistically update UI and maybe call read on unread ones.
      const unreadIds = notifications.filter(n => !n.isRead).map(n => n._id);
      await Promise.all(unreadIds.map(id => api.put(`/notifications/${id}/read`)));

      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            {showMenuButton && (
              <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <NavLink to="/" className="flex items-center gap-2">
              <img src="/icon.png" alt="StudySync" className="w-8 h-8 rounded-lg" />
              <span className="text-xl font-extrabold text-primary tracking-tight">
                StudySync
              </span>
            </NavLink>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <NavLink
              to="/dashboard"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-primary"
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/materials"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-primary"
            >
              Study Materials
            </NavLink>
            <NavLink
              to="/quiz"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-primary"
            >
              Quizzes
            </NavLink>
            <NavLink
              to="/forum"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-primary"
            >
              Forum
            </NavLink>
            <NavLink
              to="/leaderboard"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-primary"
            >
              Leaderboard
            </NavLink>
            {useAuth().user?.role === 'admin' && (
              <NavLink
                to="/admin/materials"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                activeClassName="text-primary"
              >
                Admin
              </NavLink>
            )}
          </div>

          <div className="flex items-center gap-2">
            {showUserControls && (
              <>
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full animate-pulse"></span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="end">
                    <div className="flex items-center justify-between p-4 border-b">
                      <h4 className="font-semibold">Notifications</h4>
                      {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-auto p-1">
                          Mark all read
                        </Button>
                      )}
                    </div>
                    <ScrollArea className="h-[300px]">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground text-sm">
                          No notifications yet.
                        </div>
                      ) : (
                        <div className="divide-y">
                          {notifications.map((notification) => (
                            <div
                              key={notification._id}
                              className={`p-4 hover:bg-muted/50 transition-colors ${!notification.isRead ? 'bg-muted/20' : ''}`}
                              onClick={() => !notification.isRead && markAsRead(notification._id)}
                            >
                              <div className="flex gap-3">
                                <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!notification.isRead ? 'bg-primary' : 'bg-transparent'}`} />
                                <div className="space-y-1">
                                  <p className={`text-sm ${!notification.isRead ? 'font-medium' : 'text-muted-foreground'}`}>
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </PopoverContent>
                </Popover>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="hidden md:flex">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem>
                      <NavLink to="/profile" className="w-full">Profile</NavLink>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-500">
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            <ModeToggle />

            {!hideGetStarted && (
              <NavLink to="/login">
                <Button variant="default" className="hidden sm:flex gradient-primary border-0">
                  Get Started
                </Button>
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
