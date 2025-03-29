import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET(req) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const page = Number.parseInt(searchParams.get("page")) || 1;
    const limit = Number.parseInt(searchParams.get("limit")) || 10;
    const query = searchParams.get("search") || "";
    const year = searchParams.get("year") || "";
    const month = searchParams.get("month") || "";
    const day = searchParams.get("day") || "";
    const salesExecutive = searchParams.get("salesExecutive") || "";
    const isShowUp = searchParams.get("isShowUp") || "";

    // Base condition - only inactive and cancelled orders
    const matchCondition = {
      orderStatus: "Inactive",
      isDeal: "No",
    };

    // Search query
    if (query) {
      matchCondition.$or = [
        { salesExecutive: { $regex: query, $options: "i" } },
        { customer: { $regex: query, $options: "i" } },
        { registration: { $regex: query, $options: "i" } },
      ];
    }

    // Date filtering for string dates
    if (year || month || day) {
      // For string dates, we'll use regex patterns
      let datePattern = "";

      // Format month with leading zero if needed
      const monthStr = month ? (month.length === 1 ? "0" + month : month) : "";

      // Format day with leading zero if needed
      const dayStr = day ? (day.length === 1 ? "0" + day : day) : "";

      if (year) {
        // For year, we can match the year portion of the date string
        datePattern = year;

        if (month) {
          // If month is provided, add it to the pattern
          datePattern += "-" + monthStr;

          if (day) {
            // If day is provided, add it to the pattern
            datePattern += "-" + dayStr;
          }
        }

        // Use regex to match the date pattern in the closingDate string
        matchCondition.closingDate = { $regex: datePattern, $options: "i" };
      }
    }

    // Filter by salesExecutive
    if (salesExecutive) {
      if (salesExecutive.includes(",")) {
        matchCondition.salesExecutive = { $in: salesExecutive.split(",") };
      } else {
        matchCondition.salesExecutive = salesExecutive;
      }
    }

    // Filter by isShowUp
    if (isShowUp && isShowUp !== "all") {
      if (isShowUp.includes(",")) {
        matchCondition.isShowUp = { $in: isShowUp.split(",") };
      } else {
        matchCondition.isShowUp = isShowUp;
      }
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(matchCondition)
      .sort({ closingDate: 1 }) // Sort by closingDate in ascending order
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
    console.error("Error fetching cancellation report:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
