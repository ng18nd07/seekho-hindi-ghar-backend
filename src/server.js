const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is live!");
});

app.post("/api/ask", async (req, res) => {
  const { query, usecase } = req.body;

  let model = "";
  let payload = {};

  switch (usecase) {
    case "translate":
      model = "Helsinki-NLP/opus-mt-en-hi";
      payload = { inputs: query };
      break;

    case "correct":
      model = "prithivida/grammar-error-correcter";
      payload = { inputs: query };
      break;

    case "chat":
    case "explain":
    default:
      model = "tiiuae/falcon-7b-instruct";
      payload = {
        inputs: `You are a Hindi language tutor. ${query}`
      };
      break;
  }

  try {
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${model}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    const result = Array.isArray(response.data)
      ? response.data[0]?.translation_text || response.data[0]?.generated_text
      : response.data?.generated_text || "No response from model";

    res.json({ answer: result });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "AI model request failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
