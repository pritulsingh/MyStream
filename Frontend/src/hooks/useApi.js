import { useEffect, useMemo, useState } from "react"
import { API_BASE_URL } from "../config/api"

export function useApi() {
  const [tokens, setTokens] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("mystream_tokens")) || {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    localStorage.setItem("mystream_tokens", JSON.stringify(tokens))
  }, [tokens])

  return useMemo(() => {
    async function request(path, options = {}) {
      const headers = new Headers(options.headers || {})
      const isForm = options.body instanceof FormData

      if (!isForm && options.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json")
      }

      if (tokens.accessToken && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${tokens.accessToken}`)
      }

      const response = await fetch(`${API_BASE_URL}${path}`, {
        credentials: "omit",
        ...options,
        headers
      })

      const payload = await parseResponse(response)

      if (!response.ok) {
        if (response.status === 401 && tokens.refreshToken && path !== "/users/refresh-token") {
          const refreshed = await refreshAccessToken(tokens.refreshToken)
          if (refreshed?.data?.accessToken) {
            setTokens({
              accessToken: refreshed.data.accessToken,
              refreshToken: refreshed.data.refreshToken || tokens.refreshToken
            })
            headers.set("Authorization", `Bearer ${refreshed.data.accessToken}`)

            const retryResponse = await fetch(`${API_BASE_URL}${path}`, {
              credentials: "omit",
              ...options,
              headers
            })
            const retryPayload = await parseResponse(retryResponse)

            if (retryResponse.ok) return retryPayload

            const retryError = new Error(getResponseMessage(retryPayload, retryResponse.status))
            retryError.response = retryPayload
            retryError.status = retryResponse.status
            throw retryError
          }
        }

        const error = new Error(getResponseMessage(payload, response.status))
        error.response = payload
        error.status = response.status
        throw error
      }

      return payload
    }

    async function refreshAccessToken(refreshToken) {
      try {
        const response = await fetch(`${API_BASE_URL}/users/refresh-token`, {
          method: "POST",
          credentials: "omit",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken })
        })
        const payload = await parseResponse(response)
        return response.ok ? payload : null
      } catch {
        return null
      }
    }

    return {
      request,
      setTokens,
      tokens,
      clearTokens: () => setTokens({})
    }
  }, [tokens])
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || ""

  if (contentType.includes("application/json")) {
    try {
      return await response.json()
    } catch {
      return null
    }
  }

  const text = await response.text()
  if (!text) return null

  return {
    message: extractMessageFromText(text),
    raw: text
  }
}

function extractMessageFromText(text) {
  const preMatch = text.match(/<pre>(.*?)<\/pre>/is)
  if (preMatch?.[1]) return cleanText(preMatch[1]).split("\n")[0]

  const titleMatch = text.match(/<title>(.*?)<\/title>/i)
  if (titleMatch?.[1]) return cleanText(titleMatch[1])

  return cleanText(text)
}

function cleanText(value) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function getResponseMessage(payload, status) {
  const message = (
    payload?.message ||
    payload?.error ||
    payload?.errors?.[0]?.message ||
    payload?.errors?.[0] ||
    ""
  )

  if (!message || message === String(status)) {
    return statusMessages[status] || "Something went wrong. Please try again."
  }

  return message
}

const statusMessages = {
  400: "Please check the form and try again.",
  401: "Please login again.",
  402: "Payment is required to complete this request.",
  403: "You are not allowed to perform this action.",
  404: "The requested resource was not found.",
  408: "The request took too long. Please try again.",
  409: "This email or username is already registered.",
  422: "Some submitted details are invalid.",
  429: "Too many requests. Please wait and try again.",
  413: "The selected file is too large.",
  500: "The server had a problem. Please try again."
}
