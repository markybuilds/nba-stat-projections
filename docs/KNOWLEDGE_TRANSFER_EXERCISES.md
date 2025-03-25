# NBA Stat Projections - Knowledge Transfer Exercises

This document contains hands-on exercises to be completed during the knowledge transfer session on July 7, 2024.

## Prerequisites

- Access to the demonstration environment
- Git access to the project repository
- Local development environment with:
  - Node.js 18+
  - Python 3.11+
  - Docker Desktop
  - kubectl configured for the training cluster
  - Visual Studio Code (recommended)

## Exercise 1: Frontend Maintenance

### 1.1 Add a New UI Component

In this exercise, you'll create a new UI component for displaying a player's shooting percentage visualization.

1. Navigate to the components directory:
   ```bash
   cd src/components
   ```

2. Create a new file called `ShootingChart.tsx`:
   ```bash
   touch ShootingChart.tsx
   ```

3. Implement the component using the following template:
   ```tsx
   import React from 'react';
   import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
   import { Doughnut } from 'react-chartjs-2';
   import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

   // Register Chart.js components
   ChartJS.register(ArcElement, Tooltip, Legend);

   interface ShootingChartProps {
     fieldGoalPercentage: number;
     threePointPercentage: number;
     freeThrowPercentage: number;
     playerName: string;
   }

   export function ShootingChart({
     fieldGoalPercentage,
     threePointPercentage,
     freeThrowPercentage,
     playerName
   }: ShootingChartProps) {
     // Prepare data for the chart
     const data = {
       labels: ['FG%', '3P%', 'FT%'],
       datasets: [
         {
           data: [fieldGoalPercentage, threePointPercentage, freeThrowPercentage],
           backgroundColor: [
             'rgba(54, 162, 235, 0.6)',
             'rgba(255, 99, 132, 0.6)',
             'rgba(75, 192, 192, 0.6)',
           ],
           borderColor: [
             'rgba(54, 162, 235, 1)',
             'rgba(255, 99, 132, 1)',
             'rgba(75, 192, 192, 1)',
           ],
           borderWidth: 1,
         },
       ],
     };

     return (
       <Card>
         <CardHeader>
           <CardTitle>{playerName}'s Shooting Percentages</CardTitle>
         </CardHeader>
         <CardContent>
           <div className="h-[300px] w-full flex items-center justify-center">
             <Doughnut 
               data={data} 
               options={{
                 responsive: true,
                 maintainAspectRatio: false,
               }} 
             />
           </div>
           <div className="grid grid-cols-3 gap-2 mt-4 text-center">
             <div>
               <p className="text-sm font-medium">Field Goal</p>
               <p className="text-2xl font-bold">{fieldGoalPercentage}%</p>
             </div>
             <div>
               <p className="text-sm font-medium">Three Point</p>
               <p className="text-2xl font-bold">{threePointPercentage}%</p>
             </div>
             <div>
               <p className="text-sm font-medium">Free Throw</p>
               <p className="text-2xl font-bold">{freeThrowPercentage}%</p>
             </div>
           </div>
         </CardContent>
       </Card>
     );
   }
   ```

4. Import and use the component in a player detail page:
   ```tsx
   // In src/app/players/[id]/page.tsx
   import { ShootingChart } from '@/components/ShootingChart';
   
   // Add this to the existing component:
   <ShootingChart 
     fieldGoalPercentage={player.stats.fgPercentage * 100}
     threePointPercentage={player.stats.fg3Percentage * 100}
     freeThrowPercentage={player.stats.ftPercentage * 100}
     playerName={player.name}
   />
   ```

5. Test the component by visiting a player detail page.

### 1.2 Configure Caching for an API Endpoint

In this exercise, you'll configure caching for a player statistics API endpoint.

1. Open the SWR hook file:
   ```bash
   code src/hooks/usePlayerStats.ts
   ```

2. Modify the caching configuration:
   ```tsx
   import useSWR from 'swr';
   import { apiClient } from '@/lib/api-client';

   export function usePlayerStats(playerId: string) {
     const { data, error, isLoading, mutate } = useSWR(
       playerId ? `/api/players/${playerId}/stats` : null,
       async (url) => {
         const response = await apiClient.get(url);
         return response.data;
       },
       {
         revalidateOnFocus: false,
         revalidateOnReconnect: true,
         refreshInterval: 300000, // 5 minutes
         dedupingInterval: 60000, // 1 minute
         errorRetryCount: 3,
       }
     );

     return {
       stats: data,
       isLoading,
       isError: error,
       refresh: mutate,
     };
   }
   ```

3. Create a new file for cache constants:
   ```bash
   mkdir -p src/lib/cache
   touch src/lib/cache/constants.ts
   ```

4. Add the cache configuration constants:
   ```tsx
   export const CACHE_TIMES = {
     PLAYER_DATA: 5 * 60 * 1000, // 5 minutes
     TEAM_DATA: 10 * 60 * 1000, // 10 minutes
     GAME_DATA: 3 * 60 * 1000, // 3 minutes
     LIVE_DATA: 30 * 1000, // 30 seconds
     PROJECTIONS: 5 * 60 * 1000, // 5 minutes
   };
   
   export const STALE_TIMES = {
     PLAYER_DATA: 3 * 60 * 1000, // 3 minutes
     TEAM_DATA: 5 * 60 * 1000, // 5 minutes
     GAME_DATA: 1 * 60 * 1000, // 1 minute
     LIVE_DATA: 10 * 1000, // 10 seconds
     PROJECTIONS: 2 * 60 * 1000, // 2 minutes
   };
   ```

5. Update the hook to use these constants:
   ```tsx
   import useSWR from 'swr';
   import { apiClient } from '@/lib/api-client';
   import { CACHE_TIMES, STALE_TIMES } from '@/lib/cache/constants';

   export function usePlayerStats(playerId: string) {
     const { data, error, isLoading, mutate } = useSWR(
       playerId ? `/api/players/${playerId}/stats` : null,
       async (url) => {
         const response = await apiClient.get(url);
         return response.data;
       },
       {
         revalidateOnFocus: false,
         revalidateOnReconnect: true,
         refreshInterval: STALE_TIMES.PLAYER_DATA,
         dedupingInterval: 60000, // 1 minute
         errorRetryCount: 3,
       }
     );

     return {
       stats: data,
       isLoading,
       isError: error,
       refresh: mutate,
     };
   }
   ```

6. Test the caching by viewing a player's statistics page and checking the network tab to ensure requests are properly cached.

## Exercise 2: Backend Operations

### 2.1 Add a New API Endpoint

In this exercise, you'll create a new API endpoint that returns a player's performance trend over the last 10 games.

1. Navigate to the API routers directory:
   ```bash
   cd api/routers
   ```

2. Open the players router file:
   ```bash
   code players.py
   ```

3. Add a new endpoint function:
   ```python
   @router.get("/{player_id}/trends", response_model=List[schemas.PlayerGameStats])
   async def get_player_trends(
       player_id: str,
       db: Session = Depends(get_db),
       limit: int = Query(10, description="Number of games to include in the trend")
   ):
       """Get a player's performance trends over recent games."""
       # Get the player's last N games
       player_stats = db.query(models.GameStats).filter(
           models.GameStats.player_id == player_id
       ).order_by(
           models.GameStats.game_date.desc()
       ).limit(limit).all()
       
       if not player_stats:
           raise HTTPException(status_code=404, detail="No game stats found for this player")
           
       # Return the stats in chronological order (oldest first)
       player_stats.reverse()
       
       return player_stats
   ```

4. Update the schemas file to include a response model:
   ```python
   # In api/schemas.py
   class PlayerGameStats(BaseModel):
       game_id: str
       game_date: datetime.date
       minutes_played: int
       points: int
       rebounds: int
       assists: int
       steals: int
       blocks: int
       turnovers: int
       field_goals_made: int
       field_goals_attempted: int
       three_points_made: int
       three_points_attempted: int
       free_throws_made: int
       free_throws_attempted: int
       
       class Config:
           orm_mode = True
   ```

5. Test the endpoint using curl or the Swagger documentation at `/docs`.

### 2.2 Create a New Scheduled Task

In this exercise, you'll create a scheduled task that performs a daily database cleanup.

1. Navigate to the tasks directory:
   ```bash
   cd api/tasks
   ```

2. Create a new file called `cleanup.py`:
   ```bash
   touch cleanup.py
   ```

3. Implement the cleanup task:
   ```python
   import logging
   from datetime import datetime, timedelta
   
   from sqlalchemy.orm import Session
   
   from ..db.database import get_db
   from ..models import models
   
   logger = logging.getLogger(__name__)
   
   def cleanup_old_projections(days: int = 30):
       """Remove projections older than the specified number of days."""
       logger.info(f"Running cleanup for projections older than {days} days")
       
       # Calculate the cutoff date
       cutoff_date = datetime.now().date() - timedelta(days=days)
       
       # Get a database session
       db = next(get_db())
       
       try:
           # Delete old projections
           result = db.query(models.Projection).filter(
               models.Projection.projection_date < cutoff_date
           ).delete(synchronize_session=False)
           
           db.commit()
           logger.info(f"Deleted {result} old projections before {cutoff_date}")
           
       except Exception as e:
           db.rollback()
           logger.error(f"Error cleaning up old projections: {e}")
           
       finally:
           db.close()
   ```

4. Register the task in the scheduler:
   ```python
   # In api/tasks/scheduler.py
   from .cleanup import cleanup_old_projections
   
   # Add this to the existing scheduler setup
   scheduler.add_job(
       cleanup_old_projections,
       trigger="cron",
       hour=2,  # Run at 2 AM
       minute=0,
       id="cleanup_old_projections",
       replace_existing=True,
       kwargs={"days": 30}
   )
   ```

5. Test the task by running it manually:
   ```python
   # In the interactive Python shell
   from api.tasks.cleanup import cleanup_old_projections
   
   # Run with a longer retention period for testing
   cleanup_old_projections(days=365)
   ```

## Exercise 3: Deployment Process

### 3.1 Deploy a Configuration Change

In this exercise, you'll update a configuration value and deploy it to the staging environment.

1. Navigate to the Kubernetes manifests directory:
   ```bash
   cd kubernetes/staging
   ```

2. Update the API ConfigMap:
   ```bash
   code api-configmap.yaml
   ```

3. Modify the log level setting:
   ```yaml
   apiVersion: v1
   kind: ConfigMap
   metadata:
     name: nba-api-config
     namespace: nba-staging
   data:
     LOG_LEVEL: "DEBUG"  # Change from INFO to DEBUG
     METRICS_ENABLED: "true"
     CACHE_TTL: "300"  # 5 minutes
   ```

4. Apply the updated ConfigMap:
   ```bash
   kubectl apply -f api-configmap.yaml
   ```

5. Restart the API deployment to pick up the new configuration:
   ```bash
   kubectl rollout restart deployment nba-api -n nba-staging
   ```

6. Check the status of the rollout:
   ```bash
   kubectl rollout status deployment nba-api -n nba-staging
   ```

7. Verify the new configuration by checking the logs:
   ```bash
   kubectl logs -l app=nba-api -n nba-staging | grep "DEBUG"
   ```

### 3.2 Rollback a Deployment

In this exercise, you'll simulate a problematic deployment and perform a rollback.

1. Update the Frontend deployment to use an invalid image tag:
   ```bash
   code frontend-deployment.yaml
   ```

2. Change the image tag:
   ```yaml
   containers:
     - name: nba-frontend
       image: ghcr.io/organization/nba-frontend:nonexistent-tag  # Invalid tag
   ```

3. Apply the update:
   ```bash
   kubectl apply -f frontend-deployment.yaml
   ```

4. Verify that the deployment is failing:
   ```bash
   kubectl get pods -l app=nba-frontend -n nba-staging
   ```

5. Check the deployment status:
   ```bash
   kubectl rollout status deployment nba-frontend -n nba-staging
   ```

6. Perform a rollback to the previous version:
   ```bash
   kubectl rollout undo deployment nba-frontend -n nba-staging
   ```

7. Verify the rollback was successful:
   ```bash
   kubectl get pods -l app=nba-frontend -n nba-staging
   kubectl rollout status deployment nba-frontend -n nba-staging
   ```

8. Check the revision history:
   ```bash
   kubectl rollout history deployment nba-frontend -n nba-staging
   ```

### 3.3 Scale a Component Horizontally

In this exercise, you'll scale the API deployment horizontally to handle increased load.

1. View the current deployment scale:
   ```bash
   kubectl get deployment nba-api -n nba-staging
   ```

2. Scale the deployment to 3 replicas:
   ```bash
   kubectl scale deployment nba-api -n nba-staging --replicas=3
   ```

3. Verify the new pods are being created:
   ```bash
   kubectl get pods -l app=nba-api -n nba-staging
   ```

4. Check the deployment status:
   ```bash
   kubectl rollout status deployment nba-api -n nba-staging
   ```

5. Update the HorizontalPodAutoscaler (HPA) settings:
   ```bash
   code api-hpa.yaml
   ```

6. Modify the HPA configuration:
   ```yaml
   apiVersion: autoscaling/v2
   kind: HorizontalPodAutoscaler
   metadata:
     name: nba-api-hpa
     namespace: nba-staging
   spec:
     scaleTargetRef:
       apiVersion: apps/v1
       kind: Deployment
       name: nba-api
     minReplicas: 2
     maxReplicas: 5
     metrics:
     - type: Resource
       resource:
         name: cpu
         target:
           type: Utilization
           averageUtilization: 70
     - type: Resource
       resource:
         name: memory
         target:
           type: Utilization
           averageUtilization: 80
   ```

7. Apply the updated HPA:
   ```bash
   kubectl apply -f api-hpa.yaml
   ```

8. Verify the HPA configuration:
   ```bash
   kubectl describe hpa nba-api-hpa -n nba-staging
   ```

## Conclusion

By completing these exercises, you've gained hands-on experience with key aspects of the NBA Stat Projections system, including:

1. Frontend component development and caching configuration
2. Backend API development and scheduled task implementation
3. Kubernetes deployment operations including configuration management, rollbacks, and scaling

For additional practice, try:

- Creating a custom dashboard view combining multiple data sources
- Implementing a new projection algorithm
- Setting up custom monitoring alerts for specific metrics
- Creating a database migration for a schema change 