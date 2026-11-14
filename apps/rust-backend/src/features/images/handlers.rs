use axum::{
    extract::{Path, Query},
    Json,
};
use serde_json::Value;

use super::{
    models::{PruneQuery, PullBody, RemoveQuery},
    service,
};
use crate::common::{docker, error::ApiResult, response};

pub async fn list() -> ApiResult<Json<Vec<Value>>> {
    Ok(Json(service::list().await?))
}

pub async fn pull(Json(body): Json<PullBody>) -> ApiResult<Json<Value>> {
    let image = docker::validate_ref(body.image.trim())?;
    Ok(response::ok_with_output(service::pull(image).await?))
}

pub async fn remove(
    Path(id): Path<String>,
    Query(query): Query<RemoveQuery>,
) -> ApiResult<Json<Value>> {
    let id = docker::validate_ref(&id)?;
    service::remove(id, query.force).await?;
    Ok(response::ok())
}

pub async fn prune(Query(query): Query<PruneQuery>) -> ApiResult<Json<Value>> {
    Ok(response::ok_with_output(service::prune(query.all).await?))
}
