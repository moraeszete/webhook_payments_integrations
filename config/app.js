const express = require("express");
const cors = require('cors');
const router = require("./router")
const app = express();

const authMiddleware = require("../middleware/auth");

// Apply CORS s
app.use(cors(
  {
    origin: '*',
    methods: ['POST'],
    credentials: true
  }
));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Authentication middleware
app.use(authMiddleware);

app.use(router)

module.exports = app;
