import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET(req) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const page = Number.parseInt(searchParams.get("page")) || 1;
    const limit = Number.parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    // Get all filter parameters
    const salesExecutive = searchParams.get("salesExecutive")?.split(",") || [];
    const pctStatus = searchParams.get("pctStatus")?.split(",") || [];
    const enquiryType = searchParams.get("enquiryType")?.split(",") || [];
    const location = searchParams.get("location")?.split(",") || [];
    const isPCTSheetReceivedWithinTime =
      searchParams.get("isPCTSheetReceivedWithinTime")?.split(",") || [];
    const isShowUp = searchParams.get("isShowUp")?.split(",") || [];
    const isDeal = searchParams.get("isDeal")?.split(",") || [];
    const reasonForAction =
      searchParams.get("reasonForAction")?.split(",") || [];
    const isLossDeal = searchParams.get("isLossDeal")?.split(",") || [];
    const orderStatus = searchParams.get("orderStatus")?.split(",") || [];
    const months = searchParams.get("months")?.split(",") || [];

    // Search filter applied to all fields in Order table
    const searchFilter = search
      ? {
          $or: [
            { entryTime: { $regex: search, $options: "i" } },
            { enquiryType: { $regex: search, $options: "i" } },
            { registration: { $regex: search, $options: "i" } },
            { salesExecutive: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } },
            { pctStatus: { $regex: search, $options: "i" } },
            { orderStatus: { $regex: search, $options: "i" } },
            { reasonForAction: { $regex: search, $options: "i" } },
            { reasonDetail: { $regex: search, $options: "i" } },
            { customer: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // Build filter conditions
    const filterConditions = [];

    // Handle month filters
    if (months.length > 0) {
      const monthConditions = months.map((monthStr) => {
        const [monthName, yearStr] = monthStr.trim().split(" ");
        const year = Number.parseInt(yearStr);
        const monthMap = {
          Jan: 0,
          Feb: 1,
          Mar: 2,
          Apr: 3,
          May: 4,
          Jun: 5,
          Jul: 6,
          Aug: 7,
          Sep: 8,
          Oct: 9,
          Nov: 10,
          Dec: 11,
        };
        const month = monthMap[monthName];
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0); // Last day of the month
        return {
          orderDate: {
            $gte: startDate,
            $lte: endDate,
          },
        };
      });

      if (monthConditions.length > 0) {
        filterConditions.push({ $or: monthConditions });
      }
    }

    // Handle all other filters
    const addFilter = (field, values) => {
      if (values.length > 0) {
        filterConditions.push({ [field]: { $in: values } });
      }
    };

    addFilter("salesExecutive", salesExecutive);
    addFilter("pctStatus", pctStatus);
    addFilter("enquiryType", enquiryType);
    addFilter("location", location);
    addFilter("isPCTSheetReceivedWithinTime", isPCTSheetReceivedWithinTime);
    addFilter("isShowUp", isShowUp);
    addFilter("isDeal", isDeal);
    addFilter("reasonForAction", reasonForAction);
    addFilter("isLossDeal", isLossDeal);
    addFilter("orderStatus", orderStatus);

    // Combine search filter and other filters
    const matchCondition = {
      ...searchFilter,
      ...(filterConditions.length > 0 ? { $and: filterConditions } : {}),
    };

    // Fetch orders with applied filters
    const orders = await Order.find(matchCondition)
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments(matchCondition);

    return NextResponse.json({
      success: true,
      data: orders,
      currentPage: page,
      totalOrders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json(); // Parse request body
    await connectToDatabase();

    const newOrder = new Order(body); // Create a new order instance

    await newOrder.save(); // Save to DB

    return NextResponse.json(
      { success: true, data: newOrder },
      { status: 201 }
    );
  } catch (error) {
    console.error("Full error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
