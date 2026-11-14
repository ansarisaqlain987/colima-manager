use serde_json::Value;

use super::models::ContainerAction;
use crate::common::{docker, error::ApiResult};

pub async fn list() -> ApiResult<Vec<Value>> {
    docker::json_lines(&["ps", "--all", "--format", "{{json .}}"]).await
}

pub async fn stats() -> ApiResult<Vec<Value>> {
    docker::json_lines(&["stats", "--no-stream", "--format", "{{json .}}"]).await
}

pub async fn inspect(id: &str) -> ApiResult<Value> {
    let mut value = docker::json(&["container", "inspect", id]).await?;
    Ok(value.get_mut(0).map(Value::take).unwrap_or(value))
}

pub async fn run_action(id: &str, action: ContainerAction) -> ApiResult<()> {
    docker::run(&["container", action.as_str(), id]).await?;
    Ok(())
}

pub async fn remove(id: &str) -> ApiResult<()> {
    docker::run(&["container", "rm", "--force", "--volumes", id]).await?;
    Ok(())
}

pub async fn prune() -> ApiResult<String> {
    docker::run(&["container", "prune", "--force"]).await
}
