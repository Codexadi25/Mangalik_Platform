const User = require("../models/User.model");
const Order = require("../models/Order.model");
const SupportTicket = require("../models/SupportTicket.model");
const asyncHandler = require("../utils/asyncHandler");

exports.getOverviewStats = asyncHandler(async (req, res) => {
  const usersCount = await User.countDocuments();
  const pendingOrders = await Order.countDocuments({ status: "pending" });
  
  let activeTickets = 0;
  try {
    activeTickets = await SupportTicket.countDocuments({ status: { $ne: "resolved" } });
  } catch (e) {
  }
  
  const salesResult = await Order.aggregate([
    { $group: { _id: null, total: { $sum: "$total" } } }
  ]);
  const overallSales = salesResult.length > 0 ? salesResult[0].total : 0;

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const monthlyData = await Order.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    { $group: {
        _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
        sales: { $sum: "$total" }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const salesChartData = [];
  let curr = new Date(sixMonthsAgo);
  for (let i = 0; i < 6; i++) {
    const m = curr.getMonth() + 1; // 1-12
    const y = curr.getFullYear();
    const match = monthlyData.find(d => d._id.month === m && d._id.year === y);
    salesChartData.push({
      name: monthNames[m - 1],
      sales: match ? match.sales : 0,
      organic: Math.round((match ? match.sales : 0) * 0.7),
      inorganic: Math.round((match ? match.sales : 0) * 0.3)
    });
    curr.setMonth(curr.getMonth() + 1);
  }

  const unprocessedOrders = await Order.find({
    status: { $in: ["placed", "confirmed"] }
  }).populate("user", "name email").sort({ createdAt: -1 }).limit(20);

  res.status(200).json({
    success: true,
    data: {
      usersCount,
      pendingOrders,
      activeTickets,
      overallSales,
      salesChartData,
      unprocessedOrders,
      segmentData: [
        { name: 'Organic', value: 70 },
        { name: 'Referral', value: 20 },
        { name: 'Social', value: 10 }
      ]
    }
  });
});
