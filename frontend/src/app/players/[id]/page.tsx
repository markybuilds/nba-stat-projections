import React from 'react';
import { getPlayer, getPlayerProjections, getPlayerStats } from '@/lib/api';
import { notFound } from 'next/navigation';
import Layout from '@/components/layout';
import { PlayerDetailClient } from './player-detail-client';

interface PlayerPageProps {
  params: {
    id: string;
  };
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  try {
    // Fetch player data
    const player = await getPlayer(params.id);
    
    // Fetch player projections
    const projections = await getPlayerProjections(params.id);
    
    // Fetch recent player stats if available
    const stats = await getPlayerStats(params.id).catch(() => []);
    
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <PlayerDetailClient 
            initialPlayer={player} 
            initialProjections={projections}
            initialStats={stats}
          />
        </div>
      </Layout>
    );
  } catch (error) {
    console.error('Error loading player data:', error);
    notFound();
  }
} 