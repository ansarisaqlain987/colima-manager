use axum::{middleware, Router};
use tower_http::trace::TraceLayer;

use crate::{
    common::middleware::{check_origin, AllowedOrigins},
    features,
};

pub fn build(allowed_origins: AllowedOrigins) -> Router {
    let api = Router::new()
        .merge(features::system::router())
        .merge(features::containers::router())
        .merge(features::images::router())
        .merge(features::volumes::router())
        .merge(features::networks::router())
        .merge(features::terminal::router());

    Router::new()
        .nest("/api", api)
        .layer(middleware::from_fn_with_state(
            allowed_origins,
            check_origin,
        ))
        .layer(TraceLayer::new_for_http())
}
