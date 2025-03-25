import React from "react";
import Layout from "@/components/layout";
import { getTodaysGames, getTodaysProjections } from "@/lib/api";
import DashboardClient from "./dashboard-client";

export default async function Dashboard() {
  // Get initial data from the server
  let games;
  let gamesError = null;
  try {
    games = await getTodaysGames();
  } catch (err) {
    console.error("Error fetching games:", err);
    gamesError = err as Error;
  }

  let projections;
  let projectionsError = null;
  try {
    projections = await getTodaysProjections();
  } catch (err) {
    console.error("Error fetching projections:", err);
    projectionsError = err as Error;
  }
  
  return (
    <Layout>
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        {/* Client component that handles real-time updates */}
        <DashboardClient 
          initialGames={games || []} 
          initialProjections={projections || []} 
          initialErrors={{
            games: gamesError,
            projections: projectionsError
          }}
        />
      </div>
    </Layout>
  );
}
