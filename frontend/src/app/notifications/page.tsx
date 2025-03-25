"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  PageHeader, 
  PageHeaderDescription, 
  PageHeaderHeading 
} from "@/components/page-header"
import { Shell } from "@/components/shell"
import { NotificationList } from "@/components/notifications/notification-list"
import { useAuth } from "@/providers/auth-provider"
import { Skeleton } from "@/components/ui/skeleton"

export default function NotificationsPage() {
  const router = useRouter()
  const auth = useAuth()
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!auth?.isLoading && !auth?.user) {
      router.push("/login?callbackUrl=/notifications")
    }
  }, [auth?.isLoading, auth?.user, router])
  
  // Show loading state
  if (auth?.isLoading || !auth?.user) {
    return (
      <Shell variant="sidebar">
        <PageHeader>
          <PageHeaderHeading>Notifications</PageHeaderHeading>
          <PageHeaderDescription>
            Your notifications and alerts
          </PageHeaderDescription>
        </PageHeader>
        <div className="space-y-4 mt-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </Shell>
    )
  }
  
  return (
    <Shell variant="sidebar">
      <PageHeader>
        <PageHeaderHeading>Notifications</PageHeaderHeading>
        <PageHeaderDescription>
          Your notifications and alerts
        </PageHeaderDescription>
      </PageHeader>
      
      <div className="mt-6">
        <NotificationList />
      </div>
    </Shell>
  )
} 