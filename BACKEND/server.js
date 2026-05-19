const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

// Debug: show whether DB connection env vars are present in the runtime
console.log('ENV DEBUG: MYSQL_URL present =', !!process.env.MYSQL_URL);
console.log('ENV DEBUG: DB_HOST =', process.env.DB_HOST || 'undefined', 'DB_NAME =', process.env.DB_NAME || 'undefined');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "frontend")));

require("./config/db");

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

app.use((req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ message: "API route not found" });
  }
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Running On Port ${PORT}`);
});