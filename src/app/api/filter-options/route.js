import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET() {
  try {
    await connectToDatabase();

    // Get unique values for enquiryType (sorted alphabetically)
    const enquiryTypeValues = await Order.aggregate([
      { $group: { _id: "$enquiryType" } },
      { $match: { _id: { $ne: null } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 1 } },
    ]);

    // Get unique values for salesExecutive (sorted alphabetically)
    const salesExecutiveValues = await Order.aggregate([
      { $group: { _id: "$salesExecutive" } },
      { $match: { _id: { $ne: null } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 1 } },
    ]);

    // Get unique values for isPctSheetReceivedWithinTime (sorted)
    const isPctSheetReceivedWithinTimeValues = await Order.aggregate([
      { $group: { _id: "$isPctSheetReceivedWithinTime" } },
      { $match: { _id: { $ne: null } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 1 } },
    ]);

    // Get unique values for pctStatus (sorted alphabetically)
    const pctStatusValues = await Order.aggregate([
      { $group: { _id: "$pctStatus" } },
      { $match: { _id: { $ne: null } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 1 } },
    ]);

    // Get unique values for orderStatus (sorted alphabetically)
    const orderStatusValues = await Order.aggregate([
      { $group: { _id: "$orderStatus" } },
      { $match: { _id: { $ne: null } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 1 } },
    ]);

    // Get unique values for isShowUp (sorted)
    const isShowUpValues = await Order.aggregate([
      { $group: { _id: "$isShowUp" } },
      { $match: { _id: { $ne: null } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 1 } },
    ]);

    // Get unique values for isDeal (sorted)
    const isDealValues = await Order.aggregate([
      { $group: { _id: "$isDeal" } },
      { $match: { _id: { $ne: null } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 1 } },
    ]);

    // Get unique values for reasonForAction (sorted alphabetically)
    const reasonForActionValues = await Order.aggregate([
      { $group: { _id: "$reasonForAction" } },
      { $match: { _id: { $ne: null } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 1 } },
    ]);

    // Get unique values for isLossDeal (sorted)
    const isLossDealValues = await Order.aggregate([
      { $group: { _id: "$isLossDeal" } },
      { $match: { _id: { $ne: null } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 1 } },
    ]);

    const locationValues = await Order.aggregate([
      { $group: { _id: "$location" } },
      { $match: { _id: { $ne: null } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 1 } },
    ]);

    return NextResponse.json({
      enquiryType: enquiryTypeValues.map((item) => item._id).filter(Boolean),
      salesExecutive: salesExecutiveValues
        .map((item) => item._id)
        .filter(Boolean),
      isPctSheetReceivedWithinTime: isPctSheetReceivedWithinTimeValues
        .map((item) => item._id)
        .filter(Boolean),
      pctStatus: pctStatusValues.map((item) => item._id).filter(Boolean),
      location: locationValues.map((item) => item._id).filter(Boolean),
      orderStatus: orderStatusValues.map((item) => item._id).filter(Boolean),
      isShowUp: isShowUpValues.map((item) => item._id).filter(Boolean),
      isDeal: isDealValues.map((item) => item._id).filter(Boolean),
      reasonForAction: reasonForActionValues
        .map((item) => item._id)
        .filter(Boolean),
      isLossDeal: isLossDealValues.map((item) => item._id).filter(Boolean),
    });
  } catch (error) {
    console.error("Error fetching filter options:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
