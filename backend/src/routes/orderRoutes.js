
const express = require("express");
const router = express.Router();

const {
  createOrder,
  getOrders,
} = require("../controllers/orderController");

// Get all orders
router.get("/", getOrders);

// Create a new order
router.post("/", createOrder);

module.exports = router;
