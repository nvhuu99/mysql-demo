module "kind" {
  source       = "../../../modules/kind"
  cluster_name = "dev"
  worker_count = 3

  control_plane_cpu_cores = 0.5
  control_plane_memory_gi = 1
  max_cpu_cores           = 6
  max_memory_gi           = 8
}