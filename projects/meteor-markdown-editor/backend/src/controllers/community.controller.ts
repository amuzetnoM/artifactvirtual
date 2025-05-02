import { Request, Response } from 'express';
import mongoose from 'mongoose';
import DocumentModel from '../models/document.model';
import User from '../models/user.model';

/**
 * Get all public documents with pagination and filtering
 */
export const getPublicDocuments = async (req: Request, res: Response) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Filter parameters
    const tag = req.query.tag as string;
    const query: any = { isPublic: true, isPublished: true };
    
    if (tag) {
      query.tags = tag;
    }
    
    // Get total count for pagination
    const totalDocuments = await DocumentModel.countDocuments(query);
    
    // Get documents with pagination
    const documents = await DocumentModel.find(query)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('title tags contentPreview metadata publishedAt')
      .populate('ownerId', 'username displayName avatarUrl');
    
    res.json({
      documents,
      pagination: {
        total: totalDocuments,
        page,
        limit,
        pages: Math.ceil(totalDocuments / limit)
      }
    });
  } catch (error) {
    console.error('Get public documents error:', error);
    res.status(500).json({ error: 'An error occurred fetching public documents' });
  }
};

/**
 * Get trending documents based on views, likes, and recency
 */
export const getTrendingDocuments = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    
    // In a real app, this would be based on view counts, likes, comments, etc.
    // For now, we'll use a simple algorithm combining recency and a mock engagement score
    const documents = await DocumentModel.aggregate([
      { $match: { isPublic: true, isPublished: true } },
      // Add a field for trending score calculation
      { $addFields: {
          // Calculate days since publication (newer is better)
          daysSincePublication: {
            $divide: [
              { $subtract: [new Date(), "$publishedAt"] },
              1000 * 60 * 60 * 24 // Convert ms to days
            ]
          },
          // This would be replaced with actual metrics in production
          mockEngagementScore: { $multiply: [{ $rand: {} }, 10] }
        }
      },
      // Calculate trending score (recency + engagement)
      { $addFields: {
          trendingScore: {
            $subtract: [
              "$mockEngagementScore",
              { $divide: ["$daysSincePublication", 2] } // Newer content gets priority
            ]
          }
        }
      },
      { $sort: { trendingScore: -1 } },
      { $limit: limit },
      { $project: {
          daysSincePublication: 0,
          mockEngagementScore: 0,
          trendingScore: 0,
          content: 0
        }
      }
    ]);
    
    // Populate owner information
    const populatedDocuments = await DocumentModel.populate(documents, {
      path: 'ownerId',
      select: 'username displayName avatarUrl'
    });
    
    res.json(populatedDocuments);
  } catch (error) {
    console.error('Get trending documents error:', error);
    res.status(500).json({ error: 'An error occurred fetching trending documents' });
  }
};

/**
 * Get recently published documents
 */
export const getRecentDocuments = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    const documents = await DocumentModel.find({
      isPublic: true,
      isPublished: true
    })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .select('title tags contentPreview metadata publishedAt')
      .populate('ownerId', 'username displayName avatarUrl');
    
    res.json(documents);
  } catch (error) {
    console.error('Get recent documents error:', error);
    res.status(500).json({ error: 'An error occurred fetching recent documents' });
  }
};

/**
 * Get featured documents - curated or editorially selected
 */
export const getFeaturedDocuments = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    
    // In a real app, this would be curated by admins
    // For now, we'll use a random selection of public documents with 'featured' field or high quality
    const documents = await DocumentModel.aggregate([
      { $match: { isPublic: true, isPublished: true } },
      // Add mock quality score
      { $addFields: {
          isFeatured: { $eq: [{ $mod: [{ $rand: {} }, 5] }, 0] }, // ~20% chance of being featured
          qualityScore: { $multiply: [{ $rand: {} }, 10] }
        }
      },
      { $match: { $or: [{ isFeatured: true }, { qualityScore: { $gte: 8 } }] } },
      { $sort: { qualityScore: -1 } },
      { $limit: limit },
      { $project: {
          isFeatured: 0,
          qualityScore: 0,
          content: 0
        }
      }
    ]);
    
    // Populate owner information
    const populatedDocuments = await DocumentModel.populate(documents, {
      path: 'ownerId',
      select: 'username displayName avatarUrl'
    });
    
    res.json(populatedDocuments);
  } catch (error) {
    console.error('Get featured documents error:', error);
    res.status(500).json({ error: 'An error occurred fetching featured documents' });
  }
};

/**
 * Get public user profile 
 */
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    
    const user = await User.findOne({ username })
      .select('username displayName bio avatarUrl website socialLinks');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'An error occurred fetching user profile' });
  }
};

/**
 * Get public documents for a specific user
 */
export const getUserPublicDocuments = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    
    // Find the user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Get the user's public documents
    const query = {
      ownerId: user._id,
      isPublic: true,
      isPublished: true
    };
    
    // Get total count for pagination
    const totalDocuments = await DocumentModel.countDocuments(query);
    
    // Get documents with pagination
    const documents = await DocumentModel.find(query)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('title tags contentPreview metadata publishedAt');
    
    res.json({
      documents,
      user: {
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl
      },
      pagination: {
        total: totalDocuments,
        page,
        limit,
        pages: Math.ceil(totalDocuments / limit)
      }
    });
  } catch (error) {
    console.error('Get user documents error:', error);
    res.status(500).json({ error: 'An error occurred fetching user documents' });
  }
};

/**
 * Get all unique tags from public documents
 */
export const getAllTags = async (req: Request, res: Response) => {
  try {
    const tags = await DocumentModel.aggregate([
      { $match: { isPublic: true, isPublished: true } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, name: "$_id", count: 1 } }
    ]);
    
    res.json(tags);
  } catch (error) {
    console.error('Get all tags error:', error);
    res.status(500).json({ error: 'An error occurred fetching tags' });
  }
};

/**
 * Get documents by tag
 */
export const getDocumentsByTag = async (req: Request, res: Response) => {
  try {
    const { tag } = req.params;
    
    if (!tag) {
      return res.status(400).json({ error: 'Tag parameter is required' });
    }
    
    // Pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    const query = {
      tags: tag,
      isPublic: true,
      isPublished: true
    };
    
    // Get total count for pagination
    const totalDocuments = await DocumentModel.countDocuments(query);
    
    // Get documents with pagination
    const documents = await DocumentModel.find(query)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('title tags contentPreview metadata publishedAt')
      .populate('ownerId', 'username displayName avatarUrl');
    
    res.json({
      documents,
      tag,
      pagination: {
        total: totalDocuments,
        page,
        limit,
        pages: Math.ceil(totalDocuments / limit)
      }
    });
  } catch (error) {
    console.error('Get documents by tag error:', error);
    res.status(500).json({ error: 'An error occurred fetching documents by tag' });
  }
};

/**
 * Search for documents by text
 */
export const searchDocuments = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query parameter (q) is required' });
    }
    
    // Pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Search for public documents using the text index
    const searchQuery = {
      $text: { $search: query },
      isPublic: true,
      isPublished: true
    };
    
    // Get total count for pagination
    const totalDocuments = await DocumentModel.countDocuments(searchQuery);
    
    // Get documents with pagination and text score
    const documents = await DocumentModel.find(searchQuery, { score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" } })
      .skip(skip)
      .limit(limit)
      .select('title tags contentPreview metadata publishedAt')
      .populate('ownerId', 'username displayName avatarUrl');
    
    res.json({
      documents,
      query,
      pagination: {
        total: totalDocuments,
        page,
        limit,
        pages: Math.ceil(totalDocuments / limit)
      }
    });
  } catch (error) {
    console.error('Search documents error:', error);
    res.status(500).json({ error: 'An error occurred searching documents' });
  }
};