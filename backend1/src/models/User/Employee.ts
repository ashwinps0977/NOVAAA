import mongoose, { Schema, Document } from "mongoose";

export interface IEmployee extends Document {
  user: mongoose.Types.ObjectId;
  department: string;
  designation: string;
  joiningDate: Date;
}

const EmployeeSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    department: String,
    designation: String,
    joiningDate: Date
  },
  { timestamps: true }
);

export default mongoose.model<IEmployee>("Employee", EmployeeSchema);
