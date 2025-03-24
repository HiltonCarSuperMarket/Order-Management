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
    type: Date,
    required: true,
  },
  closingTime: {
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
  isPctSheetReceivedWithinTime: {
    type: String,
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
    required: true,
  },
  isDeal: {
    type: String,
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
    required: true,
  },
  customer: {
    type: String,
  },
});

const Order = models.Order || model("Order", OrderSchema);

export default Order;
