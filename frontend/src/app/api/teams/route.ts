import { createStaticHandler } from "../utils/route-handlers";
import { getTeams } from "@/lib/api";

/**
 * GET /api/teams
 * 
 * Returns a list of all NBA teams.
 * This is static data that rarely changes, so it's highly cacheable.
 */
export const GET = createStaticHandler(async () => {
  // Fetch teams from the backend API
  const teams = await getTeams();
  return teams;
}); 