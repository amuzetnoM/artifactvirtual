import mongoose, { Schema, Document } from 'mongoose';

export interface IDocument extends Document {
  ownerId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  contentPreview: string;
  tags: string[];
  isPublic: boolean;
  isPublished: boolean;
  slug?: string;
  publishedAt?: Date;
  publishedTo?: {
    platform: string;
    url: string;
    publishedAt: Date;
  }[];
  metadata: {
    author?: string;
    description?: string;
    keywords?: string[];
    canonicalUrl?: string;
  };
  collaborators?: {
    userId: mongoose.Types.ObjectId;
    role: 'viewer' | 'editor' | 'admin';
    addedAt: Date;
  }[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema: Schema = new Schema(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
    },
    contentPreview: {
      type: String,
      maxlength: 500,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 50,
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true, // Allow null/undefined, but enforce uniqueness if present
      maxlength: 200,
    },
    publishedAt: {
      type: Date,
    },
    publishedTo: [
      {
        platform: String,
        url: String,
        publishedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    metadata: {
      author: String,
      description: {
        type: String,
        maxlength: 500,
      },
      keywords: [String],
      canonicalUrl: String,
    },
    collaborators: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        role: {
          type: String,
          enum: ['viewer', 'editor', 'admin'],
          default: 'viewer',
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Create text index for search
DocumentSchema.index({ title: 'text', content: 'text', tags: 'text' });

// Pre-save hook to update contentPreview
DocumentSchema.pre('save', function (next) {
  if (this.isModified('content')) {
    // Generate a preview from the content - first ~100 words
    const words = this.content.split(' ');
    const previewWords = words.slice(0, 100);
    this.contentPreview = previewWords.join(' ');
    if (words.length > 100) {
      this.contentPreview += '...';
    }
  }
  next();
});

const DocumentModel = mongoose.model<IDocument>('Document', DocumentSchema);
export default DocumentModel;