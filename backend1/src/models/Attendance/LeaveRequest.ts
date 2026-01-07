import mongoose, { Schema, Document } from "mongoose";

export interface ILeave extends Document {
  employee: mongoose.Types.ObjectId;
  fromDate: Date;
  toDate: Date;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

const LeaveSchema = new Schema(
  {
    employee: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    fromDate: Date,
    toDate: Date,
    reason: String,
    status: { type: String, default: "PENDING" }
  },
  { timestamps: true }
);

export default mongoose.model<ILeave>("LeaveRequest", LeaveSchema);
