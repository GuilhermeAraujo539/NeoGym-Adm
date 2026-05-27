const REFRESH_KEY = '__ng_rt'

let _accessToken = null

export function saveTokens(accessToken, refreshToken) {
  _accessToken = accessToken
  if (refreshToken) {
    sessionStorage.setItem(REFRESH_KEY, refreshToken)
  }
}

export function getTokens() {
  return {
    accessToken: _accessToken,
    refreshToken: sessionStorage.getItem(REFRESH_KEY),
  }
}

export function clearTokens() {
  _accessToken = null
  sessionStorage.removeItem(REFRESH_KEY)
}

export function hasSession() {
  return !!sessionStorage.getItem(REFRESH_KEY)
}
