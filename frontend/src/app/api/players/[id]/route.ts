import { NextRequest } from "next/server";
import { createDynamicHandler } from "../../utils/route-handlers";
import { getPlayer } from "@/lib/api";

/**
 * GET /api/players/[id]
 * 
 * Returns details for a specific player.
 * This data changes occasionally, so we use dynamic caching.
 */
export const GET = createDynamicHandler(async (request: NextRequest) => {
  // Extract the player ID from the URL
  const playerId = request.url.split('/').pop();
  
  if (!playerId) {
    throw new Error("Player ID is required");
  }
  
  // Fetch player data from the backend API
  const player = await getPlayer(playerId);
  return player;
}); 