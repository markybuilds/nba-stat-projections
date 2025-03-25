'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layout } from '@/components/layout';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Favorite, FavoriteType } from '@/lib/supabase';
import { PlayerAvatar } from '@/components/ui/player-avatar';
import { TeamLogo } from '@/components/ui/team-logo';
import { FavoriteButton } from '@/components/ui/favorite-button';
import { Badge } from '@/components/ui/badge';
import { RouteGuard } from '@/components/auth/route-guard';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function FavoritesPage() {
  return (
    <RouteGuard>
      <FavoritesContent />
    </RouteGuard>
  );
}

function FavoritesContent() {
  const { isAuthenticated, getFavorites } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoading(true);
        const { success, data, error } = await getFavorites();
        
        if (success && data) {
          setFavorites(data);
        } else if (error) {
          setError(error);
        }
      } catch (err) {
        setError('Failed to load favorites');
        console.error('Error fetching favorites:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFavorites();
  }, [isAuthenticated, getFavorites]);
  
  const handleFavoriteRemoved = (favoriteId: string) => {
    setFavorites(favorites.filter(fav => fav.id !== favoriteId));
  };
  
  const filteredFavorites = activeTab === 'all' 
    ? favorites 
    : favorites.filter(fav => fav.type === activeTab);
  
  const teamFavorites = favorites.filter(fav => fav.type === 'team');
  const playerFavorites = favorites.filter(fav => fav.type === 'player');

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <p className="text-lg">Loading your favorites...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Favorites</h1>
        
        <Tabs defaultValue="all" className="w-full mb-8" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">
              All ({favorites.length})
            </TabsTrigger>
            <TabsTrigger value="team">
              Teams ({teamFavorites.length})
            </TabsTrigger>
            <TabsTrigger value="player">
              Players ({playerFavorites.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            {favorites.length === 0 ? (
              <EmptyFavorites />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {filteredFavorites.map(favorite => (
                  <FavoriteItem 
                    key={favorite.id} 
                    favorite={favorite} 
                    onRemoved={handleFavoriteRemoved} 
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="team">
            {teamFavorites.length === 0 ? (
              <EmptyFavorites type="team" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {filteredFavorites.map(favorite => (
                  <FavoriteItem 
                    key={favorite.id} 
                    favorite={favorite} 
                    onRemoved={handleFavoriteRemoved} 
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="player">
            {playerFavorites.length === 0 ? (
              <EmptyFavorites type="player" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {filteredFavorites.map(favorite => (
                  <FavoriteItem 
                    key={favorite.id} 
                    favorite={favorite} 
                    onRemoved={handleFavoriteRemoved} 
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

interface FavoriteItemProps {
  favorite: Favorite;
  onRemoved: (favoriteId: string) => void;
}

function FavoriteItem({ favorite, onRemoved }: FavoriteItemProps) {
  const favoriteId = favorite.id;
  
  const handleFavoriteChange = (isFavorited: boolean) => {
    if (!isFavorited) {
      onRemoved(favoriteId);
    }
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          {favorite.type === 'team' ? (
            <TeamLogo teamId={favorite.item_id} size="md" />
          ) : (
            <PlayerAvatar 
              playerId={favorite.item_id} 
              playerName={favorite.name || ''} 
              size="md" 
            />
          )}
          
          <FavoriteButton
            itemId={favorite.item_id}
            type={favorite.type}
            name={favorite.name || ''}
            imageUrl={favorite.image_url}
            variant="ghost"
            favoriteId={favoriteId}
            onFavoriteChange={handleFavoriteChange}
          />
        </div>
        <CardTitle className="text-lg">
          {favorite.name}
        </CardTitle>
        <Badge variant="outline" className="my-1">
          {favorite.type === 'team' ? 'Team' : 'Player'}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end">
          <Link href={`/${favorite.type}s/${favorite.item_id}`} passHref>
            <Button variant="ghost" size="sm" className="gap-1">
              View Details <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

interface EmptyFavoritesProps {
  type?: FavoriteType;
}

function EmptyFavorites({ type }: EmptyFavoritesProps) {
  const typeLabel = type 
    ? (type === 'team' ? 'teams' : 'players') 
    : 'items';
  
  const browseLink = type 
    ? `/${type}s` 
    : '/teams';
  
  return (
    <div className="text-center py-12 border rounded-lg bg-muted/10">
      <h3 className="text-xl font-medium mb-2">No favorites yet</h3>
      <p className="text-muted-foreground mb-6">
        You haven't added any {typeLabel} to your favorites.
      </p>
      <Link href={browseLink} passHref>
        <Button>
          Browse {type ? typeLabel : 'teams'}
        </Button>
      </Link>
    </div>
  );
} 