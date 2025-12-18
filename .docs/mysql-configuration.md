Commands:
    SHOW INNODB STATUS
    SET SESSION read_rnd_buffer_size = DEFAULT;

MySQL configurations scope:
- Global: applies for all connection
- Session: overrides for each connection

How to properly do the job:
- dont expect perfect configs, change config iteratively
- if you can’t provide a valid reason to change a value, keep them as is

Mis-undetstanding concepts:
- `query latency = queue time + process time` - DO NOT judge based on the `query latency`, but the `process time` only
- `more buffer allocated, more performance` - WRONG, redundant buffers only slow down MySQL due to OS memory allocation overhead 

What make better performance:
- reduce I/Os
    - buffer reads (cache)
    - buffer writes (delay)
    - batching writes
- reduce structured objects initializations. e.g. threads, table metadata, ...

---

### Refs:

- [Server System Variables](https://dev.mysql.com/doc/refman/8.4/en/server-system-variables.html)
- [InnoDB Variables](https://dev.mysql.com/doc/refman/8.4/en/innodb-parameters.html)
- [Thuật ngữ - Glossary](https://dev.mysql.com/doc/refman/8.4/en/glossary.html#glos_tablespace)

### MyISAM configs that you can ignore for InnoDB:

- read_buffer_size
(...)

### Memory:

#### InnoDB Buffer Pool:

**innodb_buffer_pool_size, innodb_buffer_pool_chunk_size, innodb_buffer_pool_instances**
- Buffer pool sẽ được partition thành nhiều phần (instances) để cho phép nhiều thread cùng làm việc và giảm tranh chấp mutex. Hiện mình không rõ chunk-size, hay số instance là bao nhiêu thì tối ưu nhất. Nhưng dựa vào tài liệu manual, chunk-size đề nghị là 1GB, và số instances thì có thể bằng số CPU.

- Giá trị của buffer-pool-size thì set khoảng từ `50%-80% RAM`. Tăng thêm nếu cần.

**tmp_table_size**
- Max size for [temporary tables for many operations (UNION, subquery, )](https://dev.mysql.com/doc/refman/8.4/en/internal-temporary-tables.html)
- Nếu như kích cỡ temp_table vượt qua setting này, MySQL sẽ chuyển sang on-disk. 
- Có rất nhiều operations phổ biến cần sử dụng đến tmp_table (cả READ và WRITE).
- Đây là setting ảnh hưởng lớn đến performance, cần monitor để biết giá trị phù hợp nhất. Đồng thời, tìm cách tối thiểu kích cỡ của temp_table:
    - `rate = created_tmp_disk_tables/created_tmp_tables` - Giá trị `rate` càng cao, thì hoặc là temp_table đang quá lớn, hoặc giá trị limit quá nhỏ, và kết quả là hiệu năng sẽ càng kém. 

innodb_max_dirty_pages_pct_lwm
Buffer pool flushing is initiated when the percentage of dirty pages reaches the low water mark value defined by the innodb_max_dirty_pages_pct_lwm variable. The default low water mark is 10% of buffer pool pages. A innodb_max_dirty_pages_pct_lwm value of 0 disables this early flushing behaviour.

Read-Heavy 
innodb_old_blocks_pct
innodb_old_blocks_time=0

Warming Strategies
Dump page IDs before shutdown (innodb_buffer_pool_dump_at_shutdown=ON) and restore on startup (innodb_buffer_pool_load_at_startup=ON).
for large Set innodb_buffer_pool_dump_pct=50 to balance dump size and coverage.


#### Cache:

**thread_cache_size**
- Number of threads MySQL can keep for reusing when there a new connection.
- To check whether the thread cache is large enough, watch the threads_created variable. e.g. fewer than 10 new threads per sec

**query_cache_size**
- Cache query results for hot queries. You need to figure out what is the cache hit ratio you want. If it currently below your need, then increase the `query_cache_size` will allow MySQL to cache more queries and thus increases the cace-hit ratio.

**table_open_cache (table_cache_size)**
- How many table file handlers MySQL can keep in memory at the same time. - Helps avoid the cost of repeatedly opening/closing table files.
- A table handler can only be used by one connection at a time.
- Example: `table_open_cache = max_connections * N` - N is the max number of joins.

**table_definition_cache**
- Cache the table definitions in memory. Table definitions size are relatively low. Therefor, unless you have too many tables, it safe to load most of them into the memory.

#### Per-connection Query Buffers:

**⚠️ Góc nhìn cá nhân:** Quá mâu thuẫn - Một mặt thì không thể biết trước sẽ có bao nhiêu dữ liệu sẽ trả về để gán buffer-size. Mặt khác, nếu gán buffer-size quá dư thừa thì sẽ dẫn đến giảm hiệu năng vì chi phí allocation. Theo tìm hiểu, những settings này chỉ tồn tại vì cho các hệ thống legacy khi RAM, disk-seek quá đắt đỏ. Vậy thì chẳng thà rằng không quan tâm đến những settings này. 

The performance will be vary depends on the workload, therefore, its recommended to set these configuration relatively to the workload's nature instead of a global-fit-all value (e.g. large queries need higher value). You should consider staying below 2MB. For starter, 128KB or 256KB might be sufficient. You can then simulate the workload and iteratively increase the value until the query significantly slows down (dedundant buffer allocation overhead).
*These configurations are irrelevant if indexes are available. More precisely, you only need these if using indexes is not an option.*
- read_rnd_buffer_size 
- sort_buffer_size 
- join_buffer_size
- (...)

#### Buffer:

---

### Concurrency:

**max_connections**
- Giới hạn số connection đồng thời: khi đạt limit, sẽ trả về lỗi.

**open_files_limit**
- Giới hạn số file mà mysqld có thể mở đồng thời. Server tự động estimate giá trị dựa trên `table_open_cache` và `max_connections`

**innodb_thread_concurrency**
- Limit on the number of concurrently executing threads. Newly created thread will sleep and retry in micro-seconds before its scheduled for a number of tickets (controlled by `innodb_thread_sleep_delay`, and  `innodb_adaptive_max_sleep_delay`)
- ⚠️ Set = 0 chứ ko rõ limit này có tác dụng gì

---

configs:
innodb_io_capacity
innodb_io_capacity_max
- innodb_redo_log_capacity
- innodb_max_dirty_pages_pct: flushing dirty pages behavior control by percentage. default behavior is lazy (flush only when need more space)
- max_connect_errors:
    too many errors, clients can get blacklisted (secured against brute-force attacks). you can just make it very large to effectively disable host blacklisting
- read_only: for replica
- skip_slave_start:
    -  prevents start replication automatically; it is unsafe after a crash;  a human needs to examine
- slave_net_timeout:
    - how long it’ll be before a replica notices that its connection to its master has failed and needs to be reconnected
- sync_master_info, sync_relay_log, and sync_relay_log_info
    - replica sync status files to disk;  make replicas much more likely to be recoverable after a crash
    - cause extra fsync() operations on replicas

---

memory: 
The truth is that you can’t put an upper bound on MySQL’s memory consumption. It is not a tightly regulated database server that controls memory allocation. 

setting the buffer size:
- begin with the amount of memory
- subtract enough for the InnoDB log files
- substract cache
- use ~80% of what left at the starting point
- mẹo: dự đoán kích cỡ của các tables, và setting theo đó, ví dụ 20%.
 
memory usages:
- transaction log buffer
- write buffer
- query buffer: delay writes
- temporary tables:
     If an implicit temporary table’s size exceeds either of thesesettings, it will be converted to an on-disk MyISAM table so it can keep growing.
- prepared statements
- locks
- query result caches
- dirty pages:
    - pages whose changes have not yet been flushed to the data files
- table caches:
    - table dictionary:
        Each table can take up 4 KB or more of memory (although much less space is required in MySQL 5.1).
        Tables are not removed from the data dictionary when they are closed.
- thread caches:
    - they holds threads that aren’t currently associated with a connection but are ready to serve new connections
    - thread cache or sleeping typically uses around 256 KB of memory
    - you might want to set it lower because some operating systems don’t handle very large numbers of threads well

---

I/O behavior:

#### transaction log:
InnoDB flushes the buffer to the log files on disk when the buffer gets full, when a transaction commits, or once per second—whichever comes first.

- tablespace files:
    - work state of a table: old row versions of uncommited trx

- configs
    - innodb_flush_method:
    - innodb_flush_log_at_trx_commit:
        - 0: all log entries are buffered, and fsync() every seconds
        - 1: on every commit, calls fsync(). highest durability, but very slow
        - 2: on every commit, write to OS page-cache immediately (even MySQL process or container is interupted, the changes are not lost), and fsync() on every seconds (better performance than always call fsync())
    - innodb_log_buffer_size:
        - help reduce I/O if you have large transactions
        - You usually don’t need to make the buffer very large. The recommended range is 1-8 MB or 32-128 MB  (unless you write a lot of huge BLOB records. e.g: large text)
    - innodb_log_file_size:
        - if the log is too small, InnoDB will have to do more checkpoints, causing more log writes
        - if the log is too large, InnoDB might have to do a lot of work when it recovers. This can greatly increase recovery time
    - innodb_log_files_in_group
    - innodb_max_purge_lag:
        - the maximum number of transactions that can be waiting to be purged before InnoDB starts to delay further queries that update data
        - if your average trx affects 1 KB of rows and you can tolerate 100 MB of unpurged rows in your tablespace, you could set the value to 100000
        - unpurged row versions impact all queries, because they effectively make your tables and indexes larger. If the purge thread simply can’t keep up, performance can decrease dramatically
    - innodb_doublewrite: 0 (this is another data safety machenism, should disable on replicas)

#### changing the transaction log file size:
- must shutdown server cleanly to ensure all changes are applied
- remove old log files, reconfigure and restart 

---

metrics:
- innotop: InnoDB buffer pool’s memory usage

---

warm up on restart:
    cold cache:
        buffer pool is empty (No data pages, No index pages). All reads must go to disk, First real user queries will be very slow
        run queries to warm up the buffer: most-used indexes, critical tables, common access paths. e.g: SELECT user_id FROM orders ORDER BY user_id
    or:
        innodb_buffer_pool_dump_at_shutdown = ON
        innodb_buffer_pool_load_at_startup  = ON

---

### concurrency:

InnoDB has its own “thread scheduler”

configs:
- innodb_thread_concurrency
- innodb_commit_concurrency: how many threads can commit at the same time

---
Optimizing for BLOB and TEXT Workloads
    One of the most important considerations is
    that the server cannot use in-memory temporary tables for BLOB values. Thus, if a
    query involving BLOB values requires a temporary table—no matter how small—it will
    go to disk immediately

---

InnoDB advance configs:
- innodb_io_capacity: default 100 I/O operations per second. you can inform InnoDB how much I/O capacity is available to it
- innodb_read_io_threads and innodb_write_io_threads:
    default four read threads and four write threads.  you can increase the number of threads