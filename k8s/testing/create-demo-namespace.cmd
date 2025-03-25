@echo off
setlocal enabledelayedexpansion

echo.
echo ===================================================================
echo Creating Demonstration Environment for Monitoring Test Resources
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

echo Checking if namespace %NAMESPACE% already exists...
kubectl get namespace %NAMESPACE% >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo.
    echo [WARNING] Namespace %NAMESPACE% already exists.
    echo.
    set /p CONTINUE="Do you want to reset the namespace? [Y/N]: "
    if /i "!CONTINUE!" NEQ "Y" (
        echo.
        echo Operation canceled by user.
        exit /b 0
    )
    
    echo.
    echo Deleting existing namespace %NAMESPACE%...
    kubectl delete namespace %NAMESPACE%
    
    REM Wait for namespace to be deleted
    :WAIT_DELETE
    kubectl get namespace %NAMESPACE% >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo Waiting for namespace deletion to complete...
        timeout /t 5 /nobreak >nul
        goto WAIT_DELETE
    )
)

echo.
echo Creating namespace %NAMESPACE%...
kubectl create namespace %NAMESPACE%
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create namespace.
    exit /b 1
)

echo.
echo Setting up RBAC permissions...
echo Creating service account for demonstration...

echo Creating serviceaccount.yaml...
echo apiVersion: v1> serviceaccount.yaml
echo kind: ServiceAccount>> serviceaccount.yaml
echo metadata:>> serviceaccount.yaml
echo   name: demo-user>> serviceaccount.yaml
echo   namespace: %NAMESPACE%>> serviceaccount.yaml

kubectl apply -f serviceaccount.yaml
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create service account.
    exit /b 1
)

echo Creating role.yaml...
echo apiVersion: rbac.authorization.k8s.io/v1> role.yaml
echo kind: Role>> role.yaml
echo metadata:>> role.yaml
echo   name: demo-role>> role.yaml
echo   namespace: %NAMESPACE%>> role.yaml
echo rules:>> role.yaml
echo - apiGroups: [""]>> role.yaml
echo   resources: ["pods", "services", "configmaps", "secrets"]>> role.yaml
echo   verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]>> role.yaml
echo - apiGroups: ["apps"]>> role.yaml
echo   resources: ["deployments", "statefulsets", "daemonsets"]>> role.yaml
echo   verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]>> role.yaml
echo - apiGroups: ["batch"]>> role.yaml
echo   resources: ["jobs", "cronjobs"]>> role.yaml
echo   verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]>> role.yaml

kubectl apply -f role.yaml
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create role.
    exit /b 1
)

echo Creating rolebinding.yaml...
echo apiVersion: rbac.authorization.k8s.io/v1> rolebinding.yaml
echo kind: RoleBinding>> rolebinding.yaml
echo metadata:>> rolebinding.yaml
echo   name: demo-role-binding>> rolebinding.yaml
echo   namespace: %NAMESPACE%>> rolebinding.yaml
echo subjects:>> rolebinding.yaml
echo - kind: ServiceAccount>> rolebinding.yaml
echo   name: demo-user>> rolebinding.yaml
echo   namespace: %NAMESPACE%>> rolebinding.yaml
echo roleRef:>> rolebinding.yaml
echo   kind: Role>> rolebinding.yaml
echo   name: demo-role>> rolebinding.yaml
echo   apiGroup: rbac.authorization.k8s.io>> rolebinding.yaml

kubectl apply -f rolebinding.yaml
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create role binding.
    exit /b 1
)

echo.
echo Setting up network policies...

echo Creating networkpolicy.yaml...
echo apiVersion: networking.k8s.io/v1> networkpolicy.yaml
echo kind: NetworkPolicy>> networkpolicy.yaml
echo metadata:>> networkpolicy.yaml
echo   name: demo-network-policy>> networkpolicy.yaml
echo   namespace: %NAMESPACE%>> networkpolicy.yaml
echo spec:>> networkpolicy.yaml
echo   podSelector: {}>> networkpolicy.yaml
echo   policyTypes:>> networkpolicy.yaml
echo   - Ingress>> networkpolicy.yaml
echo   - Egress>> networkpolicy.yaml
echo   ingress:>> networkpolicy.yaml
echo   - from:>> networkpolicy.yaml
echo     - podSelector: {}>> networkpolicy.yaml
echo     - namespaceSelector:>> networkpolicy.yaml
echo         matchLabels:>> networkpolicy.yaml
echo           name: monitoring>> networkpolicy.yaml
echo   egress:>> networkpolicy.yaml
echo   - to:>> networkpolicy.yaml
echo     - podSelector: {}>> networkpolicy.yaml
echo     - namespaceSelector: {}>> networkpolicy.yaml
echo     - ipBlock:>> networkpolicy.yaml
echo         cidr: 0.0.0.0/0>> networkpolicy.yaml
echo         except:>> networkpolicy.yaml
echo         - 10.0.0.0/8>> networkpolicy.yaml

kubectl apply -f networkpolicy.yaml
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Failed to create network policy. This may be because NetworkPolicy is not enabled in your cluster.
    echo You can safely ignore this warning if your cluster doesn't use network policies.
)

echo.
echo Setting up Prometheus scrape config...

echo Creating prometheus-config.yaml...
echo apiVersion: v1> prometheus-config.yaml
echo kind: ConfigMap>> prometheus-config.yaml
echo metadata:>> prometheus-config.yaml
echo   name: demo-prometheus-config>> prometheus-config.yaml
echo   namespace: %NAMESPACE%>> prometheus-config.yaml
echo data:>> prometheus-config.yaml
echo   prometheus.yml: |>> prometheus-config.yaml
echo     scrape_configs:>> prometheus-config.yaml
echo       - job_name: 'demo-resources'>> prometheus-config.yaml
echo         kubernetes_sd_configs:>> prometheus-config.yaml
echo           - role: pod>> prometheus-config.yaml
echo             namespaces:>> prometheus-config.yaml
echo               names:>> prometheus-config.yaml
echo                 - %NAMESPACE%>> prometheus-config.yaml
echo         relabel_configs:>> prometheus-config.yaml
echo           - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]>> prometheus-config.yaml
echo             action: keep>> prometheus-config.yaml
echo             regex: true>> prometheus-config.yaml
echo           - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]>> prometheus-config.yaml
echo             action: replace>> prometheus-config.yaml
echo             target_label: __metrics_path__>> prometheus-config.yaml
echo             regex: (.+)>> prometheus-config.yaml
echo           - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]>> prometheus-config.yaml
echo             action: replace>> prometheus-config.yaml
echo             regex: ([^:]+)(?::\d+)?;(\d+)>> prometheus-config.yaml
echo             replacement: $1:$2>> prometheus-config.yaml
echo             target_label: __address__>> prometheus-config.yaml
echo           - action: labelmap>> prometheus-config.yaml
echo             regex: __meta_kubernetes_pod_label_(.+)>> prometheus-config.yaml
echo           - source_labels: [__meta_kubernetes_namespace]>> prometheus-config.yaml
echo             action: replace>> prometheus-config.yaml
echo             target_label: kubernetes_namespace>> prometheus-config.yaml
echo           - source_labels: [__meta_kubernetes_pod_name]>> prometheus-config.yaml
echo             action: replace>> prometheus-config.yaml
echo             target_label: kubernetes_pod_name>> prometheus-config.yaml

kubectl apply -f prometheus-config.yaml
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create Prometheus config.
    exit /b 1
)

echo.
echo Creating demo environment labels...
kubectl label namespace %NAMESPACE% purpose=demonstration environment=testing type=monitoring-tests --overwrite
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Failed to label namespace. This is not critical.
)

echo.
echo Creating temporary credentials for participants...
echo This will create a kubeconfig file for demonstration access.

echo apiVersion: v1> demo-kubeconfig.yaml
echo kind: Config>> demo-kubeconfig.yaml
echo clusters:>> demo-kubeconfig.yaml
echo - name: demo-cluster>> demo-kubeconfig.yaml
echo   cluster:>> demo-kubeconfig.yaml
echo     server: $(kubectl config view -o jsonpath='{.clusters[0].cluster.server}')>> demo-kubeconfig.yaml
echo     certificate-authority-data: $(kubectl config view --raw -o jsonpath='{.clusters[0].cluster.certificate-authority-data}')>> demo-kubeconfig.yaml
echo contexts:>> demo-kubeconfig.yaml
echo - name: demo-context>> demo-kubeconfig.yaml
echo   context:>> demo-kubeconfig.yaml
echo     cluster: demo-cluster>> demo-kubeconfig.yaml
echo     namespace: %NAMESPACE%>> demo-kubeconfig.yaml
echo     user: demo-user>> demo-kubeconfig.yaml
echo current-context: demo-context>> demo-kubeconfig.yaml
echo users:>> demo-kubeconfig.yaml
echo - name: demo-user>> demo-kubeconfig.yaml
echo   user:>> demo-kubeconfig.yaml
echo     token: $(kubectl -n %NAMESPACE% create token demo-user)>> demo-kubeconfig.yaml

echo.
echo Creating resources for exercise environment...
kubectl create configmap demo-exercise-config --from-file=exercises.txt=placeholder.txt -n %NAMESPACE%

echo.
echo ===================================================================
echo Demo namespace %NAMESPACE% has been successfully created!
echo ===================================================================
echo.
echo The following resources have been set up:
echo - Namespace: %NAMESPACE%
echo - ServiceAccount: demo-user
echo - Role and RoleBinding for permissions
echo - Network Policy for connectivity
echo - Prometheus scrape configuration
echo - Namespace labels for identification
echo - Demo kubeconfig file for participant access
echo.
echo Next steps:
echo 1. Deploy the monitoring test resources to the namespace
echo 2. Configure the database environment
echo 3. Test all components using the validation script
echo 4. Prepare for the demonstration session
echo.
echo ===================================================================

REM Clean up temporary files
del serviceaccount.yaml
del role.yaml
del rolebinding.yaml
del networkpolicy.yaml
del prometheus-config.yaml
del placeholder.txt

endlocal 