use serde_json::Value;

use crate::common::{docker, error::ApiResult};

pub async fn list() -> ApiResult<Vec<Value>> {
    docker::json_lines(&["network", "ls", "--format", "{{json .}}"]).await
}

pub async fn remove(id: &str) -> ApiResult<()> {
    docker::run(&["network", "rm", id]).await?;
    Ok(())
}

pub async fn prune() -> ApiResult<String> {
    docker::run(&["network", "prune", "--force"]).await
}
