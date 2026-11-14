mod app;
mod common;
mod config;
mod features;

use tracing_subscriber::EnvFilter;

use crate::config::Config;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")),
        )
        .init();

    let config = Config::from_env();
    tracing::info!("allowed origins: {}", config.allowed_origins);

    let app = app::build(config.allowed_origins);

    let listener = tokio::net::TcpListener::bind(config.bind_addr)
        .await
        .unwrap_or_else(|e| panic!("failed to bind {}: {e}", config.bind_addr));
    tracing::info!(
        "colima-manager backend listening on http://{}",
        config.bind_addr
    );

    axum::serve(listener, app).await.expect("server error");
}
