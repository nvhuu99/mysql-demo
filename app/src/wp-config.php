<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the website, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://developer.wordpress.org/advanced-administration/wordpress/wp-config/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'wp_db' );

/** Database username */
define( 'DB_USER', 'root' );

/** Database password */
define( 'DB_PASSWORD', 'admin' );

/** Database hostname */
define( 'DB_HOST', 'wp-db' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         '4;.: 4M>RU6jeg?]It,Jk>+AuW)zd|.JA;MLL$Inz74w,)sqqtv$?r{N4~0/9E!@' );
define( 'SECURE_AUTH_KEY',  'jD/c:VaZieuTbC2P^rgb`z]8*399*Guw2uCZ:pEY|(t@jYi4qis<=5|$qt?ukI9Z' );
define( 'LOGGED_IN_KEY',    '@F-#>O@Kez^WEEn-utH;S^&;XS_tqm8d7d?$&0!r]6X[uiZxrQEF$zf.|4#a:)g3' );
define( 'NONCE_KEY',        'MTSJ8n4yC=vv,XST.xhQI@}y}cPo1)_VS~rbI.HJeS/Ru!V$T%`PFStmmGKg/r.0' );
define( 'AUTH_SALT',        'M+Mg-ZL[Fk;A<3zS(W]Vx qovl}>(duLXhl~H64f)+jHUZZhBo#pcYa_Om6W%Sks' );
define( 'SECURE_AUTH_SALT', 'J.sU~)cj`W?R#eWi`:<],Tw1/Wws,W${lf<eXV]dBwewSZNh`Ns!tz qWd8[F1/Y' );
define( 'LOGGED_IN_SALT',   'v4]g/iuC}$q&Sfb)%^^A4?qN8/tXKs<@N+urFBPs=B+M @FSdhf,@9(s}doCdV(0' );
define( 'NONCE_SALT',       ']_P2|qIuU/C5v7[KemG%jIngBo3Kza^`8r9<kz13OSx`Zy/8Z@qXdxL/-(!;+sFG' );

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 *
 * At the installation time, database tables are created with the specified prefix.
 * Changing this value after WordPress is installed will make your site think
 * it has not been installed.
 *
 * @link https://developer.wordpress.org/advanced-administration/wordpress/wp-config/#table-prefix
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://developer.wordpress.org/advanced-administration/debug/debug-wordpress/
 */
define( 'WP_DEBUG', false );

/* Add any custom values between this line and the "stop editing" line. */



/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
