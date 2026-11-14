use serde_json::Value;
use tokio::process::Command;

use crate::common::error::{ApiError, ApiResult};

pub async fn run(args: &[&str]) -> ApiResult<String> {
    let output = Command::new("docker")
        .args(args)
        .output()
        .await
        .map_err(|e| ApiError::internal(format!("failed to run docker: {e}")))?;

    if !output.status.success() {
        return Err(ApiError::from_docker_stderr(&String::from_utf8_lossy(
            &output.stderr,
        )));
    }
    Ok(String::from_utf8_lossy(&output.stdout).into_owned())
}

pub async fn json_lines(args: &[&str]) -> ApiResult<Vec<Value>> {
    let stdout = run(args).await?;
    stdout
        .lines()
        .map(str::trim)
        .filter(|line| !line.is_empty())
        .map(|line| {
            serde_json::from_str(line)
                .map_err(|e| ApiError::internal(format!("invalid JSON from docker: {e}")))
        })
        .collect()
}

pub async fn json(args: &[&str]) -> ApiResult<Value> {
    let stdout = run(args).await?;
    serde_json::from_str(stdout.trim())
        .map_err(|e| ApiError::internal(format!("invalid JSON from docker: {e}")))
}

pub fn validate_ref(value: &str) -> ApiResult<&str> {
    let valid = !value.is_empty()
        && value.len() <= 256
        && value
            .chars()
            .next()
            .is_some_and(|c| c.is_ascii_alphanumeric())
        && value
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || "_.-:/@".contains(c));
    if valid {
        Ok(value)
    } else {
        Err(ApiError::bad_request(format!(
            "invalid identifier: {value:?}"
        )))
    }
}

#[cfg(test)]
mod tests {
    use super::validate_ref;

    #[test]
    fn accepts_ids_names_and_image_refs() {
        for ok in [
            "a1b2c3",
            "my_container-1",
            "nginx:1.27",
            "ghcr.io/org/app:latest",
            "sha256:abc123",
            "busybox@sha256:abc",
        ] {
            assert!(validate_ref(ok).is_ok(), "{ok}");
        }
    }

    #[test]
    fn rejects_flags_and_odd_characters() {
        for bad in ["", "-f", "--rm", "a b", "a;b", "$(x)", "a\nb", "/etc"] {
            assert!(validate_ref(bad).is_err(), "{bad:?}");
        }
    }
}
