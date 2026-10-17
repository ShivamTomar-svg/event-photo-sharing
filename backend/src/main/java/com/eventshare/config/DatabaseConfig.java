package com.eventshare.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${spring.datasource.url:}")
    private String configuredUrl;

    @Value("${spring.datasource.username:}")
    private String configuredUsername;

    @Value("${spring.datasource.password:}")
    private String configuredPassword;

    @Value("${spring.datasource.driver-class-name:com.mysql.cj.jdbc.Driver}")
    private String driverClassName;

    @Bean
    @Primary
    public DataSource dataSource() {
        // Check if raw cloud connection string was provided (e.g., Railway MYSQL_URL / DATABASE_URL)
        String rawUrl = System.getenv("MYSQL_URL");
        if (rawUrl == null || rawUrl.isBlank()) {
            rawUrl = System.getenv("DATABASE_URL");
        }
        if (rawUrl == null || rawUrl.isBlank()) {
            rawUrl = configuredUrl;
        }

        HikariConfig config = new HikariConfig();
        config.setDriverClassName(driverClassName);

        if (rawUrl != null && rawUrl.startsWith("mysql://")) {
            log.info("Detected mysql:// URL scheme from Railway/cloud environment. Transforming to standard JDBC format...");
            try {
                URI uri = new URI(rawUrl);
                String host = uri.getHost();
                int port = uri.getPort() > 0 ? uri.getPort() : 3306;
                String path = uri.getPath();
                String database = (path != null && path.length() > 1) ? path.substring(1) : "railway";

                String query = uri.getQuery();
                String params = (query != null && !query.isBlank())
                        ? "?" + query
                        : "?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";

                String jdbcUrl = "jdbc:mysql://" + host + ":" + port + "/" + database + params;
                config.setJdbcUrl(jdbcUrl);

                if (uri.getUserInfo() != null) {
                    String[] userInfo = uri.getUserInfo().split(":", 2);
                    config.setUsername(userInfo[0]);
                    if (userInfo.length > 1) {
                        config.setPassword(userInfo[1]);
                    }
                } else {
                    config.setUsername(configuredUsername);
                    config.setPassword(configuredPassword);
                }
                log.info("Successfully configured JDBC connection for host: {}:{} and database: {}", host, port, database);
            } catch (Exception e) {
                log.warn("Failed to parse mysql:// URL as URI: {}. Applying direct prefix replacement.", e.getMessage());
                config.setJdbcUrl(rawUrl.replace("mysql://", "jdbc:mysql://"));
                config.setUsername(configuredUsername);
                config.setPassword(configuredPassword);
            }
        } else {
            // Standard JDBC URL configured via SPRING_DATASOURCE_URL or application.properties
            config.setJdbcUrl(configuredUrl);
            config.setUsername(configuredUsername);
            config.setPassword(configuredPassword);
            log.info("Using configured JDBC datasource URL: {}", sanitizeUrl(configuredUrl));
        }

        // Production connection pool tuning for cloud databases (Railway/AWS/Render)
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setIdleTimeout(30000);
        config.setConnectionTimeout(30000);
        config.setMaxLifetime(1800000);

        return new HikariDataSource(config);
    }

    private String sanitizeUrl(String url) {
        if (url == null) return "null";
        return url.replaceAll(":[^/@]+@", ":***@");
    }
}
