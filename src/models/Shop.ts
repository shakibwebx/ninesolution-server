import mongoose, { Schema, Document, model } from 'mongoose';

export interface IShop extends Document {
  name: string;
  owner: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const shopSchema = new Schema<IShop>(
  {
    name: {
      type: String,
      required: [true, 'Shop name is required'],
      unique: true,
      trim: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required'],
    },
  },
  {
    timestamps: true, // ✅ adds createdAt and updatedAt automatically
  }
);

export default model<IShop>('Shop', shopSchema);
