import mongoose, { Schema, Document } from 'mongoose';

export interface IVersion extends Document {
  documentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  content: string;
  changes: {
    additions: number;
    deletions: number;
    summary?: string;
  };
  version: number;
  createdAt: Date;
}

const VersionSchema: Schema = new Schema(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    changes: {
      additions: {
        type: Number,
        default: 0,
      },
      deletions: {
        type: Number,
        default: 0,
      },
      summary: String,
    },
    version: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for efficient querying of document versions
VersionSchema.index({ documentId: 1, version: 1 });

const VersionModel = mongoose.model<IVersion>('Version', VersionSchema);
export default VersionModel;