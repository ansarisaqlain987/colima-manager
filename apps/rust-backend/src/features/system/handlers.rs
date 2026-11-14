use axum::Json;
use serde_json::Value;

use super::service;
use crate::common::{error::ApiResult, response};

pub async fn health() -> Json<Value> {
    response::ok()
}

pub async fn info() -> ApiResult<Json<Value>> {
    Ok(Json(service::info().await?))
}

pub async fn version() -> ApiResult<Json<Value>> {
    Ok(Json(service::version().await?))
}

pub async fn disk_usage() -> ApiResult<Json<Vec<Value>>> {
    Ok(Json(service::disk_usage().await?))
}
