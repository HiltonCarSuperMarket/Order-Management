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
    const months = searchParams.get("months") || "";

    const matchCondition = { orderStatus: "Active" };

    if (query) {
      matchCondition.$or = [
        { salesExecutive: { $regex: query, $options: "i" } },
        { customer: { $regex: query, $options: "i" } },
        { registration: { $regex: query, $options: "i" } },
        { orderStatus: { $regex: query, $options: "i" } },
      ];
    }

    if (months) {
      const selectedMonths = months.split(",");
      const dateConditions = selectedMonths.map((monthStr) => {
        const [monthName, yearStr] = monthStr.split(" ");
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
        return {
          openingDate: {
            $gte: new Date(year, month, 1),
            $lte: new Date(year, month + 1, 0),
          },
        };
      });
      if (dateConditions.length) {
        matchCondition.$or = dateConditions;
      }
    }

    for (const [key, value] of searchParams.entries()) {
      if (["page", "limit", "search", "orderStatus", "months"].includes(key))
        continue;
      matchCondition[key] = value.includes(",")
        ? { $in: value.split(",") }
        : value;
    }

    const skip = (page - 1) * limit;
    const orders = await Order.find(matchCondition)
      .sort({ entryDate: 1, entryTime: 1 }) // Sorting by entryDate and entryTime in ascending order
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments(matchCondition);
    const totalSoldOrders = await Order.countDocuments({
      ...matchCondition,
      isDeal: "Yes",
    });
    const totalCancelledOrders = await Order.countDocuments({
      ...matchCondition,
      isDeal: "No",
    });

    return NextResponse.json({
      success: true,
      data: orders,
      currentPage: page,
      totalOrders,
      totalSoldOrders,
      totalCancelledOrders,
    });
  } catch (error) {
    console.error("Error fetching active orders:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
