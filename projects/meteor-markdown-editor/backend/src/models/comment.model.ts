import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  documentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  content: string;
  position?: {
    startLine: number;
    endLine?: number;
  };
  parentId?: mongoose.Types.ObjectId;
  reactions?: {
    userId: mongoose.Types.ObjectId;
    type: 'like' | 'heart' | 'thumbsup' | 'thinking';
  }[];
  createdAt: Date;
  updatedAt?: Date;
}

const CommentSchema: Schema = new Schema(
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
      trim: true,
      maxlength: 2000,
    },
    position: {
      startLine: {
        type: Number,
        min: 0,
      },
      endLine: {
        type: Number,
        min: 0,
      },
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
    },
    reactions: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        type: {
          type: String,
          enum: ['like', 'heart', 'thumbsup', 'thinking'],
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient querying
CommentSchema.index({ documentId: 1 });
CommentSchema.index({ parentId: 1 });

// Add pre-save validation to ensure parent comments don't have parents themselves (max 1 level nesting)
CommentSchema.pre('save', async function (next) {
  if (this.parentId) {
    const parentComment = await mongoose.model('Comment').findById(this.parentId);
    if (parentComment && parentComment.parentId) {
      return next(new Error('Comments can only be nested one level deep'));
    }
  }
  next();
});

const CommentModel = mongoose.model<IComment>('Comment', CommentSchema);
export default CommentModel;