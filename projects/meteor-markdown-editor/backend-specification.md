# Meteor Markdown Editor - Backend Specification

## Technology Stack

The backend for the Meteor Markdown Editor will be implemented using the following technologies:

- **Runtime/Framework**: Node.js with Express.js
- **Database**: MongoDB (document-oriented database ideal for storing markdown documents)
- **Authentication**: JWT (JSON Web Tokens) for secure user authentication
- **API**: RESTful API endpoints with OpenAPI/Swagger documentation
- **Cloud Storage**: AWS S3 or equivalent for storing document attachments (images)
- **Deployment**: Docker containers for easy deployment to various cloud platforms

## Database Schema

### Users Collection

```typescript
interface User {
  _id: ObjectId;
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
    // other provider keys, stored encrypted
  };
}
```

### Documents Collection

```typescript
interface Document {
  _id: ObjectId;
  ownerId: ObjectId; // Reference to user
  title: string;
  content: string;
  contentPreview: string; // First ~100 words for display in lists
  tags: string[];
  isPublic: boolean;
  isPublished: boolean;
  slug?: string; // For published documents
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
    userId: ObjectId;
    role: 'viewer' | 'editor' | 'admin';
    addedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
  version: number;
}
```

### Versions Collection (Document History)

```typescript
interface Version {
  _id: ObjectId;
  documentId: ObjectId; // Reference to document
  userId: ObjectId; // User who made the change
  content: string;
  changes: {
    additions: number;
    deletions: number;
    summary?: string; // AI-generated summary of changes
  };
  createdAt: Date;
  version: number;
}
```

### Comments Collection

```typescript
interface Comment {
  _id: ObjectId;
  documentId: ObjectId; // Reference to document
  userId: ObjectId; // User who made the comment
  content: string;
  position?: {
    startLine: number;
    endLine?: number;
  }; // For inline comments
  parentId?: ObjectId; // For nested comments
  createdAt: Date;
  updatedAt?: Date;
  reactions?: {
    userId: ObjectId;
    type: 'like' | 'heart' | 'thumbsup' | 'thinking';
  }[];
}
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/forgot-password` - Send password reset email
- `POST /api/auth/reset-password` - Reset password with token
- `PUT /api/auth/verify-email` - Verify email address
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile

### Documents

- `GET /api/documents` - List user's documents (with pagination, filtering)
- `POST /api/documents` - Create a new document
- `GET /api/documents/:id` - Get a document
- `PUT /api/documents/:id` - Update a document
- `DELETE /api/documents/:id` - Delete a document
- `GET /api/documents/:id/versions` - Get document version history
- `GET /api/documents/:id/versions/:versionId` - Get specific document version
- `POST /api/documents/:id/publish` - Publish a document (to internal or external platforms)
- `PUT /api/documents/:id/unpublish` - Unpublish a document

### Collaborators

- `GET /api/documents/:id/collaborators` - List document collaborators
- `POST /api/documents/:id/collaborators` - Add a collaborator
- `PUT /api/documents/:id/collaborators/:userId` - Update collaborator permissions
- `DELETE /api/documents/:id/collaborators/:userId` - Remove a collaborator

### Community

- `GET /api/community/documents` - List public documents (with pagination, filtering)
- `GET /api/community/documents/trending` - Get trending documents
- `GET /api/community/documents/recent` - Get recently published documents
- `GET /api/community/documents/featured` - Get featured documents
- `GET /api/community/users/:username` - Get public user profile
- `GET /api/community/users/:username/documents` - Get user's public documents

### Comments

- `GET /api/documents/:id/comments` - Get document comments
- `POST /api/documents/:id/comments` - Add a comment
- `PUT /api/documents/:id/comments/:commentId` - Update a comment
- `DELETE /api/documents/:id/comments/:commentId` - Delete a comment
- `POST /api/documents/:id/comments/:commentId/react` - React to a comment

### Search

- `GET /api/search/documents` - Search documents (title, content, tags)
- `GET /api/search/users` - Search users

### AI Integration

- `POST /api/ai/analyze` - Analyze document content
- `POST /api/ai/summarize` - Summarize document content
- `POST /api/ai/generate` - Generate content based on prompt
- `POST /api/ai/check-grammar` - Check document grammar
- `POST /api/ai/suggest` - Get text completion suggestions

## Security Considerations

1. **Authentication**: Implement JWT-based authentication with refresh tokens
2. **Authorization**: Role-based access control for documents and operations
3. **Data Validation**: Validate and sanitize all user inputs
4. **Rate Limiting**: Implement rate limiting to prevent abuse
5. **API Keys**: Securely store and manage third-party API keys
6. **CORS**: Configure proper CORS headers for API access
7. **HTTPS**: Ensure all communications are encrypted with TLS
8. **Data Encryption**: Encrypt sensitive data in the database
9. **Error Handling**: Implement proper error handling without exposing sensitive information

## Deployment Architecture

The backend will be containerized using Docker and can be deployed to various cloud platforms:

1. **Development**: Local Docker compose setup with MongoDB
2. **Staging**: Kubernetes cluster or AWS ECS with MongoDB Atlas
3. **Production**: Kubernetes cluster with autoscaling, load balancing, and MongoDB Atlas

## Next Steps

1. Set up the basic Express.js application with TypeScript
2. Implement authentication system
3. Create initial models and database connection
4. Develop basic CRUD operations for documents
5. Add the collaboration features
6. Implement community features
7. Integrate with frontend application
8. Add comprehensive testing
9. Set up CI/CD pipeline
10. Deploy to production