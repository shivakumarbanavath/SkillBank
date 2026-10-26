import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding SkillBank database...");

  // Clean up existing data
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.review.deleteMany();
  await prisma.creditTransaction.deleteMany();
  await prisma.creditReservation.deleteMany();
  await prisma.creditAccount.deleteMany();
  await prisma.skillSession.deleteMany();
  await prisma.learningInterest.deleteMany();
  await prisma.teachingSkill.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.skillCategory.deleteMany();

  // ============================================================
  // SKILL CATEGORIES
  // ============================================================
  const categories = await Promise.all([
    prisma.skillCategory.create({ data: { name: "Programming", slug: "programming", icon: "Code", sortOrder: 1 } }),
    prisma.skillCategory.create({ data: { name: "Web Development", slug: "web-development", icon: "Globe", sortOrder: 2 } }),
    prisma.skillCategory.create({ data: { name: "AI & Machine Learning", slug: "ai-ml", icon: "Brain", sortOrder: 3 } }),
    prisma.skillCategory.create({ data: { name: "Electronics", slug: "electronics", icon: "Cpu", sortOrder: 4 } }),
    prisma.skillCategory.create({ data: { name: "Mathematics", slug: "mathematics", icon: "Calculator", sortOrder: 5 } }),
    prisma.skillCategory.create({ data: { name: "Music", slug: "music", icon: "Music", sortOrder: 6 } }),
    prisma.skillCategory.create({ data: { name: "Design", slug: "design", icon: "Palette", sortOrder: 7 } }),
    prisma.skillCategory.create({ data: { name: "Photography", slug: "photography", icon: "Camera", sortOrder: 8 } }),
    prisma.skillCategory.create({ data: { name: "Languages", slug: "languages", icon: "Languages", sortOrder: 9 } }),
    prisma.skillCategory.create({ data: { name: "Communication", slug: "communication", icon: "MessageSquare", sortOrder: 10 } }),
    prisma.skillCategory.create({ data: { name: "Career Development", slug: "career", icon: "Briefcase", sortOrder: 11 } }),
    prisma.skillCategory.create({ data: { name: "Robotics", slug: "robotics", icon: "Bot", sortOrder: 12 } }),
    prisma.skillCategory.create({ data: { name: "Fitness", slug: "fitness", icon: "Dumbbell", sortOrder: 13 } }),
    prisma.skillCategory.create({ data: { name: "Entrepreneurship", slug: "entrepreneurship", icon: "Rocket", sortOrder: 14 } }),
    prisma.skillCategory.create({ data: { name: "Other", slug: "other", icon: "Star", sortOrder: 15 } }),
  ]);

  const [programming, webDev, aiMl, electronics, mathematics, music, design, photography, languages, communication, career, robotics, fitness, entrepreneurship, other] = categories;

  console.log("✅ Categories created");

  // ============================================================
  // DEMO USERS
  // ============================================================
  const password = await bcrypt.hash("Password123!", 12);

  const usersData = [
    {
      name: "Arjun Menon",
      email: "arjun@demo.skillbank.app",
      username: "arjun_menon",
      displayName: "Arjun Menon",
      bio: "Final year CS student at NIT Calicut. Passionate about Python and machine learning. Loves to teach what I know!",
      campus: "NIT Calicut",
      institution: "NIT Calicut",
      city: "Calicut",
      languages: ["English", "Malayalam", "Hindi"],
      welcomeBalance: 20,
    },
    {
      name: "Priya Nair",
      email: "priya@demo.skillbank.app",
      username: "priya_nair",
      displayName: "Priya Nair",
      bio: "Third year ECE student. Arduino and electronics enthusiast. Also play guitar! Ready to exchange skills.",
      campus: "NIT Calicut",
      institution: "NIT Calicut",
      city: "Calicut",
      languages: ["English", "Malayalam"],
      welcomeBalance: 20,
    },
    {
      name: "Rahul Kumar",
      email: "rahul@demo.skillbank.app",
      username: "rahul_kumar",
      displayName: "Rahul Kumar",
      bio: "Design student who loves creating beautiful interfaces. Can teach UI/UX and want to learn programming.",
      campus: "NIT Calicut",
      institution: "NIT Calicut",
      city: "Calicut",
      languages: ["English", "Hindi"],
      welcomeBalance: 35,
    },
    {
      name: "Sneha Sharma",
      email: "sneha@demo.skillbank.app",
      username: "sneha_sharma",
      displayName: "Sneha Sharma",
      bio: "Professional photographer and visual storyteller. Teaching photography composition and post-processing.",
      campus: "NIT Calicut",
      institution: "NIT Calicut",
      city: "Calicut",
      languages: ["English", "Hindi"],
      welcomeBalance: 25,
    },
    {
      name: "Dev Krishnan",
      email: "dev@demo.skillbank.app",
      username: "dev_krishnan",
      displayName: "Dev Krishnan",
      bio: "Career coach and communication trainer. Helping students ace interviews and public speaking.",
      campus: "NIT Calicut",
      institution: "NIT Calicut",
      city: "Calicut",
      languages: ["English", "Malayalam"],
      welcomeBalance: 50,
    },
    {
      name: "Admin User",
      email: "admin@skillbank.app",
      username: "admin",
      displayName: "SkillBank Admin",
      bio: "Platform administrator",
      campus: "SkillBank HQ",
      institution: "SkillBank",
      city: "Calicut",
      languages: ["English"],
      welcomeBalance: 0,
      isAdmin: true,
    },
  ];

  const createdUsers: Record<string, { id: string; creditAccountId: string }> = {};

  for (const userData of usersData) {
    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        role: userData.isAdmin ? "ADMIN" : "USER",
      },
    });

    await prisma.account.create({
      data: {
        userId: user.id,
        type: "credentials",
        provider: "credentials",
        providerAccountId: user.id,
        password,
      },
    });

    await prisma.profile.create({
      data: {
        userId: user.id,
        username: userData.username,
        displayName: userData.displayName,
        bio: userData.bio,
        campus: userData.campus,
        institution: userData.institution,
        city: userData.city,
        languages: JSON.stringify(userData.languages),
        preferredFormat: "EITHER",
        onboardingStep: 5,
        onboardingDone: true,
      },
    });

    const creditAccount = await prisma.creditAccount.create({
      data: {
        userId: user.id,
        balance: userData.welcomeBalance,
        totalEarned: userData.welcomeBalance,
      },
    });

    if (userData.welcomeBalance > 0) {
      await prisma.creditTransaction.create({
        data: {
          userId: user.id,
          accountId: creditAccount.id,
          type: "WELCOME_BONUS",
          amount: userData.welcomeBalance,
          balanceAfter: userData.welcomeBalance,
          description: "Welcome bonus credits",
          idempotencyKey: `welcome:${user.id}`,
        },
      });
    }

    createdUsers[userData.username] = {
      id: user.id,
      creditAccountId: creditAccount.id,
    };
  }

  console.log("✅ Users created");

  // ============================================================
  // AVAILABILITY
  // ============================================================
  // Arjun: weekday evenings
  for (const day of [1, 2, 3, 4, 5]) {
    await prisma.availability.create({
      data: {
        userId: createdUsers.arjun_menon.id,
        dayOfWeek: day,
        startTime: "18:00",
        endTime: "21:00",
      },
    });
  }

  // Priya: weekends
  for (const day of [0, 6]) {
    await prisma.availability.create({
      data: {
        userId: createdUsers.priya_nair.id,
        dayOfWeek: day,
        startTime: "10:00",
        endTime: "16:00",
      },
    });
  }

  // ============================================================
  // TEACHING SKILLS
  // ============================================================
  const arjunPythonSkill = await prisma.teachingSkill.create({
    data: {
      userId: createdUsers.arjun_menon.id,
      categoryId: programming.id,
      skillName: "Python Programming",
      description: "Learn Python from basics to intermediate level. I cover data types, control flow, functions, OOP, and practical projects. Perfect for beginners!",
      proficiency: "ADVANCED",
      format: "EITHER",
      duration: 60,
      tags: JSON.stringify(["python", "programming", "beginner-friendly"]),
      isActive: true,
    },
  });

  const arjunMLSkill = await prisma.teachingSkill.create({
    data: {
      userId: createdUsers.arjun_menon.id,
      categoryId: aiMl.id,
      skillName: "Machine Learning Basics",
      description: "Introduction to ML concepts using scikit-learn. Covers regression, classification, and basic neural networks.",
      proficiency: "INTERMEDIATE",
      format: "ONLINE",
      duration: 90,
      tags: JSON.stringify(["machine-learning", "python", "scikit-learn"]),
      isActive: true,
    },
  });

  const priyaArduinoSkill = await prisma.teachingSkill.create({
    data: {
      userId: createdUsers.priya_nair.id,
      categoryId: electronics.id,
      skillName: "Arduino & Embedded Systems",
      description: "Hands-on Arduino programming. Learn to control LEDs, sensors, motors, and build real projects from scratch.",
      proficiency: "ADVANCED",
      format: "IN_PERSON",
      duration: 90,
      prerequisites: "Basic electronics knowledge helpful",
      tags: JSON.stringify(["arduino", "electronics", "embedded", "hardware"]),
      isActive: true,
    },
  });

  const priyaGuitarSkill = await prisma.teachingSkill.create({
    data: {
      userId: createdUsers.priya_nair.id,
      categoryId: music.id,
      skillName: "Acoustic Guitar for Beginners",
      description: "Learn the basics of acoustic guitar - chords, strumming patterns, and your first songs. Patient and encouraging teaching style.",
      proficiency: "INTERMEDIATE",
      format: "IN_PERSON",
      duration: 45,
      tags: JSON.stringify(["guitar", "music", "beginner"]),
      isActive: true,
    },
  });

  const rahulUISkill = await prisma.teachingSkill.create({
    data: {
      userId: createdUsers.rahul_kumar.id,
      categoryId: design.id,
      skillName: "UI/UX Design Fundamentals",
      description: "Design intuitive and beautiful interfaces using Figma. Covers design principles, wireframing, prototyping, and user research basics.",
      proficiency: "ADVANCED",
      format: "ONLINE",
      duration: 60,
      tags: JSON.stringify(["figma", "ui-ux", "design", "prototyping"]),
      isActive: true,
    },
  });

  const snehaPhotoSkill = await prisma.teachingSkill.create({
    data: {
      userId: createdUsers.sneha_sharma.id,
      categoryId: photography.id,
      skillName: "Photography Composition",
      description: "Master the art of photography composition, lighting, and post-processing. Suitable for DSLR and smartphone photographers.",
      proficiency: "EXPERT",
      format: "IN_PERSON",
      duration: 120,
      tags: JSON.stringify(["photography", "composition", "lightroom"]),
      isActive: true,
    },
  });

  const devPublicSkill = await prisma.teachingSkill.create({
    data: {
      userId: createdUsers.dev_krishnan.id,
      categoryId: communication.id,
      skillName: "Public Speaking & Presentation",
      description: "Overcome stage fright and become a confident speaker. Covers structure, delivery, body language, and handling Q&A sessions.",
      proficiency: "EXPERT",
      format: "EITHER",
      duration: 60,
      tags: JSON.stringify(["public-speaking", "presentation", "communication"]),
      isActive: true,
    },
  });

  const devInterviewSkill = await prisma.teachingSkill.create({
    data: {
      userId: createdUsers.dev_krishnan.id,
      categoryId: career.id,
      skillName: "Technical Interview Prep",
      description: "Ace your tech interviews with structured preparation. DSA, system design, behavioral questions, and mock interviews.",
      proficiency: "EXPERT",
      format: "ONLINE",
      duration: 90,
      tags: JSON.stringify(["interview", "career", "placement", "DSA"]),
      isActive: true,
    },
  });

  console.log("✅ Teaching skills created");

  // ============================================================
  // LEARNING INTERESTS
  // ============================================================
  // Arjun wants to learn Arduino (mutual with Priya)
  await prisma.learningInterest.create({
    data: {
      userId: createdUsers.arjun_menon.id,
      categoryId: electronics.id,
      skillName: "Arduino & Embedded Systems",
      priority: 3,
    },
  });

  // Arjun wants to learn UI/UX
  await prisma.learningInterest.create({
    data: {
      userId: createdUsers.arjun_menon.id,
      categoryId: design.id,
      skillName: "UI/UX Design Fundamentals",
      priority: 2,
    },
  });

  // Priya wants to learn Python (mutual with Arjun)
  await prisma.learningInterest.create({
    data: {
      userId: createdUsers.priya_nair.id,
      categoryId: programming.id,
      skillName: "Python Programming",
      priority: 3,
    },
  });

  // Rahul wants to learn Python
  await prisma.learningInterest.create({
    data: {
      userId: createdUsers.rahul_kumar.id,
      categoryId: programming.id,
      skillName: "Python Programming",
      priority: 3,
    },
  });

  // Rahul wants to learn guitar
  await prisma.learningInterest.create({
    data: {
      userId: createdUsers.rahul_kumar.id,
      categoryId: music.id,
      skillName: "Acoustic Guitar for Beginners",
      priority: 2,
    },
  });

  // Sneha wants to learn public speaking
  await prisma.learningInterest.create({
    data: {
      userId: createdUsers.sneha_sharma.id,
      categoryId: communication.id,
      skillName: "Public Speaking & Presentation",
      priority: 3,
    },
  });

  // Dev wants to learn photography (mutual with Sneha)
  await prisma.learningInterest.create({
    data: {
      userId: createdUsers.dev_krishnan.id,
      categoryId: photography.id,
      skillName: "Photography Composition",
      priority: 2,
    },
  });

  console.log("✅ Learning interests created");

  // ============================================================
  // COMPLETED SESSION WITH REVIEW (for realistic data)
  // ============================================================
  const completedSession = await prisma.skillSession.create({
    data: {
      teacherId: createdUsers.arjun_menon.id,
      learnerId: createdUsers.rahul_kumar.id,
      teachingSkillId: arjunPythonSkill.id,
      title: "Learn Python Programming",
      description: "Rahul wanted to understand Python basics for automating design workflows.",
      scheduledDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      startTime: "18:00",
      durationMinutes: 60,
      format: "ONLINE",
      creditCost: 10,
      status: "COMPLETED",
      completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
    },
  });

  // Deduct credits from learner, award to teacher
  const rahulAccount = await prisma.creditAccount.findUnique({
    where: { userId: createdUsers.rahul_kumar.id },
  });
  const arjunAccount = await prisma.creditAccount.findUnique({
    where: { userId: createdUsers.arjun_menon.id },
  });

  if (rahulAccount && arjunAccount) {
    // Deduct from Rahul
    await prisma.creditAccount.update({
      where: { userId: createdUsers.rahul_kumar.id },
      data: { balance: rahulAccount.balance - 10, totalSpent: 10 },
    });
    await prisma.creditTransaction.create({
      data: {
        userId: createdUsers.rahul_kumar.id,
        accountId: rahulAccount.id,
        type: "SESSION_SPENDING",
        amount: -10,
        balanceAfter: rahulAccount.balance - 10,
        sessionId: completedSession.id,
        description: "Credits spent for Python Programming session",
        idempotencyKey: `spend:${completedSession.id}`,
      },
    });

    // 5-star review = 15 credits for Arjun
    await prisma.review.create({
      data: {
        sessionId: completedSession.id,
        reviewerId: createdUsers.rahul_kumar.id,
        revieweeId: createdUsers.arjun_menon.id,
        rating: 5,
        comment: "Arjun is an amazing teacher! Very patient and explained concepts clearly. I went from zero Python knowledge to writing my own scripts!",
        rewardIssued: true,
        rewardAmount: 15,
      },
    });

    await prisma.creditAccount.update({
      where: { userId: createdUsers.arjun_menon.id },
      data: { balance: arjunAccount.balance + 15, totalEarned: arjunAccount.totalEarned + 15 },
    });
    await prisma.creditTransaction.create({
      data: {
        userId: createdUsers.arjun_menon.id,
        accountId: arjunAccount.id,
        type: "SESSION_EARNING",
        amount: 15,
        balanceAfter: arjunAccount.balance + 15,
        sessionId: completedSession.id,
        description: "Teaching reward for 5-star review (15 credits)",
        idempotencyKey: `reward:${completedSession.id}`,
      },
    });
  }

  // An upcoming accepted session
  await prisma.skillSession.create({
    data: {
      teacherId: createdUsers.priya_nair.id,
      learnerId: createdUsers.arjun_menon.id,
      teachingSkillId: priyaArduinoSkill.id,
      title: "Learn Arduino & Embedded Systems",
      description: "Arjun wants to learn Arduino for his IoT project.",
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      startTime: "10:00",
      durationMinutes: 90,
      format: "IN_PERSON",
      creditCost: 10,
      status: "ACCEPTED",
    },
  });

  // A pending session request
  await prisma.skillSession.create({
    data: {
      teacherId: createdUsers.dev_krishnan.id,
      learnerId: createdUsers.sneha_sharma.id,
      teachingSkillId: devPublicSkill.id,
      title: "Learn Public Speaking",
      description: "Sneha wants to improve her presentation skills for a conference.",
      scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      startTime: "14:00",
      durationMinutes: 60,
      format: "EITHER",
      creditCost: 10,
      status: "REQUESTED",
    },
  });

  console.log("✅ Sessions and reviews created");

  // ============================================================
  // NOTIFICATIONS
  // ============================================================
  await prisma.notification.create({
    data: {
      userId: createdUsers.arjun_menon.id,
      type: "SESSION_ACCEPTED",
      title: "Session Accepted!",
      body: "Priya accepted your Arduino session for this weekend.",
      link: "/sessions",
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: createdUsers.dev_krishnan.id,
      type: "SESSION_REQUEST",
      title: "New Session Request",
      body: "Sneha wants to learn Public Speaking from you.",
      link: "/sessions",
      isRead: false,
    },
  });

  console.log("✅ Notifications created");

  // ============================================================
  // SUMMARY
  // ============================================================
  console.log("\n🎉 Seed completed successfully!");
  console.log("\n📝 Demo Credentials (all passwords: Password123!):");
  console.log("  arjun@demo.skillbank.app  — Python/ML teacher, wants Arduino");
  console.log("  priya@demo.skillbank.app  — Arduino/Guitar teacher, wants Python");
  console.log("  rahul@demo.skillbank.app  — UI/UX teacher, wants Python/Guitar");
  console.log("  sneha@demo.skillbank.app  — Photography teacher, wants public speaking");
  console.log("  dev@demo.skillbank.app    — Communication/Career coach");
  console.log("  admin@skillbank.app       — Admin user");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
