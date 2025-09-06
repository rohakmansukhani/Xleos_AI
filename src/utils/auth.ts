export function setAuthToken(token: string) {
  localStorage.setItem("xleos_token", token)
  localStorage.setItem("xleos_login_time", Date.now().toString())
}

export function isAuthValid() {
  const token = localStorage.getItem("xleos_token")
  const t = Number(localStorage.getItem("xleos_login_time"))
  if (!token || !t) return false
  // 24hr = 86400000ms
  return Date.now() - t < 86400000
}

export function clearAuth() {
  localStorage.removeItem("xleos_token")
  localStorage.removeItem("xleos_login_time")
}
