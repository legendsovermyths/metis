use std::{
    sync::OnceLock,
    time::{Duration, Instant, SystemTime, UNIX_EPOCH},
};

use jsonwebtoken::{Algorithm, EncodingKey, Header, encode};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use tokio::sync::Mutex;

use crate::error::{MetisError, Result};

const TOKEN_URL: &str = "https://oauth2.googleapis.com/token";
const SCOPE: &str = "https://www.googleapis.com/auth/cloud-platform";
const REFRESH_BEFORE_EXPIRY: Duration = Duration::from_secs(300);

#[derive(Deserialize, Clone)]
pub struct ServiceAccount {
    pub project_id: String,
    pub client_email: String,
    pub private_key: String,
}

#[derive(Serialize)]
struct Claims {
    iss: String,
    scope: String,
    aud: String,
    iat: u64,
    exp: u64,
}

static TOKEN_CACHE: OnceLock<Mutex<Option<(String, Instant)>>> = OnceLock::new();

fn cache() -> &'static Mutex<Option<(String, Instant)>> {
    TOKEN_CACHE.get_or_init(|| Mutex::new(None))
}

pub fn load_service_account() -> Result<ServiceAccount> {
    let raw = std::env::var("VERTEX_AI_SERVICE_ACCOUNT")
        .map_err(|e| MetisError::EnvironmentVariableError(e))?;
    serde_json::from_str(&raw).map_err(|e| MetisError::JsonError(e.to_string()))
}

async fn fetch_token(sa: &ServiceAccount) -> Result<(String, Instant)> {
    let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();
    let claims = Claims {
        iss: sa.client_email.clone(),
        scope: SCOPE.to_string(),
        aud: TOKEN_URL.to_string(),
        iat: now,
        exp: now + 3600,
    };
    let key = EncodingKey::from_rsa_pem(sa.private_key.as_bytes())
        .map_err(|e| MetisError::HttpError(format!("Invalid private key: {e}")))?;
    let jwt = encode(&Header::new(Algorithm::RS256), &claims, &key)
        .map_err(|e| MetisError::HttpError(format!("JWT encode error: {e}")))?;

    let body = format!(
        "grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion={}",
        jwt
    );
    let resp: Value = Client::new()
        .post(TOKEN_URL)
        .header("Content-Type", "application/x-www-form-urlencoded")
        .body(body)
        .send()
        .await?
        .json()
        .await?;

    let token = resp["access_token"]
        .as_str()
        .ok_or_else(|| MetisError::HttpError(format!("No access_token in response: {resp}")))?
        .to_string();

    let expires_at = Instant::now() + Duration::from_secs(3600) - REFRESH_BEFORE_EXPIRY;
    Ok((token, expires_at))
}

pub async fn get_access_token(sa: &ServiceAccount) -> Result<String> {
    let mut guard = cache().lock().await;
    if let Some((token, expires_at)) = guard.as_ref() {
        if Instant::now() < *expires_at {
            return Ok(token.clone());
        }
    }
    let (token, expires_at) = fetch_token(sa).await?;
    *guard = Some((token.clone(), expires_at));
    Ok(token)
}
