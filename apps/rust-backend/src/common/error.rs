use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;

#[derive(Debug)]
pub struct ApiError {
    pub status: StatusCode,
    pub message: String,
}

impl ApiError {
    pub fn new(status: StatusCode, message: impl Into<String>) -> Self {
        Self {
            status,
            message: message.into(),
        }
    }

    pub fn bad_request(message: impl Into<String>) -> Self {
        Self::new(StatusCode::BAD_REQUEST, message)
    }

    pub fn forbidden(message: impl Into<String>) -> Self {
        Self::new(StatusCode::FORBIDDEN, message)
    }

    pub fn internal(message: impl Into<String>) -> Self {
        Self::new(StatusCode::INTERNAL_SERVER_ERROR, message)
    }

    pub fn from_docker_stderr(stderr: &str) -> Self {
        let message = stderr.trim();
        let lower = message.to_lowercase();
        let status = if lower.contains("no such") || lower.contains("not found") {
            StatusCode::NOT_FOUND
        } else if lower.contains("conflict")
            || lower.contains("in use")
            || lower.contains("is being used")
            || lower.contains("has active endpoints")
        {
            StatusCode::CONFLICT
        } else if lower.contains("cannot connect to the docker daemon") {
            StatusCode::SERVICE_UNAVAILABLE
        } else {
            StatusCode::BAD_GATEWAY
        };
        let message = if message.is_empty() {
            "docker command failed".to_string()
        } else {
            message.to_string()
        };
        Self::new(status, message)
    }
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        (self.status, Json(json!({ "error": self.message }))).into_response()
    }
}

pub type ApiResult<T> = Result<T, ApiError>;
