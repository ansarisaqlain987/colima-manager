use serde_json::Value;

use crate::common::{docker, error::ApiResult};

pub async fn info() -> ApiResult<Value> {
    docker::json(&["info", "--format", "{{json .}}"]).await
}

pub async fn version() -> ApiResult<Value> {
    docker::json(&["version", "--format", "{{json .}}"]).await
}

pub async fn disk_usage() -> ApiResult<Vec<Value>> {
    docker::json_lines(&["system", "df", "--format", "{{json .}}"]).await
}
