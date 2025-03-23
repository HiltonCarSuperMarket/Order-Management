import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET() {
  try {
    await connectToDatabase();

    // Count active orders (where orderStatus is "Active")
    const activeOrders = await Order.countDocuments({ orderStatus: "Active" });

    // Count canceled orders (where cancellationDate is NOT null)
    const canceledOrders = await Order.countDocuments({
      cancellationDate: { $ne: null },
    });

    // Get total orders count for percentage calculations
    const totalOrders = await Order.countDocuments();

    // Calculate percentages for the progress bars
    const activeOrdersPercentage =
      totalOrders > 0 ? (activeOrders / totalOrders) * 100 : 0;
    const canceledOrdersPercentage =
      totalOrders > 0 ? (canceledOrders / totalOrders) * 100 : 0;

    return NextResponse.json({
      success: true,
      activeOrders,
      canceledOrders,
      totalOrders,
      activeOrdersPercentage,
      canceledOrdersPercentage,
    });
  } catch (error) {
    console.error("Error fetching order stats:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
