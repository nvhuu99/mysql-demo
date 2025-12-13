output "kube_config_path" {
  value = kind_cluster.main.kubeconfig_path
}

output "worker_names" {
  value = local.worker_names
}