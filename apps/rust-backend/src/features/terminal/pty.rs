use std::io::{Read, Write};

use axum::extract::ws::{Message, WebSocket};
use futures_util::{SinkExt, StreamExt};
use portable_pty::{native_pty_system, CommandBuilder, PtySize};
use tokio::sync::mpsc;

use super::models::ClientMessage;

const READ_BUFFER_SIZE: usize = 8192;
const SHELL_SELECTOR: &str = "if command -v bash >/dev/null 2>&1; then exec bash; else exec sh; fi";

fn shell_command(container: Option<&str>) -> CommandBuilder {
    let mut cmd = match container {
        Some(id) => {
            let mut cmd = CommandBuilder::new("docker");
            cmd.args([
                "exec",
                "-it",
                "-e",
                "TERM=xterm-256color",
                id,
                "sh",
                "-c",
                SHELL_SELECTOR,
            ]);
            cmd
        }
        None => {
            let mut cmd = CommandBuilder::new("bash");
            cmd.arg("-l");
            cmd.cwd("/root");
            cmd
        }
    };
    cmd.env("TERM", "xterm-256color");
    cmd
}

fn size(cols: u16, rows: u16) -> PtySize {
    PtySize {
        rows,
        cols,
        pixel_width: 0,
        pixel_height: 0,
    }
}

pub async fn run_session(socket: WebSocket, container: Option<String>) -> Result<(), String> {
    let pair = native_pty_system()
        .openpty(size(80, 24))
        .map_err(|e| format!("openpty: {e}"))?;

    let mut child = pair
        .slave
        .spawn_command(shell_command(container.as_deref()))
        .map_err(|e| format!("spawn shell: {e}"))?;
    drop(pair.slave);

    let mut reader = pair
        .master
        .try_clone_reader()
        .map_err(|e| format!("pty reader: {e}"))?;
    let mut writer = pair
        .master
        .take_writer()
        .map_err(|e| format!("pty writer: {e}"))?;
    let master = pair.master;

    let (out_tx, mut out_rx) = mpsc::channel::<Vec<u8>>(64);
    std::thread::spawn(move || {
        let mut buf = [0u8; READ_BUFFER_SIZE];
        loop {
            match reader.read(&mut buf) {
                Ok(0) | Err(_) => break,
                Ok(n) => {
                    if out_tx.blocking_send(buf[..n].to_vec()).is_err() {
                        break;
                    }
                }
            }
        }
    });

    let (mut ws_tx, mut ws_rx) = socket.split();

    loop {
        tokio::select! {
            output = out_rx.recv() => match output {
                Some(bytes) => {
                    if ws_tx.send(Message::Binary(bytes.into())).await.is_err() {
                        break;
                    }
                }
                None => break,
            },
            msg = ws_rx.next() => match msg {
                Some(Ok(Message::Text(text))) => {
                    match serde_json::from_str::<ClientMessage>(text.as_str()) {
                        Ok(ClientMessage::Input { data }) => {
                            if writer.write_all(data.as_bytes()).is_err() {
                                break;
                            }
                        }
                        Ok(ClientMessage::Resize { cols, rows }) if cols > 0 && rows > 0 => {
                            let _ = master.resize(size(cols, rows));
                        }
                        _ => {}
                    }
                }
                Some(Ok(Message::Binary(bytes))) => {
                    if writer.write_all(&bytes).is_err() {
                        break;
                    }
                }
                Some(Ok(Message::Close(_))) | Some(Err(_)) | None => break,
                Some(Ok(_)) => {}
            },
        }
    }

    let _ = child.kill();
    let _ = ws_tx.send(Message::Close(None)).await;
    Ok(())
}
