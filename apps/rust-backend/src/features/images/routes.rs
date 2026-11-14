use axum::{
    routing::{delete, get, post},
    Router,
};

use super::handlers;

pub fn router() -> Router {
    Router::new()
        .route("/images", get(handlers::list))
        .route("/images/pull", post(handlers::pull))
        .route("/images/prune", post(handlers::prune))
        .route("/images/{id}", delete(handlers::remove))
}
