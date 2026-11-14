use axum::{
    routing::{get, post},
    Router,
};

use super::{handlers, logs};

pub fn router() -> Router {
    Router::new()
        .route("/containers", get(handlers::list))
        .route("/containers/stats", get(handlers::stats))
        .route("/containers/prune", post(handlers::prune))
        .route(
            "/containers/{id}",
            get(handlers::inspect).delete(handlers::remove),
        )
        .route("/containers/{id}/logs", get(logs::stream))
        .route("/containers/{id}/{action}", post(handlers::action))
}
