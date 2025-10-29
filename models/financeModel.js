const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class FinanceModel {
  async createFinanceRecord(userId, financeData) {
    try {
      const financeRecord = await prisma.financeRecord.create({
        data: {
          userId,
          category: financeData.category,
          amount: financeData.amount,
          note: financeData.note,
          type: financeData.type,
          date: financeData.date || new Date()
        }
      });

      return {
        success: true,
        data: financeRecord
      };
    } catch (error) {
      throw error;
    }
  }

  async getFinanceRecords(userId, options = {}) {
    try {
      const { limit = 10, offset = 0, startDate, endDate, category, type } = options;

      const whereClause = {
        userId,
        ...(startDate && endDate && {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        }),
        ...(category && { category }),
        ...(type && { type })
      };

      const [records, total] = await Promise.all([
        prisma.financeRecord.findMany({
          where: whereClause,
          orderBy: { date: 'desc' },
          take: limit,
          skip: offset
        }),
        prisma.financeRecord.count({ where: whereClause })
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

  async getFinanceRecordById(recordId, userId) {
    try {
      const record = await prisma.financeRecord.findFirst({
        where: {
          id: recordId,
          userId
        }
      });

      if (!record) {
        return {
          success: false,
          error: 'Finance record not found'
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

  async updateFinanceRecord(recordId, userId, updateData) {
    try {
      const record = await prisma.financeRecord.updateMany({
        where: {
          id: recordId,
          userId
        },
        data: {
          category: updateData.category,
          amount: updateData.amount,
          note: updateData.note,
          type: updateData.type,
          date: updateData.date
        }
      });

      if (record.count === 0) {
        return {
          success: false,
          error: 'Finance record not found'
        };
      }

      return {
        success: true,
        message: 'Finance record updated successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteFinanceRecord(recordId, userId) {
    try {
      const result = await prisma.financeRecord.deleteMany({
        where: {
          id: recordId,
          userId
        }
      });

      if (result.count === 0) {
        return {
          success: false,
          error: 'Finance record not found'
        };
      }

      return {
        success: true,
        message: 'Finance record deleted successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  async getFinanceStats(userId, period = '30d') {
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
        case '1y':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const records = await prisma.financeRecord.findMany({
        where: {
          userId,
          date: {
            gte: startDate
          }
        }
      });

      // Calculate statistics
      const stats = {
        totalRecords: records.length,
        totalIncome: 0,
        totalExpenses: 0,
        netAmount: 0,
        categoryBreakdown: {},
        monthlyBreakdown: {},
        topCategories: [],
        averageTransaction: 0
      };

      if (records.length > 0) {
        // Calculate totals
        records.forEach(record => {
          if (record.type === 'income') {
            stats.totalIncome += record.amount;
          } else {
            stats.totalExpenses += record.amount;
          }

          // Category breakdown
          if (!stats.categoryBreakdown[record.category]) {
            stats.categoryBreakdown[record.category] = { income: 0, expense: 0 };
          }
          stats.categoryBreakdown[record.category][record.type] += record.amount;

          // Monthly breakdown
          const month = record.date.toISOString().substring(0, 7); // YYYY-MM
          if (!stats.monthlyBreakdown[month]) {
            stats.monthlyBreakdown[month] = { income: 0, expense: 0 };
          }
          stats.monthlyBreakdown[month][record.type] += record.amount;
        });

        stats.netAmount = stats.totalIncome - stats.totalExpenses;
        stats.averageTransaction = (stats.totalIncome + stats.totalExpenses) / records.length;

        // Top categories by expense
        stats.topCategories = Object.entries(stats.categoryBreakdown)
          .map(([category, data]) => ({
            category,
            total: data.income + data.expense,
            income: data.income,
            expense: data.expense
          }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 5);
      }

      return {
        success: true,
        data: {
          period,
          stats,
          records: records.slice(-20) // Return last 20 records for charting
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async getCategoryInsights(userId, category, period = '30d') {
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

      const records = await prisma.financeRecord.findMany({
        where: {
          userId,
          category,
          date: {
            gte: startDate
          }
        },
        orderBy: { date: 'desc' }
      });

      const totalAmount = records.reduce((sum, record) => sum + record.amount, 0);
      const averageAmount = records.length > 0 ? totalAmount / records.length : 0;

      return {
        success: true,
        data: {
          category,
          period,
          totalAmount,
          averageAmount,
          transactionCount: records.length,
          records
        }
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new FinanceModel();


