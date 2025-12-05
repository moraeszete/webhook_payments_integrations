const express = require("express");
const app = express();

const cors = require('cors');
const router = require("./router")

const authMiddleware = require("../middlewares/auth");

// Apply CORS s
app.use(cors(
  {
    origin: '*',
    methods: ['POST', 'GET', 'PUT'],
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
