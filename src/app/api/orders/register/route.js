import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";

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
