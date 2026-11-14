use axum::{routing::get, Router};

use super::handlers;

pub fn router() -> Router {
    Router::new().route("/terminal", get(handlers::open))
}
