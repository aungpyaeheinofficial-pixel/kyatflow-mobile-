
import { useState, useEffect } from 'react';
import { Bell, Check, Info, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { notificationApi } from '@/lib/api';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    is_read: boolean;
    created_at: string;
}

export function NotificationCenter() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { toast } = useToast();

    const fetchNotifications = async () => {
        try {
            const data = await notificationApi.getUnread();
            if (Array.isArray(data)) {
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.is_read).length);
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 60 seconds
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkRead = async (id: string) => {
        try {
            await notificationApi.markRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            toast({ title: "Error", description: "Failed to mark as read", variant: "destructive" });
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-[500px] overflow-y-auto">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && <span className="text-xs text-muted-foreground">{unreadCount} unread</span>}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        No notifications
                    </div>
                ) : (
                    notifications.map((n) => (
                        <DropdownMenuItem key={n.id} className="cursor-default focus:bg-transparent p-0 mb-1" onSelect={(e) => e.preventDefault()}>
                            <div className={cn(
                                "flex flex-col gap-1 p-3 w-full rounded-md border text-sm transition-colors",
                                !n.is_read ? "bg-accent/50 border-accent" : "bg-card border-transparent hover:bg-accent/10"
                            )}>
                                <div className="flex items-start gap-2">
                                    {n.type === 'warning' && <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />}
                                    {n.type === 'error' && <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />}
                                    {n.type === 'success' && <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />}
                                    {n.type === 'info' && <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />}

                                    <div className="flex-1">
                                        <div className="font-semibold">{n.title}</div>
                                        <div className="text-muted-foreground text-xs">{n.message}</div>
                                        <div className="text-[10px] text-muted-foreground mt-1 text-right">
                                            {new Date(n.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                                {!n.is_read && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-full text-xs mt-1"
                                        onClick={() => handleMarkRead(n.id)}
                                    >
                                        Mark as read
                                    </Button>
                                )}
                            </div>
                        </DropdownMenuItem>
                    ))
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
