import Layout from "@/components/layout";
import { TeamsListClient } from "@/components/examples/teams-list-client";
import { TodaysGamesClient } from "@/components/examples/todays-games-client";

/**
 * Example page demonstrating client-side data fetching with SWR
 */
export default function SWRExamplePage() {
  return (
    <Layout>
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">SWR Data Fetching Examples</h1>
        <p className="mb-6 text-muted-foreground">
          This page demonstrates client-side data fetching with SWR.
          The components below use SWR hooks to fetch and cache data with different revalidation strategies.
        </p>

        <h2 className="text-2xl font-bold mb-4">Static Data (Teams)</h2>
        <p className="mb-4 text-muted-foreground">
          Teams data is relatively static and is cached for a longer period of time.
        </p>
        <TeamsListClient />

        <h2 className="text-2xl font-bold mb-4">Real-time Data (Today's Games)</h2>
        <p className="mb-4 text-muted-foreground">
          Today's games data is real-time and automatically revalidates to show the latest scores.
          This component will refresh data in the background periodically.
        </p>
        <TodaysGamesClient />
      </div>
    </Layout>
  );
} 