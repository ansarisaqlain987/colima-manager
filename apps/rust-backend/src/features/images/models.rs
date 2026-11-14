use serde::Deserialize;

#[derive(Deserialize)]
pub struct PullBody {
    pub image: String,
}

#[derive(Deserialize)]
pub struct RemoveQuery {
    #[serde(default)]
    pub force: bool,
}

#[derive(Deserialize)]
pub struct PruneQuery {
    #[serde(default)]
    pub all: bool,
}
