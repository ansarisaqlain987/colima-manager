use axum::{extract::Path, Json};
use serde_json::Value;

use super::{models::ContainerAction, service};
use crate::common::{docker, error::ApiResult, response};

pub async fn list() -> ApiResult<Json<Vec<Value>>> {
    Ok(Json(service::list().await?))
}

pub async fn stats() -> ApiResult<Json<Vec<Value>>> {
    Ok(Json(service::stats().await?))
}

pub async fn inspect(Path(id): Path<String>) -> ApiResult<Json<Value>> {
    let id = docker::validate_ref(&id)?;
    Ok(Json(service::inspect(id).await?))
}

pub async fn action(Path((id, action)): Path<(String, String)>) -> ApiResult<Json<Value>> {
    let id = docker::validate_ref(&id)?;
    let action = ContainerAction::parse(&action)?;
    service::run_action(id, action).await?;
    Ok(response::ok())
}

pub async fn remove(Path(id): Path<String>) -> ApiResult<Json<Value>> {
    let id = docker::validate_ref(&id)?;
    service::remove(id).await?;
    Ok(response::ok())
}

pub async fn prune() -> ApiResult<Json<Value>> {
    Ok(response::ok_with_output(service::prune().await?))
}
