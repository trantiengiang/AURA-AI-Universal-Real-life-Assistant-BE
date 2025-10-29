// Demo data for testing AURA API
// Run this after setting up the database

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createDemoData() {
  try {
    console.log('🚀 Creating demo data...');

    // Create demo user
    const hashedPassword = await bcrypt.hash('demo123', 12);
    
    const user = await prisma.user.upsert({
      where: { email: 'demo@aura.com' },
      update: {},
      create: {
        name: 'Demo User',
        email: 'demo@aura.com',
        password: hashedPassword,
        age: 25,
        gender: 'other'
      }
    });

    console.log('✅ Demo user created:', user.email);

    // Create demo health records
    const healthRecords = [
      {
        userId: user.id,
        date: new Date('2024-01-15'),
        weight: 70,
        height: 175,
        calories: 2200,
        sleep: 8,
        exercise: 'Running 30 minutes',
        advice: 'Great job maintaining your fitness routine!'
      },
      {
        userId: user.id,
        date: new Date('2024-01-16'),
        weight: 69.5,
        height: 175,
        calories: 1900,
        sleep: 7,
        exercise: 'Yoga 45 minutes',
        advice: 'Consider increasing your calorie intake slightly.'
      }
    ];

    for (const record of healthRecords) {
      await prisma.healthRecord.create({ data: record });
    }

    console.log('✅ Demo health records created');

    // Create demo finance records
    const financeRecords = [
      {
        userId: user.id,
        category: 'Food',
        amount: 45.50,
        type: 'expense',
        note: 'Lunch at restaurant',
        date: new Date('2024-01-15')
      },
      {
        userId: user.id,
        category: 'Transportation',
        amount: 15.00,
        type: 'expense',
        note: 'Uber ride',
        date: new Date('2024-01-15')
      },
      {
        userId: user.id,
        category: 'Salary',
        amount: 3000.00,
        type: 'income',
        note: 'Monthly salary',
        date: new Date('2024-01-01')
      },
      {
        userId: user.id,
        category: 'Entertainment',
        amount: 25.00,
        type: 'expense',
        note: 'Movie tickets',
        date: new Date('2024-01-14')
      }
    ];

    for (const record of financeRecords) {
      await prisma.financeRecord.create({ data: record });
    }

    console.log('✅ Demo finance records created');

    // Create demo notes
    const notes = [
      {
        userId: user.id,
        title: 'Meeting Notes',
        content: 'Discussed project timeline and deliverables. Need to finish API documentation by Friday.',
        tags: ['work', 'meeting', 'project']
      },
      {
        userId: user.id,
        title: 'Grocery List',
        content: 'Milk, bread, eggs, vegetables, fruits, chicken breast',
        tags: ['shopping', 'food']
      },
      {
        userId: user.id,
        title: 'Workout Plan',
        content: 'Monday: Cardio, Tuesday: Strength training, Wednesday: Rest, Thursday: Yoga, Friday: HIIT',
        tags: ['fitness', 'health', 'planning']
      }
    ];

    for (const note of notes) {
      await prisma.note.create({ data: note });
    }

    console.log('✅ Demo notes created');

    // Create demo translations
    const translations = [
      {
        userId: user.id,
        inputText: 'Hello, how are you?',
        outputText: 'Xin chào, bạn khỏe không?',
        fromLang: 'en',
        toLang: 'vi'
      },
      {
        userId: user.id,
        inputText: 'Thank you very much',
        outputText: 'Cảm ơn bạn rất nhiều',
        fromLang: 'en',
        toLang: 'vi'
      }
    ];

    for (const translation of translations) {
      await prisma.translation.create({ data: translation });
    }

    console.log('✅ Demo translations created');

    console.log('\n🎉 Demo data created successfully!');
    console.log('\nDemo user credentials:');
    console.log('Email: demo@aura.com');
    console.log('Password: demo123');
    console.log('\nYou can now test the API with this demo account!');

  } catch (error) {
    console.error('❌ Error creating demo data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  createDemoData();
}

module.exports = createDemoData;


