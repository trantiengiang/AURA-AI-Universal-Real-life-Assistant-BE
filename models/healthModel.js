const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class HealthModel {
  async createHealthRecord(userId, healthData) {
    try {
      const healthRecord = await prisma.healthRecord.create({
        data: {
          userId,
          date: healthData.date || new Date(),
          weight: healthData.weight,
          height: healthData.height,
          calories: healthData.calories,
          sleep: healthData.sleep,
          exercise: healthData.exercise,
          advice: healthData.advice,
          imageUrl: healthData.imageUrl
        }
      });

      return {
        success: true,
        data: healthRecord
      };
    } catch (error) {
      throw error;
    }
  }

  async getHealthRecords(userId, options = {}) {
    try {
      const { limit = 10, offset = 0, startDate, endDate } = options;

      const whereClause = {
        userId,
        ...(startDate && endDate && {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        })
      };

      const [records, total] = await Promise.all([
        prisma.healthRecord.findMany({
          where: whereClause,
          orderBy: { date: 'desc' },
          take: limit,
          skip: offset
        }),
        prisma.healthRecord.count({ where: whereClause })
      ]);

      return {
        success: true,
        data: {
          records,
          total,
          limit,
          offset
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async getHealthRecordById(recordId, userId) {
    try {
      const record = await prisma.healthRecord.findFirst({
        where: {
          id: recordId,
          userId
        }
      });

      if (!record) {
        return {
          success: false,
          error: 'Health record not found'
        };
      }

      return {
        success: true,
        data: record
      };
    } catch (error) {
      throw error;
    }
  }

  async updateHealthRecord(recordId, userId, updateData) {
    try {
      const record = await prisma.healthRecord.updateMany({
        where: {
          id: recordId,
          userId
        },
        data: {
          weight: updateData.weight,
          height: updateData.height,
          calories: updateData.calories,
          sleep: updateData.sleep,
          exercise: updateData.exercise,
          advice: updateData.advice,
          imageUrl: updateData.imageUrl
        }
      });

      if (record.count === 0) {
        return {
          success: false,
          error: 'Health record not found'
        };
      }

      return {
        success: true,
        message: 'Health record updated successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteHealthRecord(recordId, userId) {
    try {
      const result = await prisma.healthRecord.deleteMany({
        where: {
          id: recordId,
          userId
        }
      });

      if (result.count === 0) {
        return {
          success: false,
          error: 'Health record not found'
        };
      }

      return {
        success: true,
        message: 'Health record deleted successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  async getHealthStats(userId, period = '30d') {
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

      const records = await prisma.healthRecord.findMany({
        where: {
          userId,
          date: {
            gte: startDate
          }
        },
        orderBy: { date: 'asc' }
      });

      // Calculate statistics
      const stats = {
        totalRecords: records.length,
        averageWeight: 0,
        averageCalories: 0,
        averageSleep: 0,
        weightTrend: 'stable',
        calorieTrend: 'stable',
        sleepTrend: 'stable'
      };

      if (records.length > 0) {
        // Calculate averages
        const weights = records.filter(r => r.weight).map(r => r.weight);
        const calories = records.filter(r => r.calories).map(r => r.calories);
        const sleep = records.filter(r => r.sleep).map(r => r.sleep);

        stats.averageWeight = weights.length > 0 ? weights.reduce((a, b) => a + b, 0) / weights.length : 0;
        stats.averageCalories = calories.length > 0 ? calories.reduce((a, b) => a + b, 0) / calories.length : 0;
        stats.averageSleep = sleep.length > 0 ? sleep.reduce((a, b) => a + b, 0) / sleep.length : 0;

        // Calculate trends (simple comparison of first half vs second half)
        if (records.length >= 4) {
          const midPoint = Math.floor(records.length / 2);
          const firstHalf = records.slice(0, midPoint);
          const secondHalf = records.slice(midPoint);

          const firstHalfWeight = firstHalf.filter(r => r.weight).map(r => r.weight);
          const secondHalfWeight = secondHalf.filter(r => r.weight).map(r => r.weight);

          if (firstHalfWeight.length > 0 && secondHalfWeight.length > 0) {
            const firstAvg = firstHalfWeight.reduce((a, b) => a + b, 0) / firstHalfWeight.length;
            const secondAvg = secondHalfWeight.reduce((a, b) => a + b, 0) / secondHalfWeight.length;
            
            if (secondAvg > firstAvg * 1.02) stats.weightTrend = 'increasing';
            else if (secondAvg < firstAvg * 0.98) stats.weightTrend = 'decreasing';
          }
        }
      }

      return {
        success: true,
        data: {
          period,
          stats,
          records: records.slice(-10) // Return last 10 records for charting
        }
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new HealthModel();


