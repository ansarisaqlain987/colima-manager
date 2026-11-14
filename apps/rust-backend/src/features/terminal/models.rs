use serde::Deserialize;

#[derive(Deserialize)]
pub struct TerminalQuery {
    pub container: Option<String>,
}

#[derive(Deserialize)]
#[serde(tag = "type", rename_all = "lowercase")]
pub enum ClientMessage {
    Input { data: String },
    Resize { cols: u16, rows: u16 },
}
