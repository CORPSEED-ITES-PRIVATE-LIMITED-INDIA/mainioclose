import axios from "axios";

const getStoredJwt = () => {
  // Login.jsx stores the logged-in user (including the JWT) in
  // sessionStorage — keep this in sync with that.
  const storageData = sessionStorage?.getItem("userDetail");

  if (!storageData) {
    return null;
  }

  try {
    return JSON.parse(storageData)?.jwt || null;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return null;
  }
};

export const api = axios.create({
  baseURL: `/`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the current JWT on every request instead of baking it into the
// instance once at import time — otherwise the header goes stale (or is
// simply missing) for the rest of the tab's session after login/logout,
// since this module is only evaluated once.
api.interceptors.request.use((config) => {
  const jwt = getStoredJwt();

  if (jwt) {
    config.headers.Authorization = `Bearer ${jwt}`;
  }

  return config;
});
