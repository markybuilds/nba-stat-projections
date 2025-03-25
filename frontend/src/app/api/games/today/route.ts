import { createRealtimeHandler } from "../../utils/route-handlers";
import { getTodaysGames } from "@/lib/api";

/**
 * GET /api/games/today
 * 
 * Returns a list of today's NBA games.
 * This is real-time data that should always be fresh, so we use minimal caching.
 */
export const GET = createRealtimeHandler(async () => {
  // Fetch today's games from the backend API
  const todaysGames = await getTodaysGames();
  return todaysGames;
}); 