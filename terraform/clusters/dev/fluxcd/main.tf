module "fluxcd" {
  source = "../../../modules/fluxcd"

  environment      = "dev"
  kube_config_path = local.kube_config_path

  git_repo_http_url = "https://github.com/nvhuu99/mysql-demo.git"
  git_branch        = "main"
  git_username      = var.git_username
  git_password      = var.git_password
}
