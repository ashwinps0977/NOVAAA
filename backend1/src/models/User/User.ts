// src/models/User/User.ts
import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "HR" | "EMPLOYEE";
  skills: string[]; // ✅ Added this field
  department?: string;
  position?: string; // ✅ Added position field
  experience?: string; // ✅ Added experience field
  employeeId?: string;
  phone?: string;
  avatar?: string;
  hireDate?: Date; // ✅ Added hireDate field
  performanceScore?: number; // ✅ Added performanceScore field
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: ["ADMIN", "HR", "EMPLOYEE"],
      default: "EMPLOYEE",
    },
    skills: { // ✅ Added skills field
      type: [String],
      default: [],
    },
    department: {
      type: String,
      trim: true,
    },
    position: { // ✅ Added position field
      type: String,
      trim: true,
    },
    experience: { // ✅ Added experience field
      type: String,
      trim: true,
    },
    employeeId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    hireDate: { // ✅ Added hireDate field
      type: Date,
    },
    performanceScore: { // ✅ Added performanceScore field
      type: Number,
      min: 0,
      max: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Create text index for skills for better search
UserSchema.index({ skills: "text", name: "text", email: "text" });

// ✅ NO PRE-SAVE HOOK - We'll handle hashing manually
// Method to hash password before saving
UserSchema.methods.hashPassword = async function (): Promise<void> {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
};

// Method to compare password
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Static method to create user with hashed password
UserSchema.statics.createUser = async function (userData: any) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password, salt);
  
  const user = new this({
    ...userData,
    password: hashedPassword
  });
  
  return await user.save();
};

// Interface for static methods
interface IUserModel extends mongoose.Model<IUser> {
  createUser(userData: any): Promise<IUser>;
}

export default mongoose.model<IUser, IUserModel>("User", UserSchema);