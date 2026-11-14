use serde_json::Value;

use crate::common::{docker, error::ApiResult};

pub async fn list() -> ApiResult<Vec<Value>> {
    docker::json_lines(&["image", "ls", "--format", "{{json .}}"]).await
}

pub async fn pull(image: &str) -> ApiResult<String> {
    docker::run(&["image", "pull", image]).await
}

pub async fn remove(id: &str, force: bool) -> ApiResult<()> {
    let mut args = vec!["image", "rm"];
    if force {
        args.push("--force");
    }
    args.push(id);
    docker::run(&args).await?;
    Ok(())
}

pub async fn prune(all: bool) -> ApiResult<String> {
    let mut args = vec!["image", "prune", "--force"];
    if all {
        args.push("--all");
    }
    docker::run(&args).await
}
