use std::process::Command;

use tauri::{
    Manager, menu::{Menu, MenuItem, PredefinedMenuItem}, tray::{TrayIconBuilder, TrayIconEvent}
};

#[derive(serde::Serialize)]
pub struct ColimaStatus {
    pub active: bool,
    pub container_runtime: Option<String>,
    pub cpu: Option<usize>,
    pub memory: Option<String>,
    pub disk: Option<String>,
}

#[derive(serde::Deserialize)]
struct ColimaConfig {
    container: Option<ContainerConfig>,
    #[serde(rename = "cpu")]
    config_cpu: Option<f64>,
    #[serde(rename = "memory")]
    config_memory: Option<f64>,
    #[serde(rename = "disk")]
    config_disk: Option<f64>,
}

#[derive(serde::Deserialize)]
struct ContainerConfig {
    runtime: Option<String>,
}

#[tauri::command]
async fn get_colima_status() -> Result<ColimaStatus, String> {
    tauri::async_runtime::spawn_blocking(|| {
        let output = Command::new("colima")
            .args(["status"])
            .output()
            .map_err(|e| {
                let msg = format!("Failed to execute colima: {}", e);
                if e.kind() == std::io::ErrorKind::NotFound {
                    "Colima is not installed. Please install colima first.".to_string()
                } else {
                    msg
                }
            })?;

        let stdout_output = String::from_utf8_lossy(&output.stdout);
        let stderr_output = String::from_utf8_lossy(&output.stderr);
        let status_output = if !stdout_output.trim().is_empty() {
            stdout_output.trim()
        } else {
            stderr_output.trim()
        };

        let active = status_output == "running" || status_output.contains("colima is running");

        let mut container_runtime: Option<String> = None;
        let mut cpu: Option<usize> = None;
        let mut memory: Option<String> = None;
        let mut disk: Option<String> = None;

        if active {
            let output = Command::new("colima")
                .args(["show", "--json"])
                .output()
                .ok()
                .filter(|o| o.status.success());

            if let Some(ref output) = output {
                let json_output = String::from_utf8_lossy(&output.stdout);
                if let Ok(config) = serde_json::from_str::<ColimaConfig>(&json_output) {
                    if let Some(ref runtime) = config.container.and_then(|c| c.runtime) {
                        container_runtime = Some(runtime.clone());
                    }
                    if let Some(c) = config.config_cpu {
                        cpu = Some(c as usize);
                    }
                    if let Some(m) = config.config_memory {
                        memory = if m >= 1.0 {
                            Some(format!("{:.0} GB", m))
                        } else {
                            Some(format!("{:.0} MB", m * 1024.0))
                        };
                    }
                    if let Some(d) = config.config_disk {
                        disk = if d >= 1.0 {
                            Some(format!("{:.0} GB", d))
                        } else {
                            Some(format!("{:.0} MB", d * 1024.0))
                        };
                    }
                }
            }
        }

        Ok(ColimaStatus {
            active,
            container_runtime,
            cpu,
            memory,
            disk,
        })
    })
    .await
    .map_err(|e| format!("Failed to run get_colima_status: {}", e))?
}

fn run_blocking_command(mut cmd: Command) -> Result<(), String> {
    let output = cmd
        .output()
        .map_err(|e| format!("Failed to execute colima command: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(stderr.trim().to_string());
    }

    Ok(())
}

#[tauri::command]
async fn colima_start(args: Option<serde_json::Value>) -> Result<(), String> {
    let args = args.unwrap_or(serde_json::json!({}));

    let profile = args.get("profile").and_then(|v| v.as_str()).map(String::from);
    let cpu = args.get("cpu").and_then(|v| v.as_u64()).map(|n| n as usize);
    let memory = args.get("memory").and_then(|v| v.as_u64());
    let disk = args.get("disk").and_then(|v| v.as_u64()).map(|n| n as u32);
    let arch = args.get("arch").and_then(|v| v.as_str()).map(String::from);
    let container_runtime = args.get("container_runtime").and_then(|v| v.as_str()).map(String::from);
    let mount_type = args.get("mount_type").and_then(|v| v.as_str()).map(String::from);

    let mut cmd = Command::new("colima");
    cmd.arg("start");

    if let Some(profile) = profile {
        cmd.arg("--profile").arg(profile);
    }
    if let Some(cpu) = cpu {
        cmd.arg("--cpu").arg(cpu.to_string());
    }
    if let Some(memory) = memory {
        cmd.arg("--memory").arg(memory.to_string());
    }
    if let Some(disk) = disk {
        cmd.arg("--disk").arg(disk.to_string());
    }
    if let Some(arch) = arch {
        cmd.arg("--arch").arg(arch);
    }
    if let Some(runtime) = container_runtime {
        cmd.arg("--runtime").arg(runtime);
    }
    if let Some(mount) = mount_type {
        cmd.arg("--mount-type").arg(mount);
    }

    tauri::async_runtime::spawn_blocking(move || run_blocking_command(cmd))
        .await
        .map_err(|e| format!("Failed to run colima start: {}", e))??;

    Ok(())
}

#[tauri::command]
async fn colima_stop(args: Option<serde_json::Value>) -> Result<(), String> {
    let args = args.unwrap_or(serde_json::json!({}));

    let profile = args.get("profile").and_then(|v| v.as_str()).map(String::from);

    let mut cmd = Command::new("colima");
    cmd.arg("stop");

    if let Some(profile) = profile {
        cmd.arg("--profile").arg(profile);
    }

    tauri::async_runtime::spawn_blocking(move || run_blocking_command(cmd))
        .await
        .map_err(|e| format!("Failed to run colima stop: {}", e))??;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            window.hide()?;

            let open = MenuItem::with_id(app, "open", "Open App", true, None::<&str>)?;
            let start = MenuItem::with_id(app, "start", "Start Colima", true, None::<&str>)?;
            let stop = MenuItem::with_id(app, "stop", "Stop Colima", true, None::<&str>)?;
            let separator = PredefinedMenuItem::separator(app)?;
            let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;

            let menu = Menu::with_items(
                app,
                &[&open, &start, &stop, &separator, &quit],
            )?;

            let tray = TrayIconBuilder::new()
                .menu(&menu)
                .icon(app.default_window_icon().unwrap().clone())
                .on_menu_event(|app, event| {
                    match event.id.as_ref() {
                        "open" => {
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.set_focus();
                                let _ = window.unminimize();
                            }
                        }

                        "start" => {
                            tauri::async_runtime::spawn(async {
                                if let Err(err) = colima_start(None).await {
                                    eprintln!("Failed to start Colima: {}", err);
                                }
                            });
                        }

                        "stop" => {
                            tauri::async_runtime::spawn(async {
                                if let Err(err) = colima_stop(None).await {
                                    eprintln!("Failed to stop Colima: {}", err);
                                }
                            });
                        }

                        "quit" => {
                            app.exit(0);
                        }

                        _ => {}
                    }
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click { .. } = event {
                        if let Some(window) = tray.app_handle().get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            // Keep tray alive
            app.manage(tray);

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_colima_status,
            colima_start,
            colima_stop
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
