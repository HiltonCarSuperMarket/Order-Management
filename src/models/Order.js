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
  openingDate: {
    type: Date,
    required: true,
  },
  closingDate: {
    type: String,
  },
  closingTime: {
    type: String,
  },
  salesExecutive: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  isPctSheetReceivedWithinTime: {
    type: String,
  },
  pctStatus: {
    type: String,
  },
  orderStatus: {
    type: String,
    required: true,
  },
  isShowUp: {
    type: String,
    default: null,
  },
  isDeal: {
    type: String,
    default: null,
  },
  reasonForAction: {
    type: String,
    default: null,
  },
  reasonDetail: {
    type: String,
    default: null,
  },
  isLossDeal: {
    type: String,
    default: null,
  },
  customer: {
    type: String,
    default: "Not Available",
  },
});

const Order = models.Order || model("Order", OrderSchema);

export default Order;
