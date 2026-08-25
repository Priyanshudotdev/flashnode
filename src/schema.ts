import { model, Schema, Document } from "mongoose";

export interface IUser {
    email: string;
    password: string;
    city?: string;
    contact?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            trim: true,
        },
        contact: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

export const User = model<IUser>("User", userSchema);