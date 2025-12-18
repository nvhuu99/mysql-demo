### Refs:

- [Thuật ngữ - Glossary](https://dev.mysql.com/doc/refman/8.4/en/glossary.html#glos_tablespace)

## How MySQL Uses Memory

### The InnoDB buffer pool

For efficiency of high-volume read operations, the buffer pool is divided into pages. For efficiency of cache management, the buffer pool is implemented as a linked list of pages; data that is rarely used is aged out of the cache, using a variation of the LRU algorithm.

Rather than using a strict LRU algorithm, InnoDB uses a technique to minimize the amount of data that is brought into the buffer pool and never accessed again. The goal is to make sure that frequently accessed (“hot”) pages remain in the buffer pool, even as read-ahead and full table scans bring in new blocks that might or might not be accessed afterward.

Linear read-ahead is a technique that predicts what pages might be needed soon based on pages in the buffer pool being accessed sequentially. You control when InnoDB performs a read-ahead operation by adjusting the number of sequential page accesses required to trigger an asynchronous read request, using the configuration parameter innodb_read_ahead_threshold. Before this parameter was added, InnoDB would only calculate whether to issue an asynchronous prefetch request for the entire next extent when it read the last page of the current extent.

The configuration parameter innodb_read_ahead_threshold controls how sensitive InnoDB is in detecting patterns of sequential page access. If the number of pages read sequentially from an extent is greater than or equal to innodb_read_ahead_threshold, InnoDB initiates an asynchronous read-ahead operation of the entire following extent. innodb_read_ahead_threshold can be set to any value from 0-64. The default value is 56. The higher the value, the more strict the access pattern check. For example, if you set the value to 48, InnoDB triggers a linear read-ahead request only when 48 pages in the current extent have been accessed sequentially. If the value is 8, InnoDB triggers an asynchronous read-ahead even if as few as 8 pages in the extent are accessed sequentially. You can set the value of this parameter in the MySQL configuration file, or change it dynamically with the SET GLOBAL statement, which requires privileges sufficient to set global system variables. See Section 7.1.9.1, “System Variable Privileges”.

### Configuring Buffer Pool Flushing

InnoDB performs certain tasks in the background, including flushing of dirty pages from the buffer pool. Dirty pages are those that have been modified but are not yet written to the data files on disk.

Buffer pool flushing is performed by page cleaner threads. The number of page cleaner threads is controlled by the innodb_page_cleaners variable, which has a default value set to the same value as innodb_buffer_pool_instances.

InnoDB aggressively flushes buffer pool pages if the percentage of dirty pages in the buffer pool reaches the innodb_max_dirty_pages_pct threshold.

innodb_max_dirty_pages_pct_lwm: Defines a low water mark representing the percentage of dirty pages at which preflushing is enabled to control the dirty page ratio. prevent the amount of dirty pages from reaching the threshold defined by the innodb_max_dirty_pages_pct variable

The innodb_flush_neighbors variable defines whether flushing a page from the buffer pool also flushes other dirty pages in the same extent.

The innodb_lru_scan_depth variable specifies, per buffer pool instance, how far down the buffer pool LRU list the page cleaner thread scans looking for dirty pages to flush. This is a background operation performed by a page cleaner thread once per second. When tuning innodb_lru_scan_depth, start with a low value and configure the setting upward with the goal of rarely seeing zero free pages. Also, consider adjusting innodb_lru_scan_depth when changing the number of buffer pool instances, since innodb_lru_scan_depth * innodb_buffer_pool_instances defines the amount of work performed by the page cleaner thread each second. The innodb_lru_scan_depth variables are primarily intended for write-intensive workloads. Flushing can fall behind if it is not aggressive enough, or disk writes can saturate I/O capacity if flushing is too aggressive. 

#### Adaptive Flushing

InnoDB uses an adaptive flushing algorithm to dynamically adjust the rate of flushing based on the speed of redo log generation and the current rate of flushing.  ensuring that flushing activity keeps pace with the current workload. Based on this information, it decides how many dirty pages to flush from the buffer pool each second

The innodb_adaptive_flushing_lwm variable defines a low water mark for redo log capacity. When that threshold is crossed, adaptive flushing is enabled, even if the innodb_adaptive_flushing variable is disabled.

innodb_flushing_avg_loops: Number of iterations for which InnoDB keeps the previously calculated snapshot of the flushing state (metric time-window in seconds)

---

## Lock

Lock level: row-level, table-levl
InnoDB automatically detects deadlock conditions by default and rolls back one of the affected transactions.

innodb_deadlock_detect
innodb_lock_wait_timeout
    decrease this value for highly interactive applications or OLTP systems
    increase this value for long-running back-end operations
