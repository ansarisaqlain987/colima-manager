use axum::{
    extract::{Query, WebSocketUpgrade},
    response::Response,
};

use super::{models::TerminalQuery, pty};
use crate::common::{docker, error::ApiResult};

pub async fn open(ws: WebSocketUpgrade, Query(query): Query<TerminalQuery>) -> ApiResult<Response> {
    let container = match query.container {
        Some(id) => Some(docker::validate_ref(&id)?.to_string()),
        None => None,
    };
    Ok(ws.on_upgrade(move |socket| async move {
        if let Err(e) = pty::run_session(socket, container).await {
            tracing::warn!("terminal session ended with error: {e}");
        }
    }))
}
