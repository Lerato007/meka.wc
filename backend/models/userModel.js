import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema(
  {
    name:  { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password:{ type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false },
    address: {
      street:     { type: String },
      city:       { type: String },
      state:      { type: String },
      postalCode: { type: String },
      phoneNumber:{ type: String },
    },
    // Wishlist: array of product ObjectIds
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);
export default User;