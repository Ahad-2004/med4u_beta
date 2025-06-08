require("dotenv").config();
console.log("KEY:", process.env.OPENAI_API_KEY);
const express = require("express");
const cors = require("cors");
const summarizeRoute = require("./routes/summarize");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", summarizeRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
