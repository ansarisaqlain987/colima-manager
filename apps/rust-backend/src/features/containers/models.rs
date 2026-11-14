use serde::Deserialize;

use crate::common::error::{ApiError, ApiResult};

#[derive(Debug, Clone, Copy)]
pub enum ContainerAction {
    Start,
    Stop,
    Restart,
    Pause,
    Unpause,
    Kill,
}

impl ContainerAction {
    pub fn parse(value: &str) -> ApiResult<Self> {
        match value {
            "start" => Ok(Self::Start),
            "stop" => Ok(Self::Stop),
            "restart" => Ok(Self::Restart),
            "pause" => Ok(Self::Pause),
            "unpause" => Ok(Self::Unpause),
            "kill" => Ok(Self::Kill),
            other => Err(ApiError::bad_request(format!("unknown action: {other}"))),
        }
    }

    pub fn as_str(self) -> &'static str {
        match self {
            Self::Start => "start",
            Self::Stop => "stop",
            Self::Restart => "restart",
            Self::Pause => "pause",
            Self::Unpause => "unpause",
            Self::Kill => "kill",
        }
    }
}

#[derive(Deserialize)]
pub struct LogsQuery {
    pub tail: Option<u32>,
}

#[cfg(test)]
mod tests {
    use super::ContainerAction;

    #[test]
    fn parses_known_actions_only() {
        for action in ["start", "stop", "restart", "pause", "unpause", "kill"] {
            assert_eq!(ContainerAction::parse(action).unwrap().as_str(), action);
        }
        assert!(ContainerAction::parse("rm").is_err());
        assert!(ContainerAction::parse("--help").is_err());
    }
}
