const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');

const prisma = new PrismaClient();

class UserModel {
  async createUser(userData) {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      const user = await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          age: userData.age,
          gender: userData.gender
        },
        select: {
          id: true,
          name: true,
          email: true,
          age: true,
          gender: true,
          avatar: true,
          createdAt: true
        }
      });

      // Generate JWT token
      const token = generateToken({ userId: user.id, email: user.email });

      return {
        success: true,
        data: {
          user,
          token
        }
      };
    } catch (error) {
      if (error.code === 'P2002') {
        return {
          success: false,
          error: 'Email already exists'
        };
      }
      throw error;
    }
  }

  async loginUser(email, password) {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return {
          success: false,
          error: 'Invalid credentials'
        };
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return {
          success: false,
          error: 'Invalid credentials'
        };
      }

      // Generate JWT token
      const token = generateToken({ userId: user.id, email: user.email });

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            age: user.age,
            gender: user.gender,
            avatar: user.avatar,
            createdAt: user.createdAt
          },
          token
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          age: true,
          gender: true,
          avatar: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      return {
        success: true,
        data: user
      };
    } catch (error) {
      throw error;
    }
  }

  async updateUser(userId, updateData) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          name: updateData.name,
          age: updateData.age,
          gender: updateData.gender,
          avatar: updateData.avatar
        },
        select: {
          id: true,
          name: true,
          email: true,
          age: true,
          gender: true,
          avatar: true,
          updatedAt: true
        }
      });

      return {
        success: true,
        data: user
      };
    } catch (error) {
      if (error.code === 'P2025') {
        return {
          success: false,
          error: 'User not found'
        };
      }
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      await prisma.user.delete({
        where: { id: userId }
      });

      return {
        success: true,
        message: 'User deleted successfully'
      };
    } catch (error) {
      if (error.code === 'P2025') {
        return {
          success: false,
          error: 'User not found'
        };
      }
      throw error;
    }
  }

  async getUserStats(userId) {
    try {
      const [
        healthRecordsCount,
        financeRecordsCount,
        notesCount,
        translationsCount
      ] = await Promise.all([
        prisma.healthRecord.count({ where: { userId } }),
        prisma.financeRecord.count({ where: { userId } }),
        prisma.note.count({ where: { userId } }),
        prisma.translation.count({ where: { userId } })
      ]);

      return {
        success: true,
        data: {
          healthRecords: healthRecordsCount,
          financeRecords: financeRecordsCount,
          notes: notesCount,
          translations: translationsCount
        }
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserModel();




