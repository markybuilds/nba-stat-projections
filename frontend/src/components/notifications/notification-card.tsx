import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"
import { 
  AlertCircle, 
  CheckCircle, 
  Info, 
  Trash, 
  Bell, 
  Clock, 
  ChevronRight,
  X,
  Check
} from "lucide-react"
import { Notification, NotificationType } from "@/lib/supabase"
import { useAuth } from "@/providers/auth-provider"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface NotificationCardProps {
  notification: Notification
  onDelete?: () => void
}

export function NotificationCard({ notification, onDelete }: NotificationCardProps) {
  const router = useRouter()
  const auth = useAuth()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isMarkingRead, setIsMarkingRead] = useState(false)
  
  if (!auth) return null
  
  const { markAsRead, deleteNotificationById } = auth
  
  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case "system":
        return <Bell className="h-5 w-5 text-blue-500" />
      case "alert":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "info":
        return <Info className="h-5 w-5 text-green-500" />
      case "update":
        return <CheckCircle className="h-5 w-5 text-purple-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }
  
  const handleClick = async () => {
    if (notification.url) {
      if (!notification.read) {
        setIsMarkingRead(true)
        await markAsRead(notification.id)
        setIsMarkingRead(false)
      }
      router.push(notification.url)
    }
  }
  
  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!notification.read) {
      setIsMarkingRead(true)
      await markAsRead(notification.id)
      setIsMarkingRead(false)
    }
  }
  
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDeleting(true)
    await deleteNotificationById(notification.id)
    setIsDeleting(false)
    if (onDelete) onDelete()
  }
  
  return (
    <Card 
      className={cn(
        "relative mb-3 transition-all cursor-pointer hover:bg-accent/50",
        !notification.read && "border-l-4 border-l-primary"
      )}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-1">
            {getTypeIcon(notification.type)}
          </div>
          <div className="flex-1">
            <h4 className={cn(
              "text-sm font-medium", 
              !notification.read && "font-semibold"
            )}>
              {notification.title}
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              {notification.message}
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-0 px-4 pb-3 justify-end gap-2">
        {!notification.read && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7" 
                  onClick={handleMarkAsRead}
                  disabled={isMarkingRead}
                >
                  {isMarkingRead ? (
                    <Clock className="h-4 w-4" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Mark as read</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-destructive hover:text-destructive" 
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Clock className="h-4 w-4" />
                ) : (
                  <Trash className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete notification</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {notification.url && (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </CardFooter>
    </Card>
  )
} 