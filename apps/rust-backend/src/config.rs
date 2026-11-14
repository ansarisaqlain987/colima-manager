use std::{env, net::SocketAddr};

use crate::common::middleware::AllowedOrigins;

const DEFAULT_BIND_ADDR: &str = "127.0.0.1:8080";
const DEFAULT_ALLOWED_ORIGINS: &str = "http://localhost:1420,http://127.0.0.1:1420";

pub struct Config {
    pub bind_addr: SocketAddr,
    pub allowed_origins: AllowedOrigins,
}

impl Config {
    pub fn from_env() -> Self {
        let bind_addr = env::var("BIND_ADDR")
            .unwrap_or_else(|_| DEFAULT_BIND_ADDR.to_string())
            .parse()
            .expect("BIND_ADDR must be a socket address like 0.0.0.0:8080");

        let allowed_origins = AllowedOrigins::parse(
            &env::var("ALLOWED_ORIGINS").unwrap_or_else(|_| DEFAULT_ALLOWED_ORIGINS.to_string()),
        );

        Self {
            bind_addr,
            allowed_origins,
        }
    }
}
