resource "kind_cluster" "main" {
  name            = var.cluster_name
  node_image      = "kindest/node:v1.32.8"
  kubeconfig_path = pathexpand("~/.kind/admin.conf")
  wait_for_ready  = true

  kind_config {
    kind        = "Cluster"
    api_version = "kind.x-k8s.io/v1alpha4"

    node {
      role = "control-plane"
    }

    dynamic "node" {
      for_each = toset([for i in range(var.worker_count) : i])
      content {
        role = "worker"
      }
    }
  }
}

resource "null_resource" "cluster_resource_limit" {
  depends_on = [kind_cluster.main]

  triggers = { cluster_endpoint = kind_cluster.main.endpoint }

  provisioner "local-exec" {
    interpreter = ["bash", "-c"]
    command = <<EOT
    docker update --cpus=${var.control_plane_cpu_cores} --memory=${var.control_plane_memory_gi}g --memory-swap=${local.control_plane_swap_mem_gi}g ${var.cluster_name}-control-plane && 
    ${join(" && ", [
      for name in local.worker_names :
      format("docker update --cpus=%s --memory=%sg --memory-swap=%sg %s", local.worker_cpu_cores, local.worker_memory_gi, local.worker_swap_mem_gi, name)
    ])}
    EOT
  }
}

