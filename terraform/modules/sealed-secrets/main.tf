resource "helm_release" "sealed_secrets" {
  name       = "sealed-secrets"
  repository = "https://bitnami-labs.github.io/sealed-secrets"
  chart      = "sealed-secrets"
  version    = "2.17.7"
  namespace  = "kube-system"

  set = [
    { name = "fullnameOverride", value = "sealed-secrets-controller" },
  ]
}

resource "null_resource" "create_sealed_secrets" {
  depends_on = [helm_release.sealed_secrets]

  triggers = { run_once = "1" }

  provisioner "local-exec" {
    interpreter = ["bash", "-c"]
    command     = <<EOT
    kubectl create ns monitoring 2>/dev/null || true && \
    kubectl create ns infras 2>/dev/null || true && \

    kubectl create secret generic mysql-secrets \
      --namespace infras \
      --from-literal=mysql-root-password=${var.mysql_root_password} \
      --from-literal=mysql-replication-password=${var.mysql_replication_password} \
      --from-literal=mysql-password=${var.mysql_password} \
      --dry-run=client -o yaml | \
    kubeseal \
      --controller-name=sealed-secrets-controller \
      --controller-namespace=kube-system \
      --format yaml | \
    kubectl apply -f - && \

    kubectl create secret generic grafana-secrets \
      --namespace monitoring \
      --from-literal=admin-user=${var.grafana_admin_user} \
      --from-literal=admin-password=${var.grafana_admin_password} \
      --dry-run=client -o yaml | \
    kubeseal \
      --controller-name=sealed-secrets-controller \
      --controller-namespace=kube-system \
      --format yaml | \
    kubectl apply -f -
    EOT
  }
}
