import axios from "axios";

const storageData = localStorage.getItem("userDetail");
let localData = null;
if (storageData) {
  try {
    localData = JSON.parse(storageData);
  } catch (error) {
    console.error("Error parsing JSON:", error);
  }
} else {
  console.warn("user detail not found in localStorage");
}

export const api = axios.create({
  baseURL: `http://localhost:3000`,
  headers: {
    Authorization: `Bearer ${localData?.jwt}`,
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  },
});
