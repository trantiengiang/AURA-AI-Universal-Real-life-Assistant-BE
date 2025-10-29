const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class NotesModel {
  async createNote(userId, noteData) {
    try {
      const note = await prisma.note.create({
        data: {
          userId,
          title: noteData.title,
          content: noteData.content,
          tags: noteData.tags ? JSON.stringify(noteData.tags) : null,
          isVoice: noteData.isVoice || false,
          audioUrl: noteData.audioUrl
        }
      });

      return {
        success: true,
        data: note
      };
    } catch (error) {
      throw error;
    }
  }

  async getNotes(userId, options = {}) {
    try {
      const { limit = 10, offset = 0, search, tags, isVoice } = options;

      const whereClause = {
        userId,
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } }
          ]
        }),
        ...(tags && tags.length > 0 && {
          tags: {
            contains: JSON.stringify(tags)
          }
        }),
        ...(isVoice !== undefined && { isVoice })
      };

      const [notes, total] = await Promise.all([
        prisma.note.findMany({
          where: whereClause,
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset
        }),
        prisma.note.count({ where: whereClause })
      ]);

      return {
        success: true,
        data: {
          notes,
          total,
          limit,
          offset
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async getNoteById(noteId, userId) {
    try {
      const note = await prisma.note.findFirst({
        where: {
          id: noteId,
          userId
        }
      });

      if (!note) {
        return {
          success: false,
          error: 'Note not found'
        };
      }

      return {
        success: true,
        data: note
      };
    } catch (error) {
      throw error;
    }
  }

  async updateNote(noteId, userId, updateData) {
    try {
      const note = await prisma.note.updateMany({
        where: {
          id: noteId,
          userId
        },
        data: {
          title: updateData.title,
          content: updateData.content,
          tags: updateData.tags ? JSON.stringify(updateData.tags) : null,
          audioUrl: updateData.audioUrl
        }
      });

      if (note.count === 0) {
        return {
          success: false,
          error: 'Note not found'
        };
      }

      return {
        success: true,
        message: 'Note updated successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteNote(noteId, userId) {
    try {
      const result = await prisma.note.deleteMany({
        where: {
          id: noteId,
          userId
        }
      });

      if (result.count === 0) {
        return {
          success: false,
          error: 'Note not found'
        };
      }

      return {
        success: true,
        message: 'Note deleted successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  async searchNotes(userId, query, options = {}) {
    try {
      const { limit = 10, offset = 0, tags } = options;

      const whereClause = {
        userId,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
          { tags: { contains: query, mode: 'insensitive' } }
        ],
        ...(tags && tags.length > 0 && {
          tags: {
            contains: JSON.stringify(tags)
          }
        })
      };

      const [notes, total] = await Promise.all([
        prisma.note.findMany({
          where: whereClause,
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset
        }),
        prisma.note.count({ where: whereClause })
      ]);

      return {
        success: true,
        data: {
          notes,
          total,
          query,
          limit,
          offset
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async getNoteStats(userId) {
    try {
      const [
        totalNotes,
        voiceNotes,
        textNotes,
        totalTags,
        recentNotes
      ] = await Promise.all([
        prisma.note.count({ where: { userId } }),
        prisma.note.count({ where: { userId, isVoice: true } }),
        prisma.note.count({ where: { userId, isVoice: false } }),
        prisma.note.findMany({
          where: { userId },
          select: { tags: true }
        }),
        prisma.note.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            title: true,
            createdAt: true,
            isVoice: true
          }
        })
      ]);

      // Count unique tags
      const allTags = totalTags
        .filter(note => note.tags)
        .flatMap(note => {
          try {
            return JSON.parse(note.tags);
          } catch {
            return [];
          }
        });
      const uniqueTags = [...new Set(allTags)];

      return {
        success: true,
        data: {
          totalNotes,
          voiceNotes,
          textNotes,
          uniqueTagsCount: uniqueTags.length,
          recentNotes
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async getNotesByDateRange(userId, startDate, endDate) {
    try {
      const notes = await prisma.note.findMany({
        where: {
          userId,
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return {
        success: true,
        data: notes
      };
    } catch (error) {
      throw error;
    }
  }

  async getPopularTags(userId, limit = 10) {
    try {
      const notes = await prisma.note.findMany({
        where: { userId },
        select: { tags: true }
      });

      const tagCounts = {};
      notes.forEach(note => {
        if (note.tags) {
          try {
            const tags = JSON.parse(note.tags);
            tags.forEach(tag => {
              tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
          } catch {
            // Skip invalid JSON
          }
        }
      });

      const popularTags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);

      return {
        success: true,
        data: popularTags
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new NotesModel();


