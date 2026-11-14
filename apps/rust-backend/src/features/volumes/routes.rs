use axum::{
    routing::{delete, get, post},
    Router,
};

use super::handlers;

pub fn router() -> Router {
    Router::new()
        .route("/volumes", get(handlers::list).post(handlers::create))
        .route("/volumes/prune", post(handlers::prune))
        .route("/volumes/{name}", delete(handlers::remove))
}
