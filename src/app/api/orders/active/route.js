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

    console.log(query, "CHECK");
    // Base filter condition to fetch only 'Active' orders
    const matchCondition = { orderStatus: "Active" };

    // Handle text search
    if (query) {
      matchCondition.$or = [
        { salesExecutive: { $regex: query, $options: "i" } },
        { customer: { $regex: query, $options: "i" } },
        { registration: { $regex: query, $options: "i" } },
        { orderStatus: { $regex: query, $options: "i" } },
      ];
    }

    // Process months filter
    if (months) {
      const selectedMonths = months.split(",");

      if (selectedMonths.length > 0) {
        // Create date conditions for each selected month
        const dateConditions = [];

        selectedMonths.forEach((monthStr) => {
          // Parse the month string (e.g., "Jan 2023")
          const [monthName, yearStr] = monthStr.split(" ");
          const year = Number.parseInt(yearStr);

          // Map month name to month number (0-11)
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

          // Create start and end dates for the month
          const startDate = new Date(year, month, 1);
          const endDate = new Date(year, month + 1, 0); // Last day of month

          // Add date range condition
          dateConditions.push({
            openingDate: {
              $gte: startDate,
              $lte: endDate,
            },
          });
        });

        // Add the date conditions to the match condition
        if (dateConditions.length > 0) {
          // If we already have $or conditions, we need to use $and to combine them
          if (matchCondition.$or) {
            matchCondition.$and = [
              { $or: matchCondition.$or },
              { $or: dateConditions },
            ];
            delete matchCondition.$or;
          } else {
            matchCondition.$or = dateConditions;
          }
        }
      }
    }

    // Process additional filters from the URL
    let isDealFilterApplied = false;
    let isDealValue = null;

    for (const [key, value] of searchParams.entries()) {
      if (["page", "limit", "search", "orderStatus", "months"].includes(key))
        continue;

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
      .sort({ openingDate: -1 })
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
    console.error("Error fetching active orders:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
