terraform {
  required_version = "1.13.3"
  
  required_providers {
    flux = {
      source  = "fluxcd/flux"
      version = "1.7.3"
    }
  }
}

provider "flux" {
  kubernetes = {
    config_path = var.kube_config_path
  }
  git = {
    url    = var.git_repo_http_url
    branch = var.git_branch
    http = {
      username = var.git_username
      password = var.git_password
    }
  }
}