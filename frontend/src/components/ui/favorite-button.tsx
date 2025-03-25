'use client';

import * as React from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider';
import { cn } from '@/lib/utils';
import type { FavoriteType } from '@/lib/supabase';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';

export interface FavoriteButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  itemId: string;
  type: FavoriteType;
  name: string;
  imageUrl?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showText?: boolean;
  disabled?: boolean;
  favoriteId?: string;
  onFavoriteChange?: (isFavorited: boolean) => void;
}

export function FavoriteButton({
  itemId,
  type,
  name,
  imageUrl,
  variant = 'ghost',
  size = 'icon',
  showText = false,
  className,
  disabled = false,
  favoriteId,
  onFavoriteChange,
  ...props
}: FavoriteButtonProps) {
  const [favorited, setFavorited] = React.useState<boolean>(false);
  const [storedFavoriteId, setStoredFavoriteId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const { isAuthenticated, isFavorite, addFavorite, removeFavorite } = useAuth();
  const { toast } = useToast();
  
  // If the favoriteId is provided directly (like in the favorites list), use it
  React.useEffect(() => {
    if (favoriteId) {
      setFavorited(true);
      setStoredFavoriteId(favoriteId);
    }
  }, [favoriteId]);
  
  // Check if this item is already favorited if favoriteId is not directly provided
  React.useEffect(() => {
    const checkFavoriteStatus = async () => {
      // Skip check if we already have a favoriteId or if user is not authenticated
      if (favoriteId || !isAuthenticated || !itemId) return;
      
      try {
        const { success, data } = await isFavorite(type, itemId);
        
        if (success && data) {
          setFavorited(true);
          setStoredFavoriteId(data.id);
        } else {
          setFavorited(false);
          setStoredFavoriteId(null);
        }
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };
    
    checkFavoriteStatus();
  }, [isAuthenticated, itemId, type, isFavorite, favoriteId]);
  
  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to add items to your favorites.',
        variant: 'destructive',
      });
      return;
    }
    
    if (loading) return;
    
    setLoading(true);
    
    try {
      if (favorited) {
        // Use stored ID or prop ID
        const idToRemove = storedFavoriteId || favoriteId;
        if (!idToRemove) {
          throw new Error('No favorite ID available for removal');
        }
        
        // Remove from favorites
        const { success, error } = await removeFavorite(idToRemove);
        
        if (success) {
          setFavorited(false);
          setStoredFavoriteId(null);
          if (onFavoriteChange) onFavoriteChange(false);
        } else if (error) {
          toast({
            title: 'Error',
            description: error,
            variant: 'destructive',
          });
        }
      } else {
        // Add to favorites
        const { success, data, error } = await addFavorite(type, itemId, name, imageUrl);
        
        if (success && data) {
          setFavorited(true);
          setStoredFavoriteId(data.id);
          if (onFavoriteChange) onFavoriteChange(true);
        } else if (error) {
          toast({
            title: 'Error',
            description: error,
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: 'Error',
        description: 'Failed to update favorites.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const tooltipText = favorited ? `Remove from favorites` : `Add to favorites`;
  const buttonText = favorited ? 'Favorited' : 'Favorite';
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant={variant}
          size={size}
          className={cn(
            favorited && 'text-red-500',
            'relative',
            className
          )}
          disabled={disabled || loading}
          onClick={handleToggleFavorite}
          {...props}
        >
          <Heart 
            className={cn(
              'h-4 w-4',
              favorited && 'fill-current'
            )} 
          />
          {showText && <span>{buttonText}</span>}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
  );
} 