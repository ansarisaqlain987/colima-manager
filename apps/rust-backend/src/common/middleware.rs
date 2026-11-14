use std::{fmt, sync::Arc};

use axum::{
    extract::{Request, State},
    http::header::ORIGIN,
    middleware::Next,
    response::{IntoResponse, Response},
};

use crate::common::error::ApiError;

#[derive(Clone)]
pub struct AllowedOrigins(Arc<Vec<String>>);

impl AllowedOrigins {
    pub fn parse(raw: &str) -> Self {
        let origins = raw
            .split(',')
            .map(|o| o.trim().trim_end_matches('/').to_string())
            .filter(|o| !o.is_empty())
            .collect();
        Self(Arc::new(origins))
    }

    fn allows(&self, origin: &str) -> bool {
        let origin = origin.trim_end_matches('/');
        self.0.iter().any(|allowed| allowed == origin)
    }
}

impl fmt::Display for AllowedOrigins {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0.join(", "))
    }
}

pub async fn check_origin(
    State(allowed): State<AllowedOrigins>,
    request: Request,
    next: Next,
) -> Response {
    if let Some(origin) = request.headers().get(ORIGIN) {
        let ok = origin.to_str().map(|o| allowed.allows(o)).unwrap_or(false);
        if !ok {
            tracing::warn!(?origin, "rejected request from disallowed origin");
            return ApiError::forbidden("origin not allowed").into_response();
        }
    }
    next.run(request).await
}

#[cfg(test)]
mod tests {
    use super::AllowedOrigins;

    #[test]
    fn matches_configured_origins_only() {
        let allowed = AllowedOrigins::parse("http://localhost:1420, http://127.0.0.1:1420/");
        assert!(allowed.allows("http://localhost:1420"));
        assert!(allowed.allows("http://127.0.0.1:1420"));
        assert!(!allowed.allows("http://evil.example"));
        assert!(!allowed.allows("http://localhost:1421"));
    }
}
