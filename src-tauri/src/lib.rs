use std::process::Command;

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
fn get_colima_status() -> Result<ColimaStatus, String> {
    let output = Command::new("colima")
        .args(["status"])
        .output()
        .map_err(|e| format!("Failed to execute colima: {}", e))?;

    let status_output = String::from_utf8_lossy(&output.stdout);
    let active = status_output.trim() == "running";

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
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_colima_status])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
