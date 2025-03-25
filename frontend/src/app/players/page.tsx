import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getPlayers } from "@/lib/api";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/page-transition";

// Dynamically import the client component to reduce initial bundle size
const PlayersClient = dynamic(() => import("./players-client"), {
  loading: () => <PlayersLoading />,
  ssr: false // Disable server-side rendering for this component
});

// Generate static params for this page with revalidation every 12 hours (43200 seconds)
export const revalidate = 43200;

// Force static generation for this page at build time
export const dynamic = 'force-static';

// Add metadata for this page
export const metadata = {
  title: "Players - NBA Projections",
  description: "Browse NBA Players",
};

function PlayerCardSkeleton() {
  return (
    <Card className="overflow-hidden h-[140px]">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[120px]" />
            <div className="flex items-center gap-1">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-3 w-[40px]" />
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-4 w-6" />
        </div>
      </CardContent>
    </Card>
  );
}

function MobilePlayersLoading() {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <PlayerCardSkeleton key={i} />
      ))}
    </div>
  );
}

function DesktopPlayersLoading() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Players</CardTitle>
        <div className="flex flex-wrap gap-4 mt-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-[180px]" />
          <Skeleton className="h-10 w-[180px]" />
          <Skeleton className="h-10 w-36" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center py-3 border-b">
              <div className="flex items-center gap-2 w-1/3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
              <div className="flex items-center gap-2 w-1/4">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-[80px]" />
              </div>
              <div className="w-1/4">
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <div className="w-1/6 text-right">
                <Skeleton className="h-4 w-6 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function PlayersLoading() {
  return (
    <div className="space-y-4">
      <div className="md:block hidden">
        <DesktopPlayersLoading />
      </div>
      <div className="md:hidden block">
        <MobilePlayersLoading />
      </div>
    </div>
  );
}

export default async function PlayersPage() {
  // Fetch all players
  const players = await getPlayers();

  return (
    <PageTransition>
      <div className="container py-4 md:py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Players</h1>
        </div>
        
        <PlayersClient initialPlayers={players} />
      </div>
    </PageTransition>
  );
} 