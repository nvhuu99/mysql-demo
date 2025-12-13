#### Nội dung:

Trước khi deploy, hãy học hỏi từ [MySQL BitnamiChart](https://github.com/bitnami/charts/tree/main/bitnami/mysql). Liệt kê những cấu hình mà chart cung cấp, tập trung vào những cấu hình liên quan đến MySQL.

#### Logs:

- Configuration đã bị **Abstracted**: Helmchart này chủ yếu dùng các ENV mà image cung cấp, nên không tìm được nhiều configs và setup. Mình sẽ khởi động MySQL sau đó xem configurations trực tiếp trong container.

---

#### Essential configurations:

- Init database script: bash scripts that executed on first boot
- Start database script: bash scripts that executed every time the container run
- MySQL server configuration
    + basedir=/opt/bitnami/mysql
    + max_allowed_packet=16M
    + log-error=/opt/bitnami/mysql/logs/mysqld.log
    + slow_query_log=0
    + long_query_time=10.0

#### Metrics:

[Prometheus OSS - MySQL Exporter](https://grafana.com/oss/prometheus/exporters/mysql-exporter/?tab=installation)

#### Replication:

**Basic requirements:**
- Replication User:
    - A database user that allow the replicas to connect to the database and read the primary node  