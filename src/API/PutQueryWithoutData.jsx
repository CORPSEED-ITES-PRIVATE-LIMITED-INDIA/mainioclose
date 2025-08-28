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


export const putQueryNoData = (URL, data) => {
  return axios.put(URL, data, {
    headers: {
      "Authorization": `Bearer ${localData?.jwt}`,
      "Content-Type": "application/json",
      // Remove 'Access-Control-Allow-Origin' — it should not be sent from the client
    },
  });
};
