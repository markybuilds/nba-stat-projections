# Maintenance Guide

## System Monitoring

### Metrics Collection

1. **Application Metrics**
   - Response times
   - Error rates
   - Request counts
   - Cache hit/miss rates
   - WebSocket connection stats

2. **Infrastructure Metrics**
   - CPU usage
   - Memory utilization
   - Network I/O
   - Disk usage
   - Container health

3. **Database Metrics**
   - Query performance
   - Connection pool stats
   - Index usage
   - Table sizes
   - Replication lag

### Monitoring Tools

1. **Prometheus Setup**
   ```bash
   # Check Prometheus status
   kubectl get pods -n monitoring

   # Port forward Prometheus UI
   kubectl port-forward svc/prometheus-server 9090:9090 -n monitoring

   # View metrics
   curl localhost:9090/metrics
   ```

2. **Grafana Dashboards**
   - NBA Stats Overview
   - API Performance
   - Database Health
   - Cache Performance
   - Infrastructure Status

3. **Alert Configuration**
   ```yaml
   # Example alert rule
   groups:
   - name: nba-stats-alerts
     rules:
     - alert: HighErrorRate
       expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
       for: 5m
       labels:
         severity: critical
       annotations:
         summary: High error rate detected
         description: Error rate is above 10% for 5 minutes
   ```

### Health Checks

1. **API Health**
   ```bash
   # Check API health
   curl https://api.nba-stat-projections.com/health

   # Check detailed health status
   curl https://api.nba-stat-projections.com/health/detailed
   ```

2. **Database Health**
   ```sql
   -- Check connection status
   SELECT * FROM pg_stat_activity;

   -- Check replication status
   SELECT * FROM pg_stat_replication;
   ```

3. **Infrastructure Health**
   ```bash
   # Check node status
   kubectl get nodes

   # Check pod health
   kubectl get pods --all-namespaces
   ```

## Performance Tuning

### API Performance

1. **Response Time Optimization**
   ```typescript
   // Enable response time logging
   app.use(async (ctx, next) => {
     const start = Date.now();
     await next();
     const ms = Date.now() - start;
     ctx.set('X-Response-Time', `${ms}ms`);
     if (ms > 1000) {
       logger.warn(`Slow response: ${ctx.path} took ${ms}ms`);
     }
   });
   ```

2. **Cache Configuration**
   ```typescript
   // Optimize cache settings
   const cacheConfig = {
     staleWhileRevalidate: 60,
     maxAge: 3600,
     revalidateOnFocus: false,
     dedupingInterval: 2000
   };
   ```

3. **Query Optimization**
   ```sql
   -- Add indexes for common queries
   CREATE INDEX idx_player_stats ON player_stats(player_id, game_date);
   CREATE INDEX idx_game_stats ON game_stats(game_id, team_id);

   -- Analyze query performance
   EXPLAIN ANALYZE SELECT * FROM player_stats WHERE player_id = 1;
   ```

### Database Optimization

1. **Connection Pool Settings**
   ```typescript
   // Optimize pool configuration
   const pool = new Pool({
     max: 20,
     min: 4,
     idleTimeoutMillis: 30000,
     connectionTimeoutMillis: 2000
   });
   ```

2. **Query Performance**
   ```sql
   -- Vacuum and analyze
   VACUUM ANALYZE player_stats;
   VACUUM ANALYZE game_stats;

   -- Update statistics
   ANALYZE player_stats;
   ANALYZE game_stats;
   ```

3. **Index Maintenance**
   ```sql
   -- Rebuild indexes
   REINDEX TABLE player_stats;
   REINDEX TABLE game_stats;

   -- Monitor index usage
   SELECT * FROM pg_stat_user_indexes;
   ```

### Infrastructure Optimization

1. **Resource Limits**
   ```yaml
   # Kubernetes resource configuration
   resources:
     limits:
       cpu: "1"
       memory: "1Gi"
     requests:
       cpu: "500m"
       memory: "512Mi"
   ```

2. **Auto-scaling**
   ```yaml
   # HPA configuration
   apiVersion: autoscaling/v2
   kind: HorizontalPodAutoscaler
   metadata:
     name: api-hpa
   spec:
     scaleTargetRef:
       apiVersion: apps/v1
       kind: Deployment
       name: api
     minReplicas: 2
     maxReplicas: 10
     metrics:
     - type: Resource
       resource:
         name: cpu
         target:
           type: Utilization
           averageUtilization: 80
   ```

## Troubleshooting

### Common Issues

1. **API Issues**
   - High latency
   - Error spikes
   - Connection timeouts
   - Rate limiting errors

2. **Database Issues**
   - Connection errors
   - Slow queries
   - Deadlocks
   - Replication lag

3. **Infrastructure Issues**
   - Pod crashes
   - Resource constraints
   - Network issues
   - Storage problems

### Debugging Procedures

1. **API Debugging**
   ```bash
   # Enable debug logging
   export DEBUG=api:*

   # Check API logs
   kubectl logs -f deployment/api

   # Monitor real-time metrics
   curl localhost:9090/metrics | grep api_
   ```

2. **Database Debugging**
   ```sql
   -- Check active queries
   SELECT pid, query, state
   FROM pg_stat_activity
   WHERE state != 'idle';

   -- Kill long-running queries
   SELECT pg_terminate_backend(pid)
   FROM pg_stat_activity
   WHERE state = 'active'
   AND now() - query_start > interval '5 minutes';
   ```

3. **Infrastructure Debugging**
   ```bash
   # Check pod events
   kubectl describe pod pod-name

   # Check node events
   kubectl describe node node-name

   # Check logs
   kubectl logs -f pod-name
   ```

### Recovery Procedures

1. **API Recovery**
   ```bash
   # Restart API pods
   kubectl rollout restart deployment api

   # Scale up replicas
   kubectl scale deployment api --replicas=4
   ```

2. **Database Recovery**
   ```bash
   # Restore from backup
   npm run db:restore

   # Verify data integrity
   npm run db:verify
   ```

3. **Infrastructure Recovery**
   ```bash
   # Node drain
   kubectl drain node-name

   # Node recovery
   kubectl uncordon node-name
   ```

## Security Best Practices

### Authentication & Authorization

1. **API Security**
   ```typescript
   // JWT validation middleware
   app.use(async (ctx, next) => {
     const token = ctx.headers.authorization?.split(' ')[1];
     if (!token) {
       ctx.throw(401, 'No token provided');
     }
     try {
       const decoded = jwt.verify(token, process.env.JWT_SECRET);
       ctx.state.user = decoded;
       await next();
     } catch (err) {
       ctx.throw(401, 'Invalid token');
     }
   });
   ```

2. **Rate Limiting**
   ```typescript
   // Configure rate limiting
   app.use(rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   }));
   ```

### Data Protection

1. **Encryption**
   ```typescript
   // Enable SSL
   const app = express();
   const server = https.createServer({
     key: fs.readFileSync('key.pem'),
     cert: fs.readFileSync('cert.pem')
   }, app);
   ```

2. **Data Sanitization**
   ```typescript
   // Sanitize input
   app.use(sanitize());
   app.use(helmet());
   ```

### Access Control

1. **RBAC Configuration**
   ```yaml
   # Kubernetes RBAC
   apiVersion: rbac.authorization.k8s.io/v1
   kind: Role
   metadata:
     name: api-role
   rules:
   - apiGroups: [""]
     resources: ["pods"]
     verbs: ["get", "list"]
   ```

2. **Network Policies**
   ```yaml
   # Network policy
   apiVersion: networking.k8s.io/v1
   kind: NetworkPolicy
   metadata:
     name: api-network-policy
   spec:
     podSelector:
       matchLabels:
         app: api
     ingress:
     - from:
       - podSelector:
           matchLabels:
             app: frontend
   ```

## Maintenance Schedule

### Daily Tasks
- Monitor system health
- Review error logs
- Check backup status
- Verify metrics collection

### Weekly Tasks
- Review performance metrics
- Update security patches
- Analyze slow queries
- Check resource utilization

### Monthly Tasks
- Rotate credentials
- Review access logs
- Update documentation
- Test recovery procedures

### Quarterly Tasks
- Security audit
- Load testing
- Capacity planning
- Infrastructure review

## Support Procedures

### Escalation Path
1. On-call engineer
2. DevOps team
3. Database team
4. Security team

### Contact Information
- DevOps: devops@nba-stat-projections.com
- Database: dba@nba-stat-projections.com
- Security: security@nba-stat-projections.com

### Documentation
- [Internal Wiki](https://wiki.nba-stat-projections.com)
- [API Docs](https://api.nba-stat-projections.com/docs)
- [Runbooks](https://runbooks.nba-stat-projections.com) 