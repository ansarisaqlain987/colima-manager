use axum::{routing::get, Router};

use super::handlers;

pub fn router() -> Router {
    Router::new()
        .route("/health", get(handlers::health))
        .route("/info", get(handlers::info))
        .route("/version", get(handlers::version))
        .route("/disk", get(handlers::disk_usage))
}
