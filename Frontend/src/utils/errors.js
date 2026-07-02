export function getApiError(error) {
  if (error?.message === "Failed to fetch") {
    return "Could not reach the backend API. Please wait a few seconds and try again."
  }

  const message = normalizeMessage(error?.response?.message || error?.message, error?.status)

  if (error?.status) {
    return `${message} (${error.status})`
  }

  return message
}

function normalizeMessage(message, status) {
  if (!message || message === String(status)) {
    return statusFallbacks[status] || "Something went wrong. Please try again."
  }

  return message
}

const statusFallbacks = {
  400: "Please check the form and try again.",
  401: "Please login again.",
  403: "You are not allowed to perform this action.",
  404: "The requested resource was not found.",
  409: "This email or username is already registered.",
  413: "The selected file is too large.",
  422: "Some submitted details are invalid.",
  429: "Too many requests. Please wait and try again.",
  500: "The server had a problem. Please try again."
}
