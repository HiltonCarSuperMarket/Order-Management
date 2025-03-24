import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET(req) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const query = searchParams.get("query") || "";

    let matchCondition = { orderStatus: "Inactive" };

    if (query) {
      matchCondition.$or = [
        { salesExecutive: { $regex: query, $options: "i" } },
        { customer: { $regex: query, $options: "i" } },
        { registration: { $regex: query, $options: "i" } },
        { orderStatus: { $regex: query, $options: "i" } },
      ];
    }

    let isDealFilterApplied = false;
    let isDealValue = null;

    for (const [key, value] of searchParams.entries()) {
      if (["page", "limit", "query", "orderStatus"].includes(key)) continue;

      if (key === "isDeal") {
        isDealFilterApplied = true;
        isDealValue = value;
      }

      if (value.includes(",")) {
        matchCondition[key] = { $in: value.split(",") };
      } else if (value) {
        matchCondition[key] = value;
      }
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(matchCondition)
      .sort({ openingDate: -1 }) // Sort by "openingDate"
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments(matchCondition);

    let totalSoldOrders = 0;
    let totalCancelledOrders = 0;

    if (isDealFilterApplied) {
      if (
        isDealValue === "Yes" ||
        (isDealValue.includes && isDealValue.includes("Yes"))
      ) {
        totalSoldOrders = totalOrders;
        totalCancelledOrders = 0;
      } else if (
        isDealValue === "No" ||
        (isDealValue.includes && isDealValue.includes("No"))
      ) {
        totalSoldOrders = 0;
        totalCancelledOrders = totalOrders;
      } else if (isDealValue.includes && isDealValue.includes(",")) {
        const baseCondition = { ...matchCondition };
        delete baseCondition.isDeal;

        totalSoldOrders = await Order.countDocuments({
          ...baseCondition,
          isDeal: "Yes",
        });

        totalCancelledOrders = await Order.countDocuments({
          ...baseCondition,
          isDeal: "No",
        });
      }
    } else {
      const baseCondition = { ...matchCondition };

      totalSoldOrders = await Order.countDocuments({
        ...baseCondition,
        isDeal: "Yes",
      });

      totalCancelledOrders = await Order.countDocuments({
        ...baseCondition,
        isDeal: "No",
      });
    }

    return NextResponse.json({
      success: true,
      data: orders,
      currentPage: page,
      totalOrders,
      totalSoldOrders,
      totalCancelledOrders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
