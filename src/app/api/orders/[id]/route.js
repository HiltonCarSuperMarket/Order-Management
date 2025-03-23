import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Order";

// GET a single order by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// UPDATE an order
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    await connectToDatabase();

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: false }
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedOrder });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE an order
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
