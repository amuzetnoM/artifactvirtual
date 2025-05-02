import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  apiKeys?: {
    openai?: string;
    azure?: string;
    [key: string]: string | undefined;
  };
  // Methods
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    username: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-zA-Z0-9_-]+$/
    },
    email: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true,
      lowercase: true
    },
    passwordHash: { 
      type: String, 
      required: true 
    },
    displayName: { 
      type: String, 
      required: true,
      trim: true
    },
    bio: { 
      type: String,
      maxlength: 500 
    },
    avatarUrl: { 
      type: String 
    },
    website: { 
      type: String,
      trim: true 
    },
    socialLinks: {
      twitter: String,
      github: String,
      linkedin: String
    },
    isVerified: { 
      type: Boolean, 
      default: false 
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    lastLoginAt: Date,
    apiKeys: {
      type: Map,
      of: String
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook to hash password
UserSchema.pre('save', async function(next) {
  // Only hash the password if it's new or modified
  if (!this.isModified('passwordHash')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.passwordHash);
};

// Create and export the model
const User = mongoose.model<IUser>('User', UserSchema);
export default User;