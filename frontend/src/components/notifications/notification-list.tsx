import { useEffect, useState, useCallback } from "react"
import { useInView } from "react-intersection-observer"
import { Notification, NotificationType } from "@/lib/supabase"
import { useAuth } from "@/providers/auth-provider"
import { NotificationCard } from "./notification-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Inbox, Trash, Check } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"

const ITEMS_PER_PAGE = 10

interface NotificationListProps {
  filterType?: NotificationType
  showReadUnreadTabs?: boolean
}

export function NotificationList({ 
  filterType,
  showReadUnreadTabs = true 
}: NotificationListProps) {
  const auth = useAuth()
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all")
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  
  const { ref: loadMoreRef, inView } = useInView()
  
  const loadNotifications = useCallback(
    async (reset = false) => {
      if (!auth) return
      
      const newOffset = reset ? 0 : offset
      const isUnreadFilter = activeTab === "unread"
      
      await auth.getMoreNotifications({
        limit: ITEMS_PER_PAGE,
        offset: newOffset,
        type: filterType,
        read: isUnreadFilter ? false : undefined
      })
      
      // If we got fewer items than requested, there are no more to load
      if (auth.notifications.length < newOffset + ITEMS_PER_PAGE) {
        setHasMore(false)
      } else {
        setOffset(newOffset + ITEMS_PER_PAGE)
        setHasMore(true)
      }
      
      setIsInitialLoad(false)
    },
    [auth, offset, activeTab, filterType]
  )
  
  // Initial load
  useEffect(() => {
    if (auth) {
      loadNotifications(true)
    }
  }, [auth, filterType, activeTab])
  
  // Infinite loading
  useEffect(() => {
    if (inView && hasMore && !isInitialLoad && auth) {
      loadNotifications()
    }
  }, [inView, hasMore, isInitialLoad, loadNotifications, auth])
  
  // Tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value as "all" | "unread")
    setOffset(0)
    setHasMore(true)
    setIsInitialLoad(true)
  }
  
  const handleMarkAllAsRead = async () => {
    if (!auth) return
    
    await auth.markAllAsRead()
    
    // If on unread tab, reset the list
    if (activeTab === "unread") {
      setOffset(0)
      setIsInitialLoad(true)
      loadNotifications(true)
    }
  }
  
  const handleClearAll = async () => {
    if (!auth) return
    
    await auth.clearAllNotifications()
    setOffset(0)
    setIsInitialLoad(true)
    loadNotifications(true)
  }
  
  if (!auth) return null
  
  const { notifications, loadingNotifications, unreadCount } = auth
  
  const renderNotifications = () => {
    if (loadingNotifications && isInitialLoad) {
      return Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full mb-3" />
      ))
    }
    
    if (notifications.length === 0) {
      return (
        <EmptyState
          icon={<Inbox className="h-12 w-12" />}
          title="No notifications"
          description="You don't have any notifications yet."
        />
      )
    }
    
    return (
      <>
        {notifications.map((notification) => (
          <NotificationCard 
            key={notification.id} 
            notification={notification} 
          />
        ))}
        
        {/* Loading more indicator */}
        {loadingNotifications && !isInitialLoad && (
          <div className="my-4">
            <Skeleton className="h-24 w-full" />
          </div>
        )}
        
        {/* Load more trigger */}
        {hasMore && !loadingNotifications && (
          <div ref={loadMoreRef} className="h-1" />
        )}
        
        {/* End of list message */}
        {!hasMore && notifications.length > 0 && (
          <p className="text-center text-sm text-muted-foreground my-4">
            No more notifications to load
          </p>
        )}
      </>
    )
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {showReadUnreadTabs ? (
          <Tabs 
            defaultValue="all" 
            value={activeTab} 
            onValueChange={handleTabChange}
            className="w-full flex flex-col"
          >
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">
                  Unread {unreadCount > 0 && `(${unreadCount})`}
                </TabsTrigger>
              </TabsList>
              
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleMarkAllAsRead}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Mark all read
                  </Button>
                )}
                
                {notifications.length > 0 && (
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={handleClearAll}
                  >
                    <Trash className="h-4 w-4 mr-1" />
                    Clear all
                  </Button>
                )}
              </div>
            </div>
            
            <TabsContent value="all" className="mt-4">
              {renderNotifications()}
            </TabsContent>
            
            <TabsContent value="unread" className="mt-4">
              {renderNotifications()}
            </TabsContent>
          </Tabs>
        ) : (
          <>
            <div className="flex-1">
              {unreadCount > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleMarkAllAsRead}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>
            {renderNotifications()}
          </>
        )}
      </div>
    </div>
  )
} 