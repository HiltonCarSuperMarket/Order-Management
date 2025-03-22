import { Schema, model, models } from "mongoose";

const OrderSchema = new Schema({
  entryDate: {
    type: Date,
    required: true,
  },
  entryTime: {
    type: String,
    required: true,
  },
  enquiryType: {
    type: String,
    required: true,
  },
  registration: {
    type: String,
    required: true,
  },
  orderDate: {
    type: Date,
    required: true,
  },
  collectionDate: {
    type: Date,
    required: true,
  },
  collectionTime: {
    type: String,
    required: true,
  },
  salesExecutive: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  isPCTSheetReceivedWithinTime: {
    type: String,
    enum: ["Yes", "No"],
    required: true,
  },
  pctStatus: {
    type: String,
    required: true,
  },
  orderStatus: {
    type: String,
    required: true,
  },
  isShowUp: {
    type: String,
    enum: ["Yes", "No"],
    required: true,
  },
  isDeal: {
    type: String,
    enum: ["Yes", "No"],
    required: true,
  },
  cancellationDate: {
    type: Date,
    default: null,
  },
  reasonForAction: {
    type: String,
  },
  reasonDetail: {
    type: String,
  },
  isLossDeal: {
    type: String,
    enum: ["Yes", "No"],
    required: true,
  },
  customer: {
    type: String,
  },
});

const Order = models.Order || model("Order", OrderSchema);

export default Order;
