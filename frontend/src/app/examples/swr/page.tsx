import React from 'react';
import Layout from '@/components/layout';
import { SWRExample } from '@/components/examples/swr-example';

export const metadata = {
  title: 'SWR Data Fetching - NBA Stat Projections',
  description: 'Example of SWR data fetching with different caching strategies in the NBA Stat Projections app',
};

export default function SWRExamplePage() {
  return (
    <Layout>
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-2">SWR Data Fetching</h1>
        <p className="text-muted-foreground mb-8">
          This page demonstrates different SWR data fetching strategies with caching.
        </p>
        
        <div className="space-y-8">
          <section>
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">About SWR</h2>
              <p className="mb-3">
                SWR (stale-while-revalidate) is a React Hooks library for data fetching.
                The name comes from the HTTP cache invalidation strategy that first returns cached data (stale),
                then sends a fetch request (revalidate), and finally returns up-to-date data.
              </p>
              <p className="mb-3">
                Key features implemented in our application:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                <li>Configurable caching strategies for different data types</li>
                <li>Automatic revalidation on window focus and network reconnection</li>
                <li>Optimistic UI updates for real-time data</li>
                <li>Error handling and retry mechanisms</li>
                <li>Loading state management</li>
              </ul>
              <p>
                The examples below showcase different caching strategies based on data characteristics.
              </p>
            </div>
          </section>
          
          <SWRExample />
          
          <section className="bg-card rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Caching Strategies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Static Data (Teams)</h3>
                <p className="text-sm text-muted-foreground">
                  Teams data rarely changes, so we use a long cache duration.
                  Revalidation happens infrequently and only when needed.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Semi-Static Data (Players)</h3>
                <p className="text-sm text-muted-foreground">
                  Player data changes occasionally (trades, injuries, etc.).
                  We use a medium cache duration with more frequent revalidation.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Dynamic Data (Games)</h3>
                <p className="text-sm text-muted-foreground">
                  Game scores change frequently during games.
                  We use a short cache duration with frequent revalidation.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Real-Time Data (Projections)</h3>
                <p className="text-sm text-muted-foreground">
                  Projections and live data need to be very fresh.
                  We use a very short cache duration with constant revalidation.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
} 