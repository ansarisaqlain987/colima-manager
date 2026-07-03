use std::process::Command;

use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::TrayIconBuilder,
    Manager,
};

use std::sync::{Arc, Mutex};

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

fn spawn_update_tray_item<R: tauri::Runtime + 'static>(
    toggle: MenuItem<R>,
    status_item: MenuItem<R>,
) {
    // Spawn an async task to check status and update the menu items
    tauri::async_runtime::spawn(async move {
        match get_colima_status().await {
            Ok(status) => {
                if status.active {
                    let _ = toggle.set_text("Stop Colima");
                    let _ = toggle.set_enabled(true);
                    let _ = status_item.set_text("Status\t\t\t\t🟢");
                    let _ = status_item.set_enabled(false);
                } else {
                    let _ = toggle.set_text("Start Colima");
                    let _ = toggle.set_enabled(true);
                    let _ = status_item.set_text("Status\t\t\t\t🔴");
                    let _ = status_item.set_enabled(false);
                }
            }
            Err(_) => {
                let _ = toggle.set_text("Colima not present");
                let _ = toggle.set_enabled(false);
                let _ = status_item.set_text("Status\t\t\t\t⚪️");
                let _ = status_item.set_enabled(false);
            }
        }
    });
}

#[tauri::command]
async fn colima_start(args: Option<serde_json::Value>) -> Result<(), String> {
    let args = args.unwrap_or(serde_json::json!({}));

    let profile = args
        .get("profile")
        .and_then(|v| v.as_str())
        .map(String::from);
    let cpu = args.get("cpu").and_then(|v| v.as_u64()).map(|n| n as usize);
    let memory = args.get("memory").and_then(|v| v.as_u64());
    let disk = args.get("disk").and_then(|v| v.as_u64()).map(|n| n as u32);
    let arch = args.get("arch").and_then(|v| v.as_str()).map(String::from);
    let container_runtime = args
        .get("container_runtime")
        .and_then(|v| v.as_str())
        .map(String::from);
    let mount_type = args
        .get("mount_type")
        .and_then(|v| v.as_str())
        .map(String::from);

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

    let profile = args
        .get("profile")
        .and_then(|v| v.as_str())
        .map(String::from);

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
    let should_exit = Arc::new(Mutex::new(false));
    let exit_flag = should_exit.clone();

    tauri::Builder::default()
        .setup(move |app| {
            let window = app.get_webview_window("main").expect("Failed to get main webview window");
            window.hide()?;

            let open = MenuItem::with_id(app, "open", "Open App", true, None::<&str>)?;
            // Use a tab between label and emoji so the OS places the emoji in a right-aligned column
            let status = MenuItem::with_id(app, "status", "Status\t⚪️", false, None::<&str>)?;
            let toggle = MenuItem::with_id(app, "toggle", "Start Colima", true, None::<&str>)?;
            let toggle_for_setup = toggle.clone();
            let status_for_setup = status.clone();
            let separator = PredefinedMenuItem::separator(app)?;
            let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;

            let menu = Menu::with_items(
                app,
                &[&open, &separator, &status, &toggle, &separator, &quit],
            )?;

            let quit_flag = should_exit.clone();

            let tray = TrayIconBuilder::new()
                .menu(&menu)
                .icon(app.default_window_icon().expect("Failed to get app default icon").clone())
                .on_menu_event(move |app, event| {
                    match event.id.as_ref() {
                        "open" => {
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.unminimize();
                                let _ = window.set_focus();
                            }
                        }

                        "toggle" => {
                            // Disable the item and show a transient label while working
                            let _ = toggle.set_enabled(false);
                            // Decide action based on current status
                            let toggle_for_task = toggle.clone();
                            let status_for_task = status.clone();
                            tauri::async_runtime::spawn(async move {
                                let toggle = toggle_for_task;
                                match get_colima_status().await {
                                    Ok(s) => {
                                        if s.active {
                                            let _ = toggle.set_text("Stopping...");
                                            let _ = colima_stop(None).await;
                                        } else {
                                            let _ = toggle.set_text("Starting...");
                                            let _ = colima_start(None).await;
                                        }
                                    }
                                    Err(_) => {
                                        // If colima not present, keep it disabled with message
                                    }
                                }

                                // Refresh label/state after operation
                                spawn_update_tray_item(toggle.clone(), status_for_task.clone());
                            });
                        }

                        "quit" => {
                            *quit_flag.lock().unwrap() = true;
                            app.exit(0);
                        }

                        _ => {}
                    }
                })
                .build(app)?;

            app.manage(tray);

            // Initialize the toggle and status label/state on startup
            spawn_update_tray_item(toggle_for_setup, status_for_setup);

            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.hide();
            }
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_colima_status,
            colima_start,
            colima_stop
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(move |_app_handle, event| {
            if let tauri::RunEvent::ExitRequested { api, .. } = event {
                if !*exit_flag.lock().unwrap() {
                    api.prevent_exit();
                }
            }
        });
}
