variable "git_username" {}
variable "git_password" {}

locals {
  kube_config_path = data.terraform_remote_state.kind.outputs.kube_config_path
}

data "terraform_remote_state" "kind" {
  backend = "local"
  config = {
    path = "../kind/terraform.tfstate"
  }
}