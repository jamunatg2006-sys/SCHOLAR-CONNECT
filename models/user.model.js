import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';




const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },

}, { timestamps: true });


const User = mongoose.model("User", userSchema);
export default User;
