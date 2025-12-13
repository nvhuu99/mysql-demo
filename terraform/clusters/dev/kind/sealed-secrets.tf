module "sealed_secrets" {
  source     = "../../../modules/sealed-secrets"
  depends_on = [module.kind]

  grafana_admin_user         = var.grafana_admin_user
  grafana_admin_password     = var.grafana_admin_password
  mysql_root_password        = var.mysql_root_password
  mysql_replication_password = var.mysql_replication_password
  mysql_password             = var.mysql_password
}