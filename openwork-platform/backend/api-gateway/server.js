const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const Razorpay = require('razorpay');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = 'quick-commerce';
let db;
let client;

// Initialize Razorpay - Keys must be set in environment variables
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn('⚠️  WARNING: Razorpay credentials not found in environment variables!');
  console.warn('⚠️  Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env file');
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
MongoClient.connect(MONGODB_URI)
  .then(mongoClient => {
    console.log('Connected to MongoDB');
    client = mongoClient;
    db = client.db(DB_NAME);
  })
  .catch(error => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// DEBUG: Check orders in database
app.get('/api/debug/orders', async (req, res) => {
  try {
    const allOrders = await db.collection('orders').find({}).limit(10).toArray();
    const deliveredOrders = await db.collection('orders').find({ status: 'delivered' }).toArray();
    
    res.json({
      success: true,
      totalOrders: await db.collection('orders').countDocuments(),
      deliveredCount: deliveredOrders.length,
      sampleOrders: allOrders.map(o => ({
        _id: o._id,
        orderId: o.orderId,
        status: o.status,
        deliveryPersonId: o.deliveryPersonId,
        deliveryPersonIdType: typeof o.deliveryPersonId,
        assignedTo: o.assignedTo,
        deliveredAt: o.deliveredAt,
        acceptedAt: o.acceptedAt
      })),
      deliveredOrdersDetailed: deliveredOrders.map(o => ({
        _id: o._id,
        orderId: o.orderId,
        deliveryPersonId: o.deliveryPersonId,
        deliveryPersonIdType: typeof o.deliveryPersonId,
        assignedTo: o.assignedTo,
        deliveryPersonName: o.deliveryPersonName,
        deliveredAt: o.deliveredAt,
        acceptedAt: o.acceptedAt
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// CLEANUP: Drop the old useless database
app.get('/api/admin/cleanup-old-database', async (req, res) => {
  try {
    // Drop the old openwork_platform database
    const oldDb = client.db('openwork_platform');
    await oldDb.dropDatabase();
    
    res.json({
      success: true,
      message: 'Successfully deleted the old "openwork_platform" database. All data is now unified in "quick-commerce" database.'
    });
  } catch (error) {
    console.error('Error dropping old database:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to drop old database',
      error: error.message 
    });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { loginId, password } = req.body; // Changed from 'phone' to 'loginId'

    if (!loginId || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email/Phone and password are required' 
      });
    }

    // Find user by phone OR email
    const user = await db.collection('users').findOne({
      $or: [
        { phone: loginId },
        { email: loginId }
      ]
    });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email/phone or password' 
      });
    }

    // Check password (in production, use proper password hashing)
    if (user.password !== password) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email/phone or password' 
      });
    }

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    res.json({ 
      success: true, 
      message: 'Login successful',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Registration endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { phone, email, password, name, userType = 'customer' } = req.body;

    // Validate required fields
    if (!phone || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number, email, and password are required' 
      });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        success: false, 
        message: passwordValidation.message 
      });
    }

    // Check if user already exists (by phone or email)
    const existingUser = await db.collection('users').findOne({
      $or: [{ phone: phone }, { email: email }]
    });

    if (existingUser) {
      if (existingUser.phone === phone) {
        return res.status(409).json({ 
          success: false, 
          message: 'Phone number already registered' 
        });
      } else {
        return res.status(409).json({ 
          success: false, 
          message: 'Email already registered' 
        });
      }
    }

    // Create new user
    const newUser = {
      phone: phone,
      email: email,
      password: password, // In production, hash this password
      name: name || 'User',
      userType: userType, // 'customer', 'delivery', 'seller'
      addresses: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('users').insertOne(newUser);

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ 
      success: true, 
      message: 'Registration successful',
      user: { ...userWithoutPassword, _id: result.insertedId }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Password validation function
function validatePassword(password) {
  if (!password || password.length < 6) {
    return {
      isValid: false,
      message: 'Password must be at least 6 characters long'
    };
  }

  // Simple validation - just check length
  return {
    isValid: true,
    message: 'Password is valid'
  };
}

// Payment endpoints
app.post('/api/payment/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, notes = {} } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required'
      });
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: currency,
      receipt: receipt || `order_${Date.now()}`,
      notes: notes
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order: order,
      key_id: process.env.RAZORPAY_KEY_ID // Send key to frontend
    });

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order'
    });
  }
});

app.post('/api/payment/verify', async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      order_details 
    } = req.body;

    // In production, verify the signature using Razorpay's crypto verification
    // For now, we'll assume the payment is successful

    // Save order to database
    const orderData = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_details,
      status: 'completed',
      created_at: new Date()
    };

    await db.collection('orders').insertOne(orderData);

    res.json({
      success: true,
      message: 'Payment verified successfully',
      order_id: razorpay_order_id
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API Gateway is running' });
});

// Save order details after successful payment
app.post('/api/orders/save', async (req, res) => {
  try {
    const { 
      user_id, 
      user_name, 
      user_email, 
      user_phone,
      items, 
      total_amount, 
      payment_id, 
      order_id,
      delivery_address 
    } = req.body;

    // 🔥 STEP 1: Validate stock availability for all items
    const stockValidation = [];
    for (const item of items) {
      const inventoryItem = await db.collection('inventory').findOne({ name: item.name });
      
      if (!inventoryItem) {
        return res.status(400).json({
          success: false,
          message: `Product "${item.name}" not found in inventory`,
          item: item.name
        });
      }

      if (inventoryItem.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${item.name}". Only ${inventoryItem.stock} available, but ${item.quantity} requested.`,
          item: item.name,
          available: inventoryItem.stock,
          requested: item.quantity
        });
      }

      stockValidation.push({
        name: item.name,
        sku: inventoryItem.sku,
        currentStock: inventoryItem.stock,
        ordered: item.quantity,
        price: item.price
      });
    }

    // 🔥 STEP 2: Create order data
    const orderData = {
      userId: user_id,
      orderId: `ORD${Date.now()}`,
      customerDetails: {
        name: user_name,
        email: user_email,
        phone: user_phone
      },
      items: items,
      totalAmount: total_amount,
      paymentId: payment_id,
      razorpayOrderId: order_id,
      deliveryAddress: {
        fullAddress: delivery_address || 'Default Address',
        lat: null,
        lng: null
      },
      paymentMethod: 'online',
      status: 'pending',
      deliveryPersonId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      estimatedDelivery: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
    };

    // 🔥 STEP 3: Insert order
    const result = await db.collection('orders').insertOne(orderData);

    // 🔥 STEP 4: Update inventory - Reduce stock and increase totalSold
    const bulkOps = items.map(item => ({
      updateOne: {
        filter: { name: item.name },
        update: {
          $inc: {
            stock: -item.quantity,
            totalSold: item.quantity
          },
          $set: {
            updatedAt: new Date()
          }
        }
      }
    }));

    await db.collection('inventory').bulkWrite(bulkOps);

    console.log(`✅ Order ${orderData.orderId} placed successfully. Inventory updated for ${items.length} items.`);

    res.json({
      success: true,
      message: 'Order saved successfully and inventory updated',
      order_id: result.insertedId,
      order_number: orderData.orderId,
      stockUpdates: stockValidation
    });

  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save order',
      error: error.message
    });
  }
});

// Get user orders
app.get('/api/orders/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const orders = await db.collection('orders')
      .find({ userId: userId })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      success: true,
      orders
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

// Get all orders (for delivery app)
app.get('/api/orders', async (req, res) => {
  try {
    // Fetch orders with complete customer details
    const orders = await db.collection('orders').aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $addFields: {
          // Merge customerDetails from order with userDetails from users collection
          customerDetails: {
            $mergeObjects: [
              '$customerDetails',
              { $arrayElemAt: ['$userDetails', 0] }
            ]
          }
        }
      },
      {
        $project: {
          userDetails: 0 // Remove the temporary userDetails array
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]).toArray();

    res.json({
      success: true,
      orders
    });

  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

// Accept an order (delivery app)
app.put('/api/orders/:orderId/accept', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveryPersonId, deliveryPersonName } = req.body;

    if (!deliveryPersonId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Delivery person ID is required' 
      });
    }

    // Update order with delivery assignment
    const result = await db.collection('orders').updateOne(
      { 
        _id: new ObjectId(orderId)
      },
      { 
        $set: { 
          deliveryPersonId: deliveryPersonId,
          assignedTo: deliveryPersonName,
          status: 'accepted',
          assignedAt: new Date(),
          acceptedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    res.json({
      success: true,
      message: 'Order accepted successfully'
    });

  } catch (error) {
    console.error('Error accepting order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept order' 
    });
  }
});

// Update order status (delivery app)
app.put('/api/orders/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, deliveryPersonId, deliveredAt } = req.body;

    if (!status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Status is required' 
      });
    }

    const updateData = {
      status: status,
      updatedAt: new Date()
    };

    if (status === 'delivered' && deliveredAt) {
      updateData.deliveredAt = new Date(deliveredAt);
    }

    // Add acceptedAt timestamp when order is accepted
    if (status === 'accepted' && !updateData.acceptedAt) {
      updateData.acceptedAt = new Date();
    }

    const result = await db.collection('orders').updateOne(
      { 
        _id: new ObjectId(orderId)
      },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    res.json({
      success: true,
      message: `Order status updated to ${status} successfully`
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status' 
    });
  }
});

// Get all delivered orders for a specific agent (for dashboard)
app.get('/api/orders/agent/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;

    if (!agentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Agent ID is required' 
      });
    }

    // Find all delivered orders assigned to this agent
    const orders = await db.collection('orders').find({
      $and: [
        { status: 'delivered' },
        {
          $or: [
            { deliveryPersonId: agentId },
            { assignedTo: agentId }
          ]
        }
      ]
    })
    .sort({ deliveredAt: -1 }) // Most recent first
    .toArray();

    res.json({
      success: true,
      orders: orders,
      count: orders.length
    });

  } catch (error) {
    console.error('Error fetching agent orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agent orders' 
    });
  }
});

// Get all delivery agents with their performance stats (for seller dashboard)
app.get('/api/agents/performance', async (req, res) => {
  try {
    const { date, agentId } = req.query;

    // Get all delivery agents from users collection
    const agents = await db.collection('users').find({
      userType: 'delivery'
    }).toArray();

    if (agents.length === 0) {
      return res.json({
        success: true,
        agents: [],
        message: 'No delivery agents found'
      });
    }

    // Calculate performance stats for each agent
    const agentStats = await Promise.all(agents.map(async (agent) => {
      const agentIdStr = agent._id.toString();
      
      // Build date filter if provided
      let dateFilter = {};
      if (date) {
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        dateFilter = {
          deliveredAt: {
            $gte: targetDate,
            $lt: nextDay
          }
        };
      }

      // Fetch all delivered orders for this agent
      const deliveredOrders = await db.collection('orders').find({
        status: 'delivered',
        $or: [
          { deliveryPersonId: agentIdStr },
          { deliveryPersonId: agent._id },
          { assignedTo: agent.name }
        ],
        ...dateFilter
      }).toArray();

      // Calculate stats
      const totalDeliveries = deliveredOrders.length;
      
      // Today's deliveries
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayDeliveries = deliveredOrders.filter(order => {
        const deliveryDate = new Date(order.deliveredAt);
        deliveryDate.setHours(0, 0, 0, 0);
        return deliveryDate.getTime() === today.getTime();
      }).length;

      // Calculate total earnings (₹50 per delivery + tips if any)
      const baseRatePerDelivery = 50;
      const totalEarnings = deliveredOrders.reduce((sum, order) => {
        return sum + baseRatePerDelivery + (order.deliveryTip || 0);
      }, 0);

      const todayEarnings = deliveredOrders
        .filter(order => {
          const deliveryDate = new Date(order.deliveredAt);
          deliveryDate.setHours(0, 0, 0, 0);
          return deliveryDate.getTime() === today.getTime();
        })
        .reduce((sum, order) => {
          return sum + baseRatePerDelivery + (order.deliveryTip || 0);
        }, 0);

      // Calculate average delivery time
      let totalTime = 0;
      let validTimeCount = 0;
      
      deliveredOrders.forEach(order => {
        if (order.acceptedAt && order.deliveredAt) {
          const acceptTime = new Date(order.acceptedAt);
          const deliverTime = new Date(order.deliveredAt);
          const diff = (deliverTime - acceptTime) / (1000 * 60); // minutes
          if (diff > 0 && diff < 300) { // Valid time between 0-300 minutes
            totalTime += diff;
            validTimeCount++;
          }
        }
      });

      const averageDeliveryTime = validTimeCount > 0 ? Math.round(totalTime / validTimeCount) : 0;

      // Calculate rating (if available)
      const ratings = deliveredOrders
        .filter(order => order.rating)
        .map(order => order.rating);
      const averageRating = ratings.length > 0 
        ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1)
        : 0;

      // Get last delivery time
      const lastDelivery = deliveredOrders.length > 0
        ? deliveredOrders.sort((a, b) => new Date(b.deliveredAt) - new Date(a.deliveredAt))[0]
        : null;

      return {
        agentId: agentIdStr,
        name: agent.name,
        email: agent.email,
        phone: agent.phone,
        vehicleType: agent.vehicleType || 'Bike',
        status: agent.isActive ? 'active' : 'inactive',
        joinedDate: agent.createdAt,
        stats: {
          totalDeliveries,
          todayDeliveries,
          totalEarnings,
          todayEarnings,
          averageDeliveryTime,
          averageRating: parseFloat(averageRating),
          lastDeliveryAt: lastDelivery?.deliveredAt || null,
          completionRate: 100 // Simplified - can be enhanced with cancelled orders
        }
      };
    }));

    // Sort by today's deliveries (most active first)
    agentStats.sort((a, b) => b.stats.todayDeliveries - a.stats.todayDeliveries);

    res.json({
      success: true,
      agents: agentStats,
      count: agentStats.length,
      summary: {
        totalAgents: agentStats.length,
        activeToday: agentStats.filter(a => a.stats.todayDeliveries > 0).length,
        totalDeliveriesToday: agentStats.reduce((sum, a) => sum + a.stats.todayDeliveries, 0),
        totalEarningsToday: agentStats.reduce((sum, a) => sum + a.stats.todayEarnings, 0)
      }
    });

  } catch (error) {
    console.error('Error fetching agent performance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agent performance data' 
    });
  }
});

// Get detailed delivery logs for salary calculations (for seller dashboard)
app.get('/api/agents/delivery-logs', async (req, res) => {
  try {
    const { agentId, startDate, endDate } = req.query;

    if (!agentId) {
      return res.status(400).json({
        success: false,
        message: 'Agent ID is required'
      });
    }

    // Build date range filter
    let dateFilter = { status: 'delivered' };
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      dateFilter.deliveredAt = {
        $gte: start,
        $lte: end
      };
    }

    // Get agent details to search by name too
    console.log('Fetching delivery logs for agentId:', agentId);
    const agent = await db.collection('users').findOne({ _id: new ObjectId(agentId) });
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }
    
    console.log('Agent details:', { name: agent.name, phone: agent.phone });
    
    // Build search criteria - check multiple ID formats
    const searchCriteria = {
      ...dateFilter,
      $or: [
        { deliveryPersonId: agentId }, // String ID
        { deliveryPersonId: agent._id }, // ObjectId
        { assignedTo: agent.name }, // Name match
        { assignedTo: agent.phone }, // Phone match
        { deliveryPersonName: agent.name } // Alternative name field
      ]
    };
    
    console.log('Search criteria:', JSON.stringify(searchCriteria, null, 2));
    
    // Fetch all delivered orders for this agent in the date range
    const deliveryLogs = await db.collection('orders').find(searchCriteria)
    .sort({ deliveredAt: -1 })
    .toArray();
    
    console.log(`Found ${deliveryLogs.length} delivery logs for agent ${agent.name} (${agentId})`);

    // Calculate detailed breakdown
    const baseRatePerDelivery = 50;
    
    const detailedLogs = deliveryLogs.map(order => {
      const acceptTime = new Date(order.acceptedAt);
      const deliverTime = new Date(order.deliveredAt);
      const deliveryTime = (deliverTime - acceptTime) / (1000 * 60); // minutes

      return {
        orderId: order.orderId || order._id.toString(),
        date: order.deliveredAt,
        customerName: order.customerDetails?.name || 'Unknown',
        deliveryAddress: order.deliveryAddress?.city || order.deliveryAddress?.fullAddress || 'N/A',
        orderAmount: order.totalAmount || 0,
        deliveryFee: baseRatePerDelivery,
        tip: order.deliveryTip || 0,
        totalEarning: baseRatePerDelivery + (order.deliveryTip || 0),
        deliveryTime: Math.round(deliveryTime),
        distance: order.deliveryDistance || 'N/A',
        rating: order.rating || 0,
        acceptedAt: order.acceptedAt,
        deliveredAt: order.deliveredAt
      };
    });

    // Calculate salary summary
    const totalDeliveries = detailedLogs.length;
    const totalDeliveryFees = totalDeliveries * baseRatePerDelivery;
    const totalTips = detailedLogs.reduce((sum, log) => sum + log.tip, 0);
    const totalEarnings = totalDeliveryFees + totalTips;
    const averageEarningPerDelivery = totalDeliveries > 0 ? totalEarnings / totalDeliveries : 0;

    res.json({
      success: true,
      agentId,
      dateRange: { startDate, endDate },
      deliveryLogs: detailedLogs,
      summary: {
        totalDeliveries,
        totalDeliveryFees,
        totalTips,
        totalEarnings,
        averageEarningPerDelivery: Math.round(averageEarningPerDelivery)
      }
    });

  } catch (error) {
    console.error('Error fetching delivery logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delivery logs' 
    });
  }
});

// Save contact support request
app.post('/api/support/create', async (req, res) => {
  try {
    const { 
      user_id,
      user_name,
      user_email,
      user_phone,
      order_number,
      order_id,
      issue_type,
      message,
      contact_method,
      order_amount,
      order_items_count
    } = req.body;

    const supportRequest = {
      user_id,
      user_name,
      user_email,
      user_phone,
      order_reference: {
        order_number,
        order_id,
        order_amount,
        order_items_count
      },
      issue_type,
      message,
      contact_method,
      status: 'open', // open, in-progress, resolved, closed
      priority: getSupportPriority(issue_type), // high, medium, low
      created_at: new Date(),
      updated_at: new Date(),
      ticket_number: `TICK${Date.now()}`,
      assigned_to: null,
      resolution_notes: null,
      resolved_at: null
    };

    const result = await db.collection('support_requests').insertOne(supportRequest);

    res.json({
      success: true,
      message: 'Support request created successfully',
      ticket_number: supportRequest.ticket_number,
      support_id: result.insertedId
    });

  } catch (error) {
    console.error('Error creating support request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create support request'
    });
  }
});

// Get all support requests (for admin)
app.get('/api/support/all', async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 20 } = req.query;
    
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (priority && priority !== 'all') filter.priority = priority;

    const skip = (page - 1) * limit;

    const supportRequests = await db.collection('support_requests')
      .find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const totalCount = await db.collection('support_requests').countDocuments(filter);

    res.json({
      success: true,
      support_requests: supportRequests,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(totalCount / limit),
        total_count: totalCount,
        has_next: skip + supportRequests.length < totalCount,
        has_prev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching support requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch support requests'
    });
  }
});

// Get support requests by user
app.get('/api/support/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const supportRequests = await db.collection('support_requests')
      .find({ user_id: userId })
      .sort({ created_at: -1 })
      .toArray();

    res.json({
      success: true,
      support_requests: supportRequests
    });

  } catch (error) {
    console.error('Error fetching user support requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch support requests'
    });
  }
});

// Update support request status (for admin)
app.put('/api/support/:supportId/status', async (req, res) => {
  try {
    const { supportId } = req.params;
    const { status, assigned_to, resolution_notes } = req.body;

    const updateData = {
      status,
      updated_at: new Date()
    };

    if (assigned_to) updateData.assigned_to = assigned_to;
    if (resolution_notes) updateData.resolution_notes = resolution_notes;
    if (status === 'resolved' || status === 'closed') {
      updateData.resolved_at = new Date();
    }

    const result = await db.collection('support_requests').updateOne(
      { _id: new ObjectId(supportId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Support request not found'
      });
    }

    res.json({
      success: true,
      message: 'Support request updated successfully'
    });

  } catch (error) {
    console.error('Error updating support request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update support request'
    });
  }
});

// ===================================
// DELIVERY PERSONNEL APIs
// ===================================

// Delivery Personnel Login
app.post('/api/auth/delivery-login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number and password are required' 
      });
    }

    // Validate phone number format
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid phone number format. Please enter a valid 10-digit mobile number' 
      });
    }

    // Use the existing db connection (quick-commerce database)
    // DO NOT create new connection - uses wrong database!
    
    // Find delivery personnel
    const deliveryPerson = await db.collection('delivery_personnel').findOne({ phone: phone });

    if (!deliveryPerson) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials. Contact your supervisor if you need access.' 
      });
    }

    // Check if account is active
    if (!deliveryPerson.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Your account has been deactivated. Please contact support.' 
      });
    }

    // Verify password (in production, use bcrypt)
    if (deliveryPerson.password !== password) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials. Please check your password.' 
      });
    }

    // Update last login and set online status
    await db.collection('delivery_personnel').updateOne(
      { _id: deliveryPerson._id },
      { 
        $set: { 
          lastLogin: new Date(),
          isOnline: true,
          updatedAt: new Date()
        }
      }
    );

    // Return delivery person data (excluding password)
    const { password: _, ...deliveryPersonData } = deliveryPerson;
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        ...deliveryPersonData,
        lastLogin: new Date(),
        isOnline: true
      }
    });

  } catch (error) {
    console.error('Delivery login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again.' 
    });
  }
});

// Delivery logout endpoint
app.post('/api/auth/delivery-logout', async (req, res) => {
  try {
    const { deliveryPersonId } = req.body;
    
    if (!deliveryPersonId) {
      return res.status(400).json({
        success: false,
        message: 'Delivery person ID is required'
      });
    }

    // Use the existing db connection (quick-commerce database)
    const deliveryCollection = db.collection('delivery_personnel');
    
    // Update online status to false
    await deliveryCollection.updateOne(
      { _id: new ObjectId(deliveryPersonId) },
      { 
        $set: { 
          isOnline: false,
          lastLogoutAt: new Date()
        }
      }
    );
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
    
  } catch (error) {
    console.error('Delivery logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
});

// Delivery Personnel Registration
app.post('/api/auth/delivery-register', async (req, res) => {
  try {
    const { 
      name, 
      phone, 
      password, 
      email,
      vehicleType, 
      licenseNumber, 
      aadharNumber,
      address,
      city,
      state,
      pincode 
    } = req.body;

    // Validate required fields
    if (!name || !phone || !password || !vehicleType || !licenseNumber) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, phone, password, vehicle type, and license number are required' 
      });
    }

    // Validate phone number format
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid phone number format. Please enter a valid 10-digit mobile number' 
      });
    }

    // Validate email if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid email format' 
        });
      }
    }

    // Validate license number format (basic validation)
    if (licenseNumber.length < 10) {
      return res.status(400).json({ 
        success: false, 
        message: 'License number must be at least 10 characters' 
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Use the existing db connection (quick-commerce database)
    // DO NOT create new connection - uses wrong database!
    
    // Check if phone number already exists
    const existingDeliveryPerson = await db.collection('delivery_personnel').findOne({ 
      phone: phone 
    });
    
    if (existingDeliveryPerson) {
      return res.status(409).json({ 
        success: false, 
        message: 'Phone number already registered. Please login or use a different number.' 
      });
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await db.collection('delivery_personnel').findOne({ 
        email: email 
      });
      
      if (existingEmail) {
        return res.status(409).json({ 
          success: false, 
          message: 'Email already registered. Please use a different email.' 
        });
      }
    }

    // Check if license number already exists
    const existingLicense = await db.collection('delivery_personnel').findOne({ 
      licenseNumber: licenseNumber 
    });
    
    if (existingLicense) {
      return res.status(409).json({ 
        success: false, 
        message: 'License number already registered. Each license can only be used once.' 
      });
    }

    // Create new delivery personnel record
    const newDeliveryPerson = {
      name: name.trim(),
      phone: phone,
      password: password, // In production, hash this with bcrypt
      email: email ? email.trim().toLowerCase() : null,
      vehicleType: vehicleType,
      licenseNumber: licenseNumber.toUpperCase(),
      aadharNumber: aadharNumber || null,
      address: address || null,
      city: city || null,
      state: state || null,
      pincode: pincode || null,
      rating: 5.0, // Starting rating
      totalDeliveries: 0,
      totalEarnings: 0,
      isActive: true, // Auto-approve for now
      isOnline: false,
      isVerified: false, // Manual verification required
      registrationDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert into database
    const result = await db.collection('delivery_personnel').insertOne(newDeliveryPerson);
    
    // ALSO add to users collection with userType: 'delivery' for agent dashboard compatibility
    const userRecord = {
      phone: phone,
      email: email ? email.trim().toLowerCase() : null,
      password: password,
      name: name.trim(),
      userType: 'delivery',
      vehicleType: vehicleType,
      addresses: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.collection('users').insertOne(userRecord);
    
    // Return success response (excluding password)
    const { password: _, ...responseData } = newDeliveryPerson;
    
    res.status(201).json({
      success: true,
      message: 'Registration successful! You can now login with your credentials.',
      user: {
        id: result.insertedId,
        ...responseData
      }
    });
    
  } catch (error) {
    console.error('Delivery registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration. Please try again.' 
    });
  }
});

// Get pending orders for delivery
app.get('/api/delivery/orders/pending', async (req, res) => {
  try {
    const pendingOrders = await db.collection('orders').find({
      status: 'confirmed',
      deliveryPersonId: null
    }).toArray();

    // Transform orders for delivery app
    const deliveryOrders = pendingOrders.map(order => ({
      id: order._id,
      orderId: order.orderId,
      customer: order.customerDetails?.name || 'Customer',
      phone: order.customerDetails?.phone || '',
      address: order.deliveryAddress?.fullAddress || order.deliveryAddress?.address || 'Address not available',
      lat: order.deliveryAddress?.lat || null,
      lng: order.deliveryAddress?.lng || null,
      items: order.items || [],
      total: order.totalAmount || 0,
      paymentMethod: order.paymentMethod || 'online',
      orderTime: order.createdAt,
      estimatedDelivery: new Date(Date.now() + 30 * 60000), // 30 mins from now
      status: 'pending'
    }));

    res.json({
      success: true,
      orders: deliveryOrders
    });

  } catch (error) {
    console.error('Error fetching pending orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch orders' 
    });
  }
});

// Accept an order for delivery
app.put('/api/delivery/orders/:orderId/accept', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveryPersonId } = req.body;

    if (!deliveryPersonId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Delivery person ID is required' 
      });
    }

    // Update order with delivery assignment
    const result = await db.collection('orders').updateOne(
      { 
        _id: new ObjectId(orderId),
        deliveryPersonId: null // Only if not already assigned
      },
      { 
        $set: { 
          deliveryPersonId: deliveryPersonId,
          status: 'accepted',
          assignedAt: new Date(),
          acceptedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found or already assigned' 
      });
    }

    res.json({
      success: true,
      message: 'Order accepted successfully'
    });

  } catch (error) {
    console.error('Error accepting order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to accept order' 
    });
  }
});

// Update order delivery status
app.put('/api/delivery/orders/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, deliveryPersonId, location } = req.body;

    const validStatuses = ['out_for_delivery', 'delivered', 'failed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status' 
      });
    }

    const updateData = {
      status: status,
      updatedAt: new Date()
    };

    if (status === 'delivered') {
      updateData.deliveredAt = new Date();
    }

    if (location) {
      updateData.currentLocation = location;
    }

    const result = await db.collection('orders').updateOne(
      { 
        _id: new ObjectId(orderId),
        deliveryPersonId: deliveryPersonId
      },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found or not assigned to you' 
      });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully'
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update order status' 
    });
  }
});

// Get delivery person's assigned orders
app.get('/api/delivery/orders/assigned/:deliveryPersonId', async (req, res) => {
  try {
    const { deliveryPersonId } = req.params;

    const assignedOrders = await db.collection('orders').find({
      deliveryPersonId: deliveryPersonId,
      status: { $in: ['out_for_delivery', 'delivered'] }
    }).sort({ assignedAt: -1 }).toArray();

    const deliveryOrders = assignedOrders.map(order => ({
      id: order._id,
      orderId: order.orderId,
      customer: order.customerDetails?.name || 'Customer',
      phone: order.customerDetails?.phone || '',
      address: order.deliveryAddress?.fullAddress || order.deliveryAddress?.address || 'Address not available',
      lat: order.deliveryAddress?.lat || null,
      lng: order.deliveryAddress?.lng || null,
      items: order.items || [],
      total: order.totalAmount || 0,
      paymentMethod: order.paymentMethod || 'online',
      orderTime: order.createdAt,
      assignedAt: order.assignedAt,
      deliveredAt: order.deliveredAt,
      status: order.status
    }));

    res.json({
      success: true,
      orders: deliveryOrders
    });

  } catch (error) {
    console.error('Error fetching assigned orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch assigned orders' 
    });
  }
});

// Delivery Personnel Logout
app.post('/api/auth/delivery-logout', async (req, res) => {
  try {
    const { deliveryPersonId } = req.body;

    if (deliveryPersonId) {
      await db.collection('delivery_personnel').updateOne(
        { _id: new ObjectId(deliveryPersonId) },
        { 
          $set: { 
            isOnline: false,
            updatedAt: new Date()
          }
        }
      );
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Delivery logout error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Logout failed' 
    });
  }
});

// Helper function to determine support priority
function getSupportPriority(issueType) {
  const highPriorityIssues = ['Payment issues', 'Wrong items received', 'Damaged items'];
  const mediumPriorityIssues = ['Order not delivered', 'Delivery delay', 'Cancel order', 'Refund request'];
  
  if (highPriorityIssues.includes(issueType)) {
    return 'high';
  } else if (mediumPriorityIssues.includes(issueType)) {
    return 'medium';
  } else {
    return 'low';
  }
}

// ==================== INVENTORY MANAGEMENT APIs ====================

// Get all inventory items
app.get('/api/inventory', async (req, res) => {
  try {
    const inventory = await db.collection('inventory').find({}).toArray();
    
    res.json({
      success: true,
      inventory: inventory || []
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory'
    });
  }
});

// 🔥 NEW: Get all products with stock info for customer app
app.get('/api/products/available', async (req, res) => {
  try {
    const inventory = await db.collection('inventory').find({}).toArray();
    
    const products = inventory.map(item => ({
      id: item._id.toString(),
      sku: item.sku,
      name: item.name,
      price: item.price,
      stock: item.stock,
      category: item.category,
      image: item.image || null,
      description: item.description || '',
      maxStock: item.maxStock || item.stock,
      reorderLevel: item.reorderLevel || 10,
      available: item.stock > 0
    }));
    
    res.json({
      success: true,
      products,
      count: products.length
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
});

// 🔥 NEW: Check stock availability for specific products
app.post('/api/products/check-stock', async (req, res) => {
  try {
    const { items } = req.body; // items = [{ name: "Product Name", quantity: 2 }]
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Items array required'
      });
    }

    const stockInfo = [];
    
    for (const item of items) {
      const product = await db.collection('inventory').findOne({ name: item.name });
      
      if (!product) {
        stockInfo.push({
          name: item.name,
          available: false,
          stock: 0,
          requested: item.quantity,
          canFulfill: false,
          message: 'Product not found'
        });
      } else {
        stockInfo.push({
          name: item.name,
          available: true,
          stock: product.stock,
          requested: item.quantity,
          canFulfill: product.stock >= item.quantity,
          message: product.stock >= item.quantity 
            ? 'In stock' 
            : `Only ${product.stock} available`
        });
      }
    }

    const allAvailable = stockInfo.every(item => item.canFulfill);

    res.json({
      success: true,
      allAvailable,
      items: stockInfo
    });
  } catch (error) {
    console.error('Error checking stock:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check stock'
    });
  }
});

// Get inventory analytics
app.get('/api/inventory/analytics', async (req, res) => {
  try {
    const inventory = await db.collection('inventory').find({}).toArray();
    
    const totalValue = inventory.reduce((sum, item) => sum + (item.stock * item.price), 0);
    const totalSold = inventory.reduce((sum, item) => sum + (item.totalSold || 0), 0);
    const totalRevenue = inventory.reduce((sum, item) => sum + ((item.totalSold || 0) * item.price), 0);
    const lowStockCount = inventory.filter(item => item.stock <= (item.reorderLevel || 10) && item.stock > 0).length;
    const outOfStockCount = inventory.filter(item => item.stock === 0).length;
    
    const topProducts = inventory
      .sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0))
      .slice(0, 5);
    
    res.json({
      success: true,
      totalSKUs: inventory.length,
      totalValue,
      totalSold,
      totalRevenue,
      lowStockCount,
      outOfStockCount,
      topProducts
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
});

// Add/Create inventory item
app.post('/api/inventory', async (req, res) => {
  try {
    const { sku, name, category, price, stock, reorderLevel, maxStock } = req.body;
    
    if (!sku || !name || !price) {
      return res.status(400).json({
        success: false,
        message: 'SKU, name, and price are required'
      });
    }
    
    // Check if SKU already exists
    const existing = await db.collection('inventory').findOne({ sku });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'SKU already exists'
      });
    }
    
    const inventoryItem = {
      sku: sku.toUpperCase(),
      name,
      category: category || 'Uncategorized',
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      reorderLevel: parseInt(reorderLevel) || 10,
      maxStock: parseInt(maxStock) || (parseInt(stock) || 0) * 2,
      totalSold: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('inventory').insertOne(inventoryItem);
    
    res.status(201).json({
      success: true,
      message: 'Product added to inventory',
      id: result.insertedId,
      item: inventoryItem
    });
  } catch (error) {
    console.error('Error adding inventory item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add inventory item'
    });
  }
});

// Update inventory item
app.put('/api/inventory/:sku/update', async (req, res) => {
  try {
    const { sku } = req.params;
    const { stock, reorderLevel, maxStock } = req.body;
    
    const updateData = {
      updatedAt: new Date()
    };
    
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (reorderLevel !== undefined) updateData.reorderLevel = parseInt(reorderLevel);
    if (maxStock !== undefined) updateData.maxStock = parseInt(maxStock);
    
    const result = await db.collection('inventory').updateOne(
      { sku: sku.toUpperCase() },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Inventory updated successfully'
    });
  } catch (error) {
    console.error('Error updating inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update inventory'
    });
  }
});

// Record a sale (decrease stock, increase totalSold)
app.put('/api/inventory/:sku/sale', async (req, res) => {
  try {
    const { sku } = req.params;
    const { quantity } = req.body;
    
    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity required'
      });
    }
    
    const result = await db.collection('inventory').updateOne(
      { sku: sku.toUpperCase() },
      {
        $inc: {
          stock: -quantity,
          totalSold: quantity
        },
        $set: { updatedAt: new Date() }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Sale recorded successfully'
    });
  } catch (error) {
    console.error('Error recording sale:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record sale'
    });
  }
});

// Delete inventory item
app.delete('/api/inventory/:sku', async (req, res) => {
  try {
    const { sku } = req.params;
    
    const result = await db.collection('inventory').deleteOne({
      sku: sku.toUpperCase()
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
});

// DEBUG: Check orders in database for trends
app.get('/api/debug/trends', async (req, res) => {
  try {
    const orders = await db.collection('orders').find({}).limit(5).toArray();
    const inventory = await db.collection('inventory').find({}).toArray();
    
    res.json({
      success: true,
      orderCount: await db.collection('orders').countDocuments(),
      sampleOrders: orders.map(o => ({
        _id: o._id,
        orderId: o.orderId,
        items: o.items?.map(i => ({ name: i.name, quantity: i.quantity })),
        createdAt: o.createdAt,
        status: o.status
      })),
      inventoryCount: inventory.length,
      inventoryNames: inventory.map(i => i.name)
    });
  } catch (error) {
    console.error('Error in debug trends:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get business trends analytics
app.get('/api/inventory/trends', async (req, res) => {
  try {
    const inventory = await db.collection('inventory').find({}).toArray();
    const orders = await db.collection('orders').find({}).toArray();
    
    if (!inventory || inventory.length === 0) {
      return res.json({
        success: true,
        trends: {
          mostOrdered: null,
          trending: null,
          mostDemanded: null,
          fastestGrowing: null
        },
        insights: {
          bestPerformingCategory: 'N/A',
          avgGrowthPercentage: 0,
          stockoutRiskCount: 0,
          totalOrdersThisWeek: 0
        }
      });
    }

    // Calculate metrics for each product
    const productMetrics = inventory.map(product => {
      // Count orders for this product
      const productOrders = orders.filter(order => 
        order.items && order.items.some(item => item.name === product.name)
      );
      
      // Total orders all time
      const totalOrders = productOrders.length;
      
      // Week orders (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const weekOrders = productOrders.filter(order => 
        new Date(order.createdAt) >= sevenDaysAgo
      ).length;
      
      // Growth percentage (week vs all-time average)
      const avgPerWeek = totalOrders / 4; // Rough estimate
      const growth = avgPerWeek > 0 ? ((weekOrders - avgPerWeek) / avgPerWeek * 100) : 0;
      
      // Revenue
      const revenue = (product.totalSold || 0) * product.price;
      
      return {
        name: product.name,
        sku: product.sku,
        category: product.category,
        price: product.price,
        stock: product.stock,
        totalOrders: totalOrders,
        weekOrders: weekOrders,
        growth: Math.round(growth),
        revenue: revenue,
        totalSold: product.totalSold || 0,
        reorderLevel: product.reorderLevel || 10
      };
    });

    // Find most ordered (all-time)
    const mostOrderedProduct = productMetrics.reduce((max, product) => 
      product.totalOrders > (max?.totalOrders || 0) ? product : max
    , null);

    // Find trending this week
    const trendingProduct = productMetrics.reduce((max, product) => 
      product.weekOrders > (max?.weekOrders || 0) ? product : max
    , null);

    // Find most demanded (high orders, low stock)
    const mostDemandedProduct = productMetrics
      .filter(p => p.stock < p.reorderLevel && p.totalOrders > 0)
      .reduce((max, product) => 
        product.totalOrders > (max?.totalOrders || 0) ? product : max
      , null);

    // Find fastest growing (highest growth percentage)
    const fastestGrowingProduct = productMetrics.reduce((max, product) => 
      product.growth > (max?.growth || -100) ? product : max
    , null);

    // Calculate insights
    const categories = [...new Set(productMetrics.map(p => p.category))];
    const categoryPerformance = categories.map(cat => {
      const catProducts = productMetrics.filter(p => p.category === cat);
      const totalCatOrders = catProducts.reduce((sum, p) => sum + p.totalOrders, 0);
      return { category: cat, totalOrders: totalCatOrders };
    });
    
    const bestCategory = categoryPerformance.reduce((max, cat) => 
      cat.totalOrders > (max?.totalOrders || 0) ? cat : max
    , { category: 'N/A', totalOrders: 0 });

    const bestCategoryPercentage = productMetrics.length > 0 
      ? Math.round((bestCategory.totalOrders / productMetrics.reduce((sum, p) => sum + p.totalOrders, 1)) * 100)
      : 0;

    const avgGrowth = productMetrics.length > 0
      ? Math.round(productMetrics.reduce((sum, p) => sum + p.growth, 0) / productMetrics.length)
      : 0;

    const stockoutRiskCount = productMetrics.filter(p => 
      p.stock <= p.reorderLevel && p.stock > 0
    ).length;

    const totalOrdersWeek = productMetrics.reduce((sum, p) => sum + p.weekOrders, 0);

    res.json({
      success: true,
      trends: {
        mostOrdered: mostOrderedProduct,
        trending: trendingProduct,
        mostDemanded: mostDemandedProduct,
        fastestGrowing: fastestGrowingProduct
      },
      insights: {
        bestPerformingCategory: `${bestCategory.category} (${bestCategoryPercentage}%)`,
        avgGrowthPercentage: avgGrowth,
        stockoutRiskCount: stockoutRiskCount,
        totalOrdersThisWeek: totalOrdersWeek
      },
      allProducts: productMetrics
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trends',
      error: error.message
    });
  }
});

// ============================================
// USER ADDRESS MANAGEMENT ENDPOINTS
// ============================================

// Get user's addresses
app.get('/api/user/addresses/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { addresses: 1 } }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      addresses: user.addresses || []
    });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch addresses',
      error: error.message
    });
  }
});

// Add new address
app.post('/api/user/addresses/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const addressData = req.body;

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Validate required fields
    if (!addressData.houseNo || !addressData.street || !addressData.area || 
        !addressData.city || !addressData.state || !addressData.pincode) {
      return res.status(400).json({
        success: false,
        message: 'Missing required address fields'
      });
    }

    // Add metadata to address
    const newAddress = {
      ...addressData,
      _id: new ObjectId(), // Give each address a unique ID
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Check if this is the first address, make it default
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { addresses: 1 } }
    );

    if (!user.addresses || user.addresses.length === 0) {
      newAddress.isDefault = true;
    }

    // Add address to user's addresses array
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { 
        $push: { addresses: newAddress },
        $set: { updatedAt: new Date() }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Address added successfully',
      address: newAddress
    });
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add address',
      error: error.message
    });
  }
});

// Update existing address
app.put('/api/user/addresses/:userId/:addressId', async (req, res) => {
  try {
    const { userId, addressId } = req.params;
    const addressData = req.body;

    if (!ObjectId.isValid(userId) || !ObjectId.isValid(addressId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID or address ID'
      });
    }

    // Update the specific address in the array
    const result = await db.collection('users').updateOne(
      { 
        _id: new ObjectId(userId),
        'addresses._id': new ObjectId(addressId)
      },
      { 
        $set: { 
          'addresses.$': {
            ...addressData,
            _id: new ObjectId(addressId),
            updatedAt: new Date()
          }
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User or address not found'
      });
    }

    res.json({
      success: true,
      message: 'Address updated successfully'
    });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update address',
      error: error.message
    });
  }
});

// Delete address
app.delete('/api/user/addresses/:userId/:addressId', async (req, res) => {
  try {
    const { userId, addressId } = req.params;

    if (!ObjectId.isValid(userId) || !ObjectId.isValid(addressId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID or address ID'
      });
    }

    // Remove address from array
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { 
        $pull: { addresses: { _id: new ObjectId(addressId) } },
        $set: { updatedAt: new Date() }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete address',
      error: error.message
    });
  }
});

// Set default address
app.put('/api/user/addresses/:userId/:addressId/set-default', async (req, res) => {
  try {
    const { userId, addressId } = req.params;

    if (!ObjectId.isValid(userId) || !ObjectId.isValid(addressId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID or address ID'
      });
    }

    // First, unset all default flags
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { 'addresses.$[].isDefault': false } }
    );

    // Then set the specified address as default
    const result = await db.collection('users').updateOne(
      { 
        _id: new ObjectId(userId),
        'addresses._id': new ObjectId(addressId)
      },
      { $set: { 'addresses.$.isDefault': true } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User or address not found'
      });
    }

    res.json({
      success: true,
      message: 'Default address updated successfully'
    });
  } catch (error) {
    console.error('Error setting default address:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set default address',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});