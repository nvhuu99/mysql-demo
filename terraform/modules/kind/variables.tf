variable "cluster_name" {
  type = string
}

variable "worker_count" {
  type    = number
  default = 2
}

variable "max_cpu_cores" {
  type    = number
  default = 3
}

variable "max_memory_gi" {
  type    = number
  default = 4
}

variable "control_plane_cpu_cores" {
  type    = number
  default = 0.5
}

variable "control_plane_memory_gi" {
  type    = number
  default = 1
}

locals {
  worker_names              = [for i in range(var.worker_count) : "${var.cluster_name}-worker${i == 0 ? "" : "${i + 1}"}"]
  worker_cpu_cores          = format("%.1f", (var.max_cpu_cores - var.control_plane_cpu_cores) / var.worker_count)
  worker_memory_gi          = format("%.1f",(var.max_memory_gi - var.control_plane_memory_gi) / var.worker_count)
  worker_swap_mem_gi        = ceil(3 + ((var.max_memory_gi - var.control_plane_memory_gi) / var.worker_count))
  control_plane_swap_mem_gi = ceil(3 + var.control_plane_memory_gi)
}
