import mongoose, { Document, Schema } from "mongoose";
import { hashValue, compareValue } from "../shared/utils/bcrypt";

export interface UserPreferences {
  enable2FA: boolean;
  emailNotifications: boolean;
  twoFactorSecret?: string;
}

export interface UserDocument extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  userPreferences: UserPreferences;
  // Methods
  comparePassword: (password: string) => Promise<boolean>;
}

const userPreferencesSchema = new Schema<UserPreferences>({
  enable2FA: {
    type: Boolean,
    default: false,
  },
  emailNotifications: {
    type: Boolean,
    default: true,
  },
  twoFactorSecret: {
    type: String,
    required: false,
  },
});

const userSchema = new Schema<UserDocument>(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    userPreferences: { type: userPreferencesSchema, default: {} },
  },
  {
    timestamps: true,
    // toJSON: {
    //     transform: (doc, ret) => {
    //         ret.id = ret._id;
    //         delete ret._id;
    //         delete ret.password; // Don't return password in the response
    //         return ret;
    //     }
    // }
    toJSON: {},
  }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await hashValue(this.password);
  }
  next();
});

userSchema.methods.comparePassword = async function (value: string) {
  return await compareValue(value, this.password);
};

userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password; // Don't return password in the response
    delete ret.__v; // Don't return version key
    delete ret.userPreferences.twoFactorSecret; // Don't return 2FA secret
    // ret.id = ret._id; // Add id field
    return ret;
  },
});

// userSchema.set("toJSON", {
//   transform: function (doc, ret) {
//     delete ret.password;
//     delete ret.userPreferences.twoFactorSecret;
//     return ret;
//   },
// });

const UserModel = mongoose.model<UserDocument>("user", userSchema);

export default UserModel;
