import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getGames } from "@/lib/api";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/page-transition";

// Dynamically import the client component to reduce initial bundle size
const GamesClient = dynamic(() => import("./games-client"), {
  loading: () => <GamesLoading />,
  ssr: false // Disable server-side rendering for this component
});

export const metadata = {
  title: "Games - NBA Projections",
  description: "Track NBA games and scores",
};

function GameCardSkeleton() {
  return (
    <div className="border rounded-lg p-4">
      <div className="grid grid-cols-7 gap-2 items-center">
        <div className="col-span-3 text-right">
          <div className="flex items-center justify-end gap-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </div>
          <Skeleton className="h-6 w-12 ml-auto mt-2" />
        </div>
        
        <div className="col-span-1 text-center">
          <Skeleton className="h-4 w-4 mx-auto" />
        </div>
        
        <div className="col-span-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-[100px]" />
          </div>
          <Skeleton className="h-6 w-12 mt-2" />
        </div>
      </div>
      
      <div className="text-center mt-2">
        <Skeleton className="h-4 w-24 mx-auto" />
      </div>
    </div>
  );
}

function MobileGamesLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <GameCardSkeleton key={i} />
          ))}
        </div>
      </div>
      
      <div>
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <GameCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DesktopGamesLoading() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-[180px]" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
        <div className="flex flex-wrap gap-4 mt-4">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-[180px]" />
          <Skeleton className="h-10 w-[180px]" />
          <Skeleton className="h-10 w-36" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <GameCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function GamesLoading() {
  return (
    <div className="space-y-4">
      <div className="md:block hidden">
        <DesktopGamesLoading />
      </div>
      <div className="md:hidden block">
        <MobileGamesLoading />
      </div>
    </div>
  );
}

export default async function GamesPage() {
  // Default to today's date
  const today = new Date();
  const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD
  
  // Get initial games data from the server
  const games = await getGames(dateString);
  
  return (
    <PageTransition>
      <div className="container py-4 md:py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Games</h1>
        </div>
        
        <GamesClient initialGames={games} initialDate={dateString} />
      </div>
    </PageTransition>
  );
} 