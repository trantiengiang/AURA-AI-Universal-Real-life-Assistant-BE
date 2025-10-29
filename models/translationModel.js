const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class TranslationModel {
  async createTranslation(userId, translationData) {
    try {
      const translation = await prisma.translation.create({
        data: {
          userId,
          inputText: translationData.inputText,
          outputText: translationData.outputText,
          fromLang: translationData.fromLang,
          toLang: translationData.toLang,
          isVoice: translationData.isVoice || false,
          audioUrl: translationData.audioUrl
        }
      });

      return {
        success: true,
        data: translation
      };
    } catch (error) {
      throw error;
    }
  }

  async getTranslations(userId, options = {}) {
    try {
      const { limit = 10, offset = 0, fromLang, toLang, isVoice } = options;

      const whereClause = {
        userId,
        ...(fromLang && { fromLang }),
        ...(toLang && { toLang }),
        ...(isVoice !== undefined && { isVoice })
      };

      const [translations, total] = await Promise.all([
        prisma.translation.findMany({
          where: whereClause,
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset
        }),
        prisma.translation.count({ where: whereClause })
      ]);

      return {
        success: true,
        data: {
          translations,
          total,
          limit,
          offset
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async getTranslationById(translationId, userId) {
    try {
      const translation = await prisma.translation.findFirst({
        where: {
          id: translationId,
          userId
        }
      });

      if (!translation) {
        return {
          success: false,
          error: 'Translation not found'
        };
      }

      return {
        success: true,
        data: translation
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteTranslation(translationId, userId) {
    try {
      const result = await prisma.translation.deleteMany({
        where: {
          id: translationId,
          userId
        }
      });

      if (result.count === 0) {
        return {
          success: false,
          error: 'Translation not found'
        };
      }

      return {
        success: true,
        message: 'Translation deleted successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  async getTranslationStats(userId, period = '30d') {
    try {
      const now = new Date();
      let startDate;

      switch (period) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const translations = await prisma.translation.findMany({
        where: {
          userId,
          createdAt: {
            gte: startDate
          }
        }
      });

      // Calculate statistics
      const stats = {
        totalTranslations: translations.length,
        voiceTranslations: translations.filter(t => t.isVoice).length,
        textTranslations: translations.filter(t => !t.isVoice).length,
        languagePairs: {},
        averageTextLength: 0,
        recentTranslations: []
      };

      if (translations.length > 0) {
        // Language pairs analysis
        translations.forEach(translation => {
          const pair = `${translation.fromLang}-${translation.toLang}`;
          stats.languagePairs[pair] = (stats.languagePairs[pair] || 0) + 1;
        });

        // Average text length
        const totalLength = translations.reduce((sum, t) => sum + t.inputText.length, 0);
        stats.averageTextLength = totalLength / translations.length;

        // Recent translations (last 10)
        stats.recentTranslations = translations
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 10)
          .map(t => ({
            id: t.id,
            inputText: t.inputText.substring(0, 100) + (t.inputText.length > 100 ? '...' : ''),
            outputText: t.outputText.substring(0, 100) + (t.outputText.length > 100 ? '...' : ''),
            fromLang: t.fromLang,
            toLang: t.toLang,
            createdAt: t.createdAt
          }));
      }

      return {
        success: true,
        data: {
          period,
          stats
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async getPopularLanguagePairs(userId, limit = 10) {
    try {
      const translations = await prisma.translation.findMany({
        where: { userId },
        select: { fromLang: true, toLang: true }
      });

      const pairCounts = {};
      translations.forEach(translation => {
        const pair = `${translation.fromLang}-${translation.toLang}`;
        pairCounts[pair] = (pairCounts[pair] || 0) + 1;
      });

      const popularPairs = Object.entries(pairCounts)
        .map(([pair, count]) => {
          const [fromLang, toLang] = pair.split('-');
          return { fromLang, toLang, count };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);

      return {
        success: true,
        data: popularPairs
      };
    } catch (error) {
      throw error;
    }
  }

  async searchTranslations(userId, query, options = {}) {
    try {
      const { limit = 10, offset = 0, fromLang, toLang } = options;

      const whereClause = {
        userId,
        OR: [
          { inputText: { contains: query, mode: 'insensitive' } },
          { outputText: { contains: query, mode: 'insensitive' } }
        ],
        ...(fromLang && { fromLang }),
        ...(toLang && { toLang })
      };

      const [translations, total] = await Promise.all([
        prisma.translation.findMany({
          where: whereClause,
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset
        }),
        prisma.translation.count({ where: whereClause })
      ]);

      return {
        success: true,
        data: {
          translations,
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

  async getTranslationsByDateRange(userId, startDate, endDate) {
    try {
      const translations = await prisma.translation.findMany({
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
        data: translations
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new TranslationModel();


