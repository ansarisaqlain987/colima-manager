use serde_json::Value;

use crate::common::{docker, error::ApiResult};

pub async fn list() -> ApiResult<Vec<Value>> {
    docker::json_lines(&["volume", "ls", "--format", "{{json .}}"]).await
}

pub async fn create(name: &str) -> ApiResult<()> {
    docker::run(&["volume", "create", name]).await?;
    Ok(())
}

pub async fn remove(name: &str) -> ApiResult<()> {
    docker::run(&["volume", "rm", name]).await?;
    Ok(())
}

pub async fn prune() -> ApiResult<String> {
    docker::run(&["volume", "prune", "--all", "--force"]).await
}
