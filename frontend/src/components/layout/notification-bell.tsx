import { Bell } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/providers/auth-provider"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface NotificationBellProps {
  className?: string
}

export function NotificationBell({ className }: NotificationBellProps) {
  const auth = useAuth()
  
  if (!auth?.user) return null
  
  return (
    <Link href="/notifications" className={cn("relative", className)}>
      <Bell className="h-5 w-5" />
      {auth.unreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]"
        >
          {auth.unreadCount > 99 ? '99+' : auth.unreadCount}
        </Badge>
      )}
    </Link>
  )
} 