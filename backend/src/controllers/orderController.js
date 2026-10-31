
const mongoose = require("mongoose");
const Order = require("../models/order");
const Product = require("../models/product");

// Create a new order
const createOrder = async (req, res) => {
  // Keep track of stock reductions so we can restore them if needed
  const stockUpdates = [];

  try {
    const { customer, shippingAddress, items } = req.body;

    // Validate customer details
    if (
      !customer?.fullName?.trim() ||
      !customer?.email?.trim() ||
      !customer?.phone?.trim()
    ) {
      return res.status(400).json({
        message: "Please provide all customer details.",
      });
    }

    // Validate shipping address
    if (
      !shippingAddress?.address?.trim() ||
      !shippingAddress?.city?.trim() ||
      !shippingAddress?.province?.trim()
    ) {
      return res.status(400).json({
        message: "Please provide the complete shipping address.",
      });
    }

    // Validate order items
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Your order must contain at least one product.",
      });
    }

    // Validate product IDs and quantities
    for (const item of items) {
      if (!mongoose.isValidObjectId(item?.product)) {
        return res.status(400).json({
          message: "An order contains an invalid product ID.",
        });
      }

      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        return res.status(400).json({
          message: "Product quantities must be positive whole numbers.",
        });
      }
    }

    // Combine repeated product IDs
    const quantities = new Map();

    for (const item of items) {
      const id = item.product.toString();

      quantities.set(
        id,
        (quantities.get(id) || 0) + item.quantity
      );
    }

    const productIds = [...quantities.keys()];

    // Find all requested products
    const products = await Product.find({
      _id: { $in: productIds },
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({
        message: "One or more products could not be found.",
      });
    }

    const orderItems = [];
    let totalAmount = 0;

    // Process each product
    for (const product of products) {
      const quantity = quantities.get(product._id.toString());

      const price =
        product.discountPrice != null &&
        product.discountPrice < product.price
          ? product.discountPrice
          : product.price;

      // Atomically decrease stock only if enough is available
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: product._id,
          stock: { $gte: quantity },
        },
        {
          $inc: { stock: -quantity },
        },
        {
          new: true,
          runValidators: true,
        }
      );

      // Stock was insufficient or changed before this update
      if (!updatedProduct) {
        throw new Error(
          `Not enough stock available for ${product.name}.`
        );
      }

      // Remember this reduction in case the order fails
      stockUpdates.push({
        productId: product._id,
        quantity,
      });

      orderItems.push({
        product: product._id,
        name: product.name,
        price,
        quantity,
      });

      totalAmount += price * quantity;
    }

    // Create the order after stock has been reduced
    const order = await Order.create({
      customer,
      shippingAddress,
      items: orderItems,
      totalAmount,
    });

    return res.status(201).json({
      message: "Order created successfully.",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error.message);

    // Restore stock if an error occurred after any stock reduction
    for (const update of stockUpdates) {
      try {
        await Product.updateOne(
          { _id: update.productId },
          {
            $inc: { stock: update.quantity },
          }
        );
      } catch (rollbackError) {
        console.error(
          "Stock restoration failed:",
          rollbackError.message
        );
      }
    }

    const isStockError = error.message.startsWith(
      "Not enough stock available"
    );

    return res.status(isStockError ? 400 : 500).json({
      message: isStockError
        ? error.message
        : "Failed to create order.",
    });
  }
};

// Get all orders
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    return res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    return res.status(500).json({
      message: "Failed to fetch orders.",
    });
  }
};

// Export controllers
module.exports = {
  createOrder,
  getOrders,
};
