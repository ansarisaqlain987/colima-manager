use axum::Json;
use serde_json::{json, Value};

pub fn ok() -> Json<Value> {
    Json(json!({ "ok": true }))
}

pub fn ok_with_output(output: String) -> Json<Value> {
    Json(json!({ "ok": true, "output": output }))
}
