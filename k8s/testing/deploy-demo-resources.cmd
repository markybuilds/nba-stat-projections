@echo off
setlocal enabledelayedexpansion

echo.
echo ===================================================================
echo Deploying Test Resources to Demonstration Environment
echo ===================================================================
echo.

REM Check if kubectl is installed
where kubectl >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] kubectl is not installed or not in PATH.
    echo Please install kubectl and try again.
    exit /b 1
)

REM Set namespace name
set NAMESPACE=monitoring-test-demo

REM Check if namespace exists
echo Checking if namespace %NAMESPACE% exists...
kubectl get namespace %NAMESPACE% >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Namespace %NAMESPACE% does not exist.
    echo Please run create-demo-namespace.cmd first.
    exit /b 1
)

echo.
echo Setting up environment variables for test resources...
set ERROR_RATE=20
set SLOW_RESPONSE_DELAY=2000
set MEMORY_USAGE_MB=256
set CPU_USAGE_PERCENT=50
set DATABASE_QUERY_TIMEOUT=30

echo.
echo Deploying error generation test resources...
echo Creating error-test-deployment.yaml...
echo apiVersion: apps/v1> error-test-deployment.yaml
echo kind: Deployment>> error-test-deployment.yaml
echo metadata:>> error-test-deployment.yaml
echo   name: error-test>> error-test-deployment.yaml
echo   namespace: %NAMESPACE%>> error-test-deployment.yaml
echo   labels:>> error-test-deployment.yaml
echo     app: error-test>> error-test-deployment.yaml
echo     test-type: error-generation>> error-test-deployment.yaml
echo spec:>> error-test-deployment.yaml
echo   replicas: 1>> error-test-deployment.yaml
echo   selector:>> error-test-deployment.yaml
echo     matchLabels:>> error-test-deployment.yaml
echo       app: error-test>> error-test-deployment.yaml
echo   template:>> error-test-deployment.yaml
echo     metadata:>> error-test-deployment.yaml
echo       labels:>> error-test-deployment.yaml
echo         app: error-test>> error-test-deployment.yaml
echo       annotations:>> error-test-deployment.yaml
echo         prometheus.io/scrape: "true">> error-test-deployment.yaml
echo         prometheus.io/port: "8080">> error-test-deployment.yaml
echo         prometheus.io/path: "/metrics">> error-test-deployment.yaml
echo     spec:>> error-test-deployment.yaml
echo       containers:>> error-test-deployment.yaml
echo       - name: error-test>> error-test-deployment.yaml
echo         image: nginx:latest>> error-test-deployment.yaml
echo         ports:>> error-test-deployment.yaml
echo         - containerPort: 80>> error-test-deployment.yaml
echo         env:>> error-test-deployment.yaml
echo         - name: ERROR_RATE>> error-test-deployment.yaml
echo           value: "%ERROR_RATE%">> error-test-deployment.yaml
echo         resources:>> error-test-deployment.yaml
echo           limits:>> error-test-deployment.yaml
echo             cpu: "200m">> error-test-deployment.yaml
echo             memory: "128Mi">> error-test-deployment.yaml
echo           requests:>> error-test-deployment.yaml
echo             cpu: "100m">> error-test-deployment.yaml
echo             memory: "64Mi">> error-test-deployment.yaml
echo         livenessProbe:>> error-test-deployment.yaml
echo           httpGet:>> error-test-deployment.yaml
echo             path: />> error-test-deployment.yaml
echo             port: 80>> error-test-deployment.yaml
echo           initialDelaySeconds: 10>> error-test-deployment.yaml
echo           periodSeconds: 30>> error-test-deployment.yaml

kubectl apply -f error-test-deployment.yaml
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create error test deployment.
    exit /b 1
)

echo Creating error-test-service.yaml...
echo apiVersion: v1> error-test-service.yaml
echo kind: Service>> error-test-service.yaml
echo metadata:>> error-test-service.yaml
echo   name: error-test>> error-test-service.yaml
echo   namespace: %NAMESPACE%>> error-test-service.yaml
echo   labels:>> error-test-service.yaml
echo     app: error-test>> error-test-service.yaml
echo spec:>> error-test-service.yaml
echo   selector:>> error-test-service.yaml
echo     app: error-test>> error-test-service.yaml
echo   ports:>> error-test-service.yaml
echo   - port: 80>> error-test-service.yaml
echo     targetPort: 80>> error-test-service.yaml
echo   type: ClusterIP>> error-test-service.yaml

kubectl apply -f error-test-service.yaml
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create error test service.
    exit /b 1
)

echo.
echo Deploying slow response test resources...
echo Creating slow-response-deployment.yaml...
echo apiVersion: apps/v1> slow-response-deployment.yaml
echo kind: Deployment>> slow-response-deployment.yaml
echo metadata:>> slow-response-deployment.yaml
echo   name: slow-response>> slow-response-deployment.yaml
echo   namespace: %NAMESPACE%>> slow-response-deployment.yaml
echo   labels:>> slow-response-deployment.yaml
echo     app: slow-response>> slow-response-deployment.yaml
echo     test-type: slow-response>> slow-response-deployment.yaml
echo spec:>> slow-response-deployment.yaml
echo   replicas: 1>> slow-response-deployment.yaml
echo   selector:>> slow-response-deployment.yaml
echo     matchLabels:>> slow-response-deployment.yaml
echo       app: slow-response>> slow-response-deployment.yaml
echo   template:>> slow-response-deployment.yaml
echo     metadata:>> slow-response-deployment.yaml
echo       labels:>> slow-response-deployment.yaml
echo         app: slow-response>> slow-response-deployment.yaml
echo       annotations:>> slow-response-deployment.yaml
echo         prometheus.io/scrape: "true">> slow-response-deployment.yaml
echo         prometheus.io/port: "8080">> slow-response-deployment.yaml
echo         prometheus.io/path: "/metrics">> slow-response-deployment.yaml
echo     spec:>> slow-response-deployment.yaml
echo       containers:>> slow-response-deployment.yaml
echo       - name: slow-response>> slow-response-deployment.yaml
echo         image: nginx:latest>> slow-response-deployment.yaml
echo         ports:>> slow-response-deployment.yaml
echo         - containerPort: 80>> slow-response-deployment.yaml
echo         env:>> slow-response-deployment.yaml
echo         - name: RESPONSE_DELAY_MS>> slow-response-deployment.yaml
echo           value: "%SLOW_RESPONSE_DELAY%">> slow-response-deployment.yaml
echo         resources:>> slow-response-deployment.yaml
echo           limits:>> slow-response-deployment.yaml
echo             cpu: "200m">> slow-response-deployment.yaml
echo             memory: "128Mi">> slow-response-deployment.yaml
echo           requests:>> slow-response-deployment.yaml
echo             cpu: "100m">> slow-response-deployment.yaml
echo             memory: "64Mi">> slow-response-deployment.yaml

kubectl apply -f slow-response-deployment.yaml
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create slow response deployment.
    exit /b 1
)

echo Creating slow-response-service.yaml...
echo apiVersion: v1> slow-response-service.yaml
echo kind: Service>> slow-response-service.yaml
echo metadata:>> slow-response-service.yaml
echo   name: slow-response>> slow-response-service.yaml
echo   namespace: %NAMESPACE%>> slow-response-service.yaml
echo   labels:>> slow-response-service.yaml
echo     app: slow-response>> slow-response-service.yaml
echo spec:>> slow-response-service.yaml
echo   selector:>> slow-response-service.yaml
echo     app: slow-response>> slow-response-service.yaml
echo   ports:>> slow-response-service.yaml
echo   - port: 80>> slow-response-service.yaml
echo     targetPort: 80>> slow-response-service.yaml
echo   type: ClusterIP>> slow-response-service.yaml

kubectl apply -f slow-response-service.yaml
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create slow response service.
    exit /b 1
)

echo.
echo Deploying memory usage test resources...
echo Creating memory-test-deployment.yaml...
echo apiVersion: apps/v1> memory-test-deployment.yaml
echo kind: Deployment>> memory-test-deployment.yaml
echo metadata:>> memory-test-deployment.yaml
echo   name: memory-test>> memory-test-deployment.yaml
echo   namespace: %NAMESPACE%>> memory-test-deployment.yaml
echo   labels:>> memory-test-deployment.yaml
echo     app: memory-test>> memory-test-deployment.yaml
echo     test-type: memory-usage>> memory-test-deployment.yaml
echo spec:>> memory-test-deployment.yaml
echo   replicas: 1>> memory-test-deployment.yaml
echo   selector:>> memory-test-deployment.yaml
echo     matchLabels:>> memory-test-deployment.yaml
echo       app: memory-test>> memory-test-deployment.yaml
echo   template:>> memory-test-deployment.yaml
echo     metadata:>> memory-test-deployment.yaml
echo       labels:>> memory-test-deployment.yaml
echo         app: memory-test>> memory-test-deployment.yaml
echo       annotations:>> memory-test-deployment.yaml
echo         prometheus.io/scrape: "true">> memory-test-deployment.yaml
echo         prometheus.io/port: "8080">> memory-test-deployment.yaml
echo         prometheus.io/path: "/metrics">> memory-test-deployment.yaml
echo     spec:>> memory-test-deployment.yaml
echo       containers:>> memory-test-deployment.yaml
echo       - name: memory-test>> memory-test-deployment.yaml
echo         image: nginx:latest>> memory-test-deployment.yaml
echo         ports:>> memory-test-deployment.yaml
echo         - containerPort: 80>> memory-test-deployment.yaml
echo         env:>> memory-test-deployment.yaml
echo         - name: MEMORY_USAGE_MB>> memory-test-deployment.yaml
echo           value: "%MEMORY_USAGE_MB%">> memory-test-deployment.yaml
echo         resources:>> memory-test-deployment.yaml
echo           limits:>> memory-test-deployment.yaml
echo             cpu: "200m">> memory-test-deployment.yaml
echo             memory: "512Mi">> memory-test-deployment.yaml
echo           requests:>> memory-test-deployment.yaml
echo             cpu: "100m">> memory-test-deployment.yaml
echo             memory: "256Mi">> memory-test-deployment.yaml

kubectl apply -f memory-test-deployment.yaml
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create memory test deployment.
    exit /b 1
)

echo Creating memory-test-service.yaml...
echo apiVersion: v1> memory-test-service.yaml
echo kind: Service>> memory-test-service.yaml
echo metadata:>> memory-test-service.yaml
echo   name: memory-test>> memory-test-service.yaml
echo   namespace: %NAMESPACE%>> memory-test-service.yaml
echo   labels:>> memory-test-service.yaml
echo     app: memory-test>> memory-test-service.yaml
echo spec:>> memory-test-service.yaml
echo   selector:>> memory-test-service.yaml
echo     app: memory-test>> memory-test-service.yaml
echo   ports:>> memory-test-service.yaml
echo   - port: 80>> memory-test-service.yaml
echo     targetPort: 80>> memory-test-service.yaml
echo   type: ClusterIP>> memory-test-service.yaml

kubectl apply -f memory-test-service.yaml
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create memory test service.
    exit /b 1
)

echo.
echo Deploying CPU usage test resources...
echo Creating cpu-test-deployment.yaml...
echo apiVersion: apps/v1> cpu-test-deployment.yaml
echo kind: Deployment>> cpu-test-deployment.yaml
echo metadata:>> cpu-test-deployment.yaml
echo   name: cpu-test>> cpu-test-deployment.yaml
echo   namespace: %NAMESPACE%>> cpu-test-deployment.yaml
echo   labels:>> cpu-test-deployment.yaml
echo     app: cpu-test>> cpu-test-deployment.yaml
echo     test-type: cpu-usage>> cpu-test-deployment.yaml
echo spec:>> cpu-test-deployment.yaml
echo   replicas: 1>> cpu-test-deployment.yaml
echo   selector:>> cpu-test-deployment.yaml
echo     matchLabels:>> cpu-test-deployment.yaml
echo       app: cpu-test>> cpu-test-deployment.yaml
echo   template:>> cpu-test-deployment.yaml
echo     metadata:>> cpu-test-deployment.yaml
echo       labels:>> cpu-test-deployment.yaml
echo         app: cpu-test>> cpu-test-deployment.yaml
echo       annotations:>> cpu-test-deployment.yaml
echo         prometheus.io/scrape: "true">> cpu-test-deployment.yaml
echo         prometheus.io/port: "8080">> cpu-test-deployment.yaml
echo         prometheus.io/path: "/metrics">> cpu-test-deployment.yaml
echo     spec:>> cpu-test-deployment.yaml
echo       containers:>> cpu-test-deployment.yaml
echo       - name: cpu-test>> cpu-test-deployment.yaml
echo         image: nginx:latest>> cpu-test-deployment.yaml
echo         ports:>> cpu-test-deployment.yaml
echo         - containerPort: 80>> cpu-test-deployment.yaml
echo         env:>> cpu-test-deployment.yaml
echo         - name: CPU_USAGE_PERCENT>> cpu-test-deployment.yaml
echo           value: "%CPU_USAGE_PERCENT%">> cpu-test-deployment.yaml
echo         resources:>> cpu-test-deployment.yaml
echo           limits:>> cpu-test-deployment.yaml
echo             cpu: "500m">> cpu-test-deployment.yaml
echo             memory: "128Mi">> cpu-test-deployment.yaml
echo           requests:>> cpu-test-deployment.yaml
echo             cpu: "200m">> cpu-test-deployment.yaml
echo             memory: "64Mi">> cpu-test-deployment.yaml

kubectl apply -f cpu-test-deployment.yaml
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create CPU test deployment.
    exit /b 1
)

echo Creating cpu-test-service.yaml...
echo apiVersion: v1> cpu-test-service.yaml
echo kind: Service>> cpu-test-service.yaml
echo metadata:>> cpu-test-service.yaml
echo   name: cpu-test>> cpu-test-service.yaml
echo   namespace: %NAMESPACE%>> cpu-test-service.yaml
echo   labels:>> cpu-test-service.yaml
echo     app: cpu-test>> cpu-test-service.yaml
echo spec:>> cpu-test-service.yaml
echo   selector:>> cpu-test-service.yaml
echo     app: cpu-test>> cpu-test-service.yaml
echo   ports:>> cpu-test-service.yaml
echo   - port: 80>> cpu-test-service.yaml
echo     targetPort: 80>> cpu-test-service.yaml
echo   type: ClusterIP>> cpu-test-service.yaml

kubectl apply -f cpu-test-service.yaml
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create CPU test service.
    exit /b 1
)

echo.
echo Deploying database test resources...
echo Creating db-test-deployment.yaml...
echo apiVersion: apps/v1> db-test-deployment.yaml
echo kind: Deployment>> db-test-deployment.yaml
echo metadata:>> db-test-deployment.yaml
echo   name: db-test>> db-test-deployment.yaml
echo   namespace: %NAMESPACE%>> db-test-deployment.yaml
echo   labels:>> db-test-deployment.yaml
echo     app: db-test>> db-test-deployment.yaml
echo     test-type: database-performance>> db-test-deployment.yaml
echo spec:>> db-test-deployment.yaml
echo   replicas: 1>> db-test-deployment.yaml
echo   selector:>> db-test-deployment.yaml
echo     matchLabels:>> db-test-deployment.yaml
echo       app: db-test>> db-test-deployment.yaml
echo   template:>> db-test-deployment.yaml
echo     metadata:>> db-test-deployment.yaml
echo       labels:>> db-test-deployment.yaml
echo         app: db-test>> db-test-deployment.yaml
echo       annotations:>> db-test-deployment.yaml
echo         prometheus.io/scrape: "true">> db-test-deployment.yaml
echo         prometheus.io/port: "8080">> db-test-deployment.yaml
echo         prometheus.io/path: "/metrics">> db-test-deployment.yaml
echo     spec:>> db-test-deployment.yaml
echo       containers:>> db-test-deployment.yaml
echo       - name: db-test>> db-test-deployment.yaml
echo         image: nginx:latest>> db-test-deployment.yaml
echo         ports:>> db-test-deployment.yaml
echo         - containerPort: 80>> db-test-deployment.yaml
echo         env:>> db-test-deployment.yaml
echo         - name: DB_QUERY_TIMEOUT>> db-test-deployment.yaml
echo           value: "%DATABASE_QUERY_TIMEOUT%">> db-test-deployment.yaml
echo         - name: DB_CONNECTION_STRING>> db-test-deployment.yaml
echo           valueFrom:>> db-test-deployment.yaml
echo             secretKeyRef:>> db-test-deployment.yaml
echo               name: db-credentials>> db-test-deployment.yaml
echo               key: connection-string>> db-test-deployment.yaml
echo               optional: true>> db-test-deployment.yaml
echo         resources:>> db-test-deployment.yaml
echo           limits:>> db-test-deployment.yaml
echo             cpu: "200m">> db-test-deployment.yaml
echo             memory: "128Mi">> db-test-deployment.yaml
echo           requests:>> db-test-deployment.yaml
echo             cpu: "100m">> db-test-deployment.yaml
echo             memory: "64Mi">> db-test-deployment.yaml

kubectl apply -f db-test-deployment.yaml
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create database test deployment.
    exit /b 1
)

echo Creating db-test-service.yaml...
echo apiVersion: v1> db-test-service.yaml
echo kind: Service>> db-test-service.yaml
echo metadata:>> db-test-service.yaml
echo   name: db-test>> db-test-service.yaml
echo   namespace: %NAMESPACE%>> db-test-service.yaml
echo   labels:>> db-test-service.yaml
echo     app: db-test>> db-test-service.yaml
echo spec:>> db-test-service.yaml
echo   selector:>> db-test-service.yaml
echo     app: db-test>> db-test-service.yaml
echo   ports:>> db-test-service.yaml
echo   - port: 80>> db-test-service.yaml
echo     targetPort: 80>> db-test-service.yaml
echo   type: ClusterIP>> db-test-service.yaml

kubectl apply -f db-test-service.yaml
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create database test service.
    exit /b 1
)

echo.
echo Creating alert rules for test resources...
echo Creating alertrules.yaml...
echo apiVersion: v1> alertrules.yaml
echo kind: ConfigMap>> alertrules.yaml
echo metadata:>> alertrules.yaml
echo   name: demo-alert-rules>> alertrules.yaml
echo   namespace: %NAMESPACE%>> alertrules.yaml
echo data:>> alertrules.yaml
echo   alert-rules.yml: |>> alertrules.yaml
echo     groups:>> alertrules.yaml
echo     - name: demo-test-alerts>> alertrules.yaml
echo       rules:>> alertrules.yaml
echo       - alert: HighErrorRate>> alertrules.yaml
echo         expr: error_rate > 0.1>> alertrules.yaml
echo         for: 1m>> alertrules.yaml
echo         labels:>> alertrules.yaml
echo           severity: warning>> alertrules.yaml
echo         annotations:>> alertrules.yaml
echo           summary: High error rate detected>> alertrules.yaml
echo           description: Error rate is above 10%% for more than 1 minute>> alertrules.yaml
echo       - alert: SlowResponseTime>> alertrules.yaml
echo         expr: response_time_ms > 1000>> alertrules.yaml
echo         for: 1m>> alertrules.yaml
echo         labels:>> alertrules.yaml
echo           severity: warning>> alertrules.yaml
echo         annotations:>> alertrules.yaml
echo           summary: Slow response time detected>> alertrules.yaml
echo           description: Response time is above 1000ms for more than 1 minute>> alertrules.yaml
echo       - alert: HighMemoryUsage>> alertrules.yaml
echo         expr: memory_usage_mb > 200>> alertrules.yaml
echo         for: 1m>> alertrules.yaml
echo         labels:>> alertrules.yaml
echo           severity: warning>> alertrules.yaml
echo         annotations:>> alertrules.yaml
echo           summary: High memory usage detected>> alertrules.yaml
echo           description: Memory usage is above 200MB for more than 1 minute>> alertrules.yaml
echo       - alert: HighCpuUsage>> alertrules.yaml
echo         expr: cpu_usage_percent > 40>> alertrules.yaml
echo         for: 1m>> alertrules.yaml
echo         labels:>> alertrules.yaml
echo           severity: warning>> alertrules.yaml
echo         annotations:>> alertrules.yaml
echo           summary: High CPU usage detected>> alertrules.yaml
echo           description: CPU usage is above 40%% for more than 1 minute>> alertrules.yaml
echo       - alert: DatabaseQueryTimeout>> alertrules.yaml
echo         expr: db_query_timeout_seconds > 20>> alertrules.yaml
echo         for: 1m>> alertrules.yaml
echo         labels:>> alertrules.yaml
echo           severity: warning>> alertrules.yaml
echo         annotations:>> alertrules.yaml
echo           summary: Database query timeout detected>> alertrules.yaml
echo           description: Database query is taking more than 20 seconds for more than 1 minute>> alertrules.yaml

kubectl apply -f alertrules.yaml
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create alert rules.
    exit /b 1
)

echo.
echo Creating monitoring dashboard ConfigMap...
echo Creating dashboard.yaml...
echo apiVersion: v1> dashboard.yaml
echo kind: ConfigMap>> dashboard.yaml
echo metadata:>> dashboard.yaml
echo   name: demo-dashboard>> dashboard.yaml
echo   namespace: %NAMESPACE%>> dashboard.yaml
echo data:>> dashboard.yaml
echo   dashboard.json: |>> dashboard.yaml
echo     {>> dashboard.yaml
echo       "title": "Monitoring Test Resources Dashboard",>> dashboard.yaml
echo       "rows": [>> dashboard.yaml
echo         {>> dashboard.yaml
echo           "title": "Error Generation Tests",>> dashboard.yaml
echo           "panels": [>> dashboard.yaml
echo             {>> dashboard.yaml
echo               "title": "Error Rate",>> dashboard.yaml
echo               "type": "graph",>> dashboard.yaml
echo               "targets": [>> dashboard.yaml
echo                 {>> dashboard.yaml
echo                   "expr": "error_rate">> dashboard.yaml
echo                 }>> dashboard.yaml
echo               ]>> dashboard.yaml
echo             }>> dashboard.yaml
echo           ]>> dashboard.yaml
echo         },>> dashboard.yaml
echo         {>> dashboard.yaml
echo           "title": "Slow Response Tests",>> dashboard.yaml
echo           "panels": [>> dashboard.yaml
echo             {>> dashboard.yaml
echo               "title": "Response Time",>> dashboard.yaml
echo               "type": "graph",>> dashboard.yaml
echo               "targets": [>> dashboard.yaml
echo                 {>> dashboard.yaml
echo                   "expr": "response_time_ms">> dashboard.yaml
echo                 }>> dashboard.yaml
echo               ]>> dashboard.yaml
echo             }>> dashboard.yaml
echo           ]>> dashboard.yaml
echo         },>> dashboard.yaml
echo         {>> dashboard.yaml
echo           "title": "Memory Usage Tests",>> dashboard.yaml
echo           "panels": [>> dashboard.yaml
echo             {>> dashboard.yaml
echo               "title": "Memory Usage",>> dashboard.yaml
echo               "type": "graph",>> dashboard.yaml
echo               "targets": [>> dashboard.yaml
echo                 {>> dashboard.yaml
echo                   "expr": "memory_usage_mb">> dashboard.yaml
echo                 }>> dashboard.yaml
echo               ]>> dashboard.yaml
echo             }>> dashboard.yaml
echo           ]>> dashboard.yaml
echo         },>> dashboard.yaml
echo         {>> dashboard.yaml
echo           "title": "CPU Usage Tests",>> dashboard.yaml
echo           "panels": [>> dashboard.yaml
echo             {>> dashboard.yaml
echo               "title": "CPU Usage",>> dashboard.yaml
echo               "type": "graph",>> dashboard.yaml
echo               "targets": [>> dashboard.yaml
echo                 {>> dashboard.yaml
echo                   "expr": "cpu_usage_percent">> dashboard.yaml
echo                 }>> dashboard.yaml
echo               ]>> dashboard.yaml
echo             }>> dashboard.yaml
echo           ]>> dashboard.yaml
echo         },>> dashboard.yaml
echo         {>> dashboard.yaml
echo           "title": "Database Tests",>> dashboard.yaml
echo           "panels": [>> dashboard.yaml
echo             {>> dashboard.yaml
echo               "title": "Query Timeout",>> dashboard.yaml
echo               "type": "graph",>> dashboard.yaml
echo               "targets": [>> dashboard.yaml
echo                 {>> dashboard.yaml
echo                   "expr": "db_query_timeout_seconds">> dashboard.yaml
echo                 }>> dashboard.yaml
echo               ]>> dashboard.yaml
echo             }>> dashboard.yaml
echo           ]>> dashboard.yaml
echo         }>> dashboard.yaml
echo       ]>> dashboard.yaml
echo     }>> dashboard.yaml

kubectl apply -f dashboard.yaml
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create dashboard ConfigMap.
    exit /b 1
)

echo.
echo Creating test schedule CronJob...
echo Creating test-schedule.yaml...
echo apiVersion: batch/v1> test-schedule.yaml
echo kind: CronJob>> test-schedule.yaml
echo metadata:>> test-schedule.yaml
echo   name: scheduled-tests>> test-schedule.yaml
echo   namespace: %NAMESPACE%>> test-schedule.yaml
echo spec:>> test-schedule.yaml
echo   schedule: "*/10 * * * *">> test-schedule.yaml
echo   jobTemplate:>> test-schedule.yaml
echo     spec:>> test-schedule.yaml
echo       template:>> test-schedule.yaml
echo         spec:>> test-schedule.yaml
echo           containers:>> test-schedule.yaml
echo           - name: test-runner>> test-schedule.yaml
echo             image: busybox:latest>> test-schedule.yaml
echo             command: ["/bin/sh", "-c", "echo 'Running scheduled tests at $(date)'; sleep 5; echo 'Tests completed'"]>> test-schedule.yaml
echo           restartPolicy: OnFailure>> test-schedule.yaml

kubectl apply -f test-schedule.yaml
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create test schedule CronJob.
    exit /b 1
)

echo.
echo ===================================================================
echo Test resources successfully deployed to namespace %NAMESPACE%!
echo ===================================================================
echo.
echo The following resources have been deployed:
echo - Error generation test (Deployment + Service)
echo - Slow response test (Deployment + Service)
echo - Memory usage test (Deployment + Service)
echo - CPU usage test (Deployment + Service)
echo - Database test (Deployment + Service)
echo - Alert rules ConfigMap
echo - Monitoring dashboard ConfigMap
echo - Scheduled test CronJob
echo.
echo Current resource settings:
echo - Error Rate: %ERROR_RATE%%%
echo - Slow Response Delay: %SLOW_RESPONSE_DELAY%ms
echo - Memory Usage: %MEMORY_USAGE_MB%MB
echo - CPU Usage: %CPU_USAGE_PERCENT%%%
echo - Database Query Timeout: %DATABASE_QUERY_TIMEOUT%s
echo.
echo Next steps:
echo 1. Configure database connection using configure-database.cmd
echo 2. Validate all test resources using validate-tests.cmd
echo 3. Prepare demonstration environment for the session
echo.
echo ===================================================================

REM Clean up temporary files
del error-test-deployment.yaml
del error-test-service.yaml
del slow-response-deployment.yaml
del slow-response-service.yaml
del memory-test-deployment.yaml
del memory-test-service.yaml
del cpu-test-deployment.yaml
del cpu-test-service.yaml
del db-test-deployment.yaml
del db-test-service.yaml
del alertrules.yaml
del dashboard.yaml
del test-schedule.yaml

endlocal 