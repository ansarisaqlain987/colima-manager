use std::process::Stdio;

use axum::{
    extract::{
        ws::{Message, WebSocket},
        Path, Query, WebSocketUpgrade,
    },
    response::Response,
};
use tokio::{
    io::{AsyncBufReadExt, AsyncRead, BufReader},
    process::Command,
    sync::mpsc,
};

use super::models::LogsQuery;
use crate::common::{docker, error::ApiResult};

const DEFAULT_TAIL: u32 = 500;
const MAX_TAIL: u32 = 10_000;

pub async fn stream(
    ws: WebSocketUpgrade,
    Path(id): Path<String>,
    Query(query): Query<LogsQuery>,
) -> ApiResult<Response> {
    let id = docker::validate_ref(&id)?.to_string();
    let tail = query.tail.unwrap_or(DEFAULT_TAIL).min(MAX_TAIL);
    Ok(ws.on_upgrade(move |socket| follow(socket, id, tail)))
}

async fn follow(mut socket: WebSocket, id: String, tail: u32) {
    let tail = tail.to_string();
    let child = Command::new("docker")
        .args(["logs", "--follow", "--timestamps", "--tail", &tail, &id])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .kill_on_drop(true)
        .spawn();

    let mut child = match child {
        Ok(child) => child,
        Err(e) => {
            let _ = socket
                .send(Message::Text(
                    format!("failed to run docker logs: {e}\n").into(),
                ))
                .await;
            return;
        }
    };

    let (tx, mut rx) = mpsc::channel::<String>(256);
    if let Some(stdout) = child.stdout.take() {
        tokio::spawn(forward_lines(stdout, tx.clone()));
    }
    if let Some(stderr) = child.stderr.take() {
        tokio::spawn(forward_lines(stderr, tx.clone()));
    }
    drop(tx);

    loop {
        tokio::select! {
            line = rx.recv() => match line {
                Some(line) => {
                    if socket.send(Message::Text(line.into())).await.is_err() {
                        break;
                    }
                }
                None => break,
            },
            msg = socket.recv() => match msg {
                Some(Ok(Message::Close(_))) | Some(Err(_)) | None => break,
                _ => {}
            },
        }
    }

    let _ = child.kill().await;
    let _ = socket.send(Message::Close(None)).await;
}

async fn forward_lines(pipe: impl AsyncRead + Unpin, tx: mpsc::Sender<String>) {
    let mut lines = BufReader::new(pipe).lines();
    while let Ok(Some(line)) = lines.next_line().await {
        if tx.send(format!("{line}\n")).await.is_err() {
            break;
        }
    }
}
