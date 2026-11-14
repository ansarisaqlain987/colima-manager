use axum::{
    routing::{delete, get, post},
    Router,
};

use super::handlers;

pub fn router() -> Router {
    Router::new()
        .route("/networks", get(handlers::list))
        .route("/networks/prune", post(handlers::prune))
        .route("/networks/{id}", delete(handlers::remove))
}
