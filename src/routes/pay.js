import express from "express";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { getAccessToken } from "../services/momo.js";

const router = express.Router();

const baseUrl = process.env.MOMO_BASE_URL;
const subscriptionKey = process.env.MOMO_SUBSCRIPTION_KEY;

router.get("/payment-status/:referenceId", async (req, res) => {
  try {
    const { referenceId } = req.params;

    if (!referenceId) {
      return res.status(400).json({
        error: "referenceId is required",
      });
    }

    const token = await getAccessToken();

    const response = await axios.get(
      `${baseUrl}/collection/v1_0/requesttopay/${referenceId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Target-Environment": "sandbox",
          "Ocp-Apim-Subscription-Key": subscriptionKey,
        },
      }
    );

    res.json({
      referenceId,
      status: response.data.status,
      fullResponse: response.data,
    });
  } catch (error) {
    console.error(
      "Status check error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      error: "Failed to check payment status",
      details: error.response?.data || error.message,
    });
  }
});

router.post("/pay", async (req, res) => {
  try {
    const { phone, amount } = req.body;

    if (!phone || !amount) {
      return res.status(400).json({
        error: "phone and amount are required",
      });
    }

    // 1. Get access token
    const token = await getAccessToken();

    // 2. Generate transaction ID
    const referenceId = uuidv4();

    // 3. Build request payload
    const payload = {
      amount: amount.toString(),
      currency: "EUR",
      externalId: `order_${Date.now()}`,
      payer: {
        partyIdType: "MSISDN",
        partyId: phone,
      },
      payerMessage: "Payment request",
      payeeNote: "Thanks for your payment",
    };

    // 4. Send Request to Pay
    const response = await axios.post(
      `${baseUrl}/collection/v1_0/requesttopay`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Reference-Id": referenceId,
          "X-Target-Environment": "sandbox",
          "Ocp-Apim-Subscription-Key": subscriptionKey,
          "Content-Type": "application/json",
        },
      }
    );

    // 5. Return response
    res.status(202).json({
      message: "Payment request sent",
      referenceId,
      data: response.data,
    });
  } catch (error) {
    console.error(
      "Payment error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      error: "Payment request failed",
      details: error.response?.data || error.message,
    });
  }
});

export default router;