import axios from "axios";
import dotenv from "dotenv";

dotenv.config(); // 👈 IMPORTANT: load here too (safe in services)

const baseUrl = process.env.MOMO_BASE_URL?.trim();

const subscriptionKey = process.env.MOMO_SUBSCRIPTION_KEY;
const apiUser = process.env.MOMO_API_USER;
const apiKey = process.env.MOMO_API_KEY;

export async function getAccessToken() {
  try {
    // 🔍 DEBUG (temporary)
    console.log("BASE URL =", baseUrl);

    const url = `${baseUrl}/collection/token/`;

    const auth = Buffer.from(`${apiUser}:${apiKey}`).toString("base64");

    const response = await axios.post(url, null, {
      headers: {
        Authorization: `Basic ${auth}`,
        "Ocp-Apim-Subscription-Key": subscriptionKey,
      },
    });

    return response.data.access_token;
  } catch (error) {
    console.error("MTN ERROR:", error.response?.data || error.message);
    throw error;
  }
}