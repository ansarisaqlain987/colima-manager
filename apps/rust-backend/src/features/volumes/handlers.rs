use axum::{extract::Path, Json};
use serde_json::Value;

use super::{models::CreateBody, service};
use crate::common::{docker, error::ApiResult, response};

pub async fn list() -> ApiResult<Json<Vec<Value>>> {
    Ok(Json(service::list().await?))
}

pub async fn create(Json(body): Json<CreateBody>) -> ApiResult<Json<Value>> {
    let name = docker::validate_ref(body.name.trim())?;
    service::create(name).await?;
    Ok(response::ok())
}

pub async fn remove(Path(name): Path<String>) -> ApiResult<Json<Value>> {
    let name = docker::validate_ref(&name)?;
    service::remove(name).await?;
    Ok(response::ok())
}

pub async fn prune() -> ApiResult<Json<Value>> {
    Ok(response::ok_with_output(service::prune().await?))
}
