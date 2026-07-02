export function login(api, payload) {
  return api.request("/users/login", {
    method: "POST",
    body: JSON.stringify(payload)
  })
}

export function register(api, formData) {
  return api.request("/users/register", {
    method: "POST",
    body: formData
  })
}

export function logout(api) {
  return api.request("/users/logout", { method: "POST" })
}

export function refreshToken(api, refreshToken) {
  return api.request("/users/refresh-token", {
    method: "POST",
    body: JSON.stringify({ refreshToken })
  })
}

export function verifyOtp(api, otp) {
  return api.request("/users/verify-otp", {
    method: "POST",
    body: JSON.stringify({ otp })
  })
}

export function resendOtp(api) {
  return api.request("/users/resend-otp", { method: "POST" })
}
