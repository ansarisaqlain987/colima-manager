use serde::Deserialize;

#[derive(Deserialize)]
pub struct CreateBody {
    pub name: String,
}
