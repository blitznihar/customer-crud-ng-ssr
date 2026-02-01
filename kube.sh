kubectl apply -f ./infra/k8s/namespace.yaml
kubectl apply -f ./infra/k8s/mongo
kubectl -n customer-ssr get pods,svc,pvc


kubectl -n customer-ssr get pods
kubectl -n customer-ssr get svc