import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Phase 5 Business Modules (Masterclasses, Workshops, Events)...");

  const arjun = await prisma.user.findFirst({ where: { email: "arjun@demo.skillbank.app" } });
  const priya = await prisma.user.findFirst({ where: { email: "priya@demo.skillbank.app" } });
  const rahul = await prisma.user.findFirst({ where: { email: "rahul@demo.skillbank.app" } });
  const dev = await prisma.user.findFirst({ where: { email: "dev@demo.skillbank.app" } });

  if (!arjun || !priya || !rahul || !dev) {
    console.error("Demo users not found. Run base seed first.");
    return;
  }

  const programming = await prisma.skillCategory.findFirst({ where: { slug: "programming" } });
  const design = await prisma.skillCategory.findFirst({ where: { slug: "design" } });
  const electronics = await prisma.skillCategory.findFirst({ where: { slug: "electronics" } });
  const communication = await prisma.skillCategory.findFirst({ where: { slug: "communication" } });

  if (!programming || !design || !electronics || !communication) {
    console.error("Categories not found.");
    return;
  }

  // ============================================================
  // MASTERCLASSES / COURSES
  // ============================================================
  const coursesData = [
    {
      instructorId: arjun.id,
      categoryId: programming.id,
      title: "Full-Stack Next.js 15 & AI Engineering Masterclass",
      slug: "nextjs-15-ai-engineering",
      description: "Master modern full-stack application development from scratch. Build production-ready Next.js 15 apps with React Server Components, Prisma ORM, Server Actions, and OpenAI / Gemini API integrations.",
      shortDesc: "Complete guide to Next.js 15 App Router, TypeScript, SQLite/PostgreSQL, and AI Agents.",
      priceInr: 1499,
      duration: 18,
      level: "INTERMEDIATE",
      learningOutcomes: JSON.stringify([
        "Architect scalable Next.js 15 web applications using App Router",
        "Implement secure authentication with NextAuth / Auth.js",
        "Design robust database schemas with Prisma ORM and migrations",
        "Integrate LLMs, streaming responses, and function calling",
        "Deploy production workloads to Vercel and AWS",
      ]),
      prerequisites: "Basic JavaScript & React familiarity",
      isPublished: true,
      hasCertificate: true,
      enrollmentCount: 42,
      rating: 4.9,
    },
    {
      instructorId: rahul.id,
      categoryId: design.id,
      title: "UI/UX Design Masterclass: Figma to High-Fidelity Prototype",
      slug: "ui-ux-figma-masterclass",
      description: "Learn professional user experience and interface design principles. Deep dive into typography, color harmony, responsive design systems, auto-layout, interactive components, and micro-interactions in Figma.",
      shortDesc: "Transform design ideas into stunning, user-tested Figma prototypes.",
      priceInr: 999,
      duration: 12,
      level: "BEGINNER",
      learningOutcomes: JSON.stringify([
        "Master Figma tools: Auto-layout, variants, components, and variables",
        "Build complete tokenized design systems with dark & light modes",
        "Conduct user research and create user flow diagrams",
        "Design responsive mobile and desktop viewports",
        "Handoff specs seamlessly to front-end engineers",
      ]),
      prerequisites: "No prior design experience required",
      isPublished: true,
      hasCertificate: true,
      enrollmentCount: 68,
      rating: 4.8,
    },
    {
      instructorId: priya.id,
      categoryId: electronics.id,
      title: "Embedded Systems & IoT with ESP32 & Arduino",
      slug: "embedded-systems-iot-esp32",
      description: "Get hands-on experience building connected hardware. Learn circuit fundamentals, sensor interfacing, microcontrollers, WiFi/Bluetooth telemetry, and MQTT dashboards with ESP32 and Arduino.",
      shortDesc: "From circuit breadboards to cloud-connected IoT devices.",
      priceInr: 1299,
      duration: 15,
      level: "INTERMEDIATE",
      learningOutcomes: JSON.stringify([
        "Understand GPIO, PWM, I2C, SPI, and UART communication protocols",
        "Interface temperature, ultrasonic, and accelerometer sensors",
        "Write robust embedded C++ firmware for ESP32",
        "Stream IoT telemetry over MQTT to cloud dashboards",
        "Build a complete smart home monitoring project",
      ]),
      prerequisites: "Basic C/C++ programming and interest in hardware",
      isPublished: true,
      hasCertificate: true,
      enrollmentCount: 35,
      rating: 4.9,
    },
    {
      instructorId: dev.id,
      categoryId: communication.id,
      title: "Executive Communication & Public Speaking for Tech Leaders",
      slug: "executive-communication-public-speaking",
      description: "Elevate your verbal influence and presentation authority. Learn storytelling frameworks, stage presence, conference talk pitching, handling Q&A under pressure, and executive stakeholder communication.",
      shortDesc: "Speak with clarity, confidence, and charisma in any room.",
      priceInr: 799,
      duration: 8,
      level: "ALL_LEVELS",
      learningOutcomes: JSON.stringify([
        "Overcome public speaking anxiety with proven breath and vocal control",
        "Structure engaging presentations using the Pyramid Principle",
        "Deliver impactful tech talks, project demos, and elevator pitches",
        "Master body language, eye contact, and stage pacing",
        "Negotiate and articulate complex technical ideas to non-technical executives",
      ]),
      prerequisites: "Open to students, founders, and professionals",
      isPublished: true,
      hasCertificate: true,
      enrollmentCount: 51,
      rating: 4.7,
    },
  ];

  for (const c of coursesData) {
    await prisma.course.upsert({
      where: { slug: c.slug },
      create: c,
      update: c,
    });
  }
  console.log("✅ Masterclasses seeded");

  // ============================================================
  // GROUP WORKSHOPS
  // ============================================================
  const workshopsData = [
    {
      organizerId: priya.id,
      title: "Hands-On Soldering & PCB Design Weekend Bootcamp",
      description: "Join us for an intensive in-person workshop where you will design your first printed circuit board in KiCAD and solder surface-mount components by hand. Kit provided on campus!",
      format: "IN_PERSON",
      scheduledAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // in 6 days
      durationMinutes: 180,
      capacity: 25,
      registeredCount: 18,
      priceInr: 499,
      venue: "Hardware Innovation Lab, Central Campus, NIT Calicut",
      status: "OPEN",
    },
    {
      organizerId: rahul.id,
      title: "Live Portfolio Review & Product Design Critique",
      description: "Bring your design portfolio, Behance link, or ongoing side project. Get actionable, line-by-line feedback from senior product designers and learn how to ace UI/UX job interviews.",
      format: "ONLINE",
      scheduledAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // in 10 days
      durationMinutes: 120,
      capacity: 30,
      registeredCount: 22,
      priceInr: 299,
      meetingLink: "https://meet.google.com/sbk-uxpr-rev",
      status: "OPEN",
    },
    {
      organizerId: arjun.id,
      title: "AI Agents & Autonomous Workflows Sprint",
      description: "Build your own multi-agent system using LangChain and Next.js in a collaborative live-coding group sprint. Ideal for hackathon participants and builders.",
      format: "ONLINE",
      scheduledAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      durationMinutes: 150,
      capacity: 40,
      registeredCount: 31,
      priceInr: 399,
      meetingLink: "https://meet.google.com/sbk-ai-sprint",
      status: "OPEN",
    },
  ];

  for (const w of workshopsData) {
    const existing = await prisma.workshop.findFirst({ where: { title: w.title } });
    if (!existing) {
      await prisma.workshop.create({ data: w });
    }
  }
  console.log("✅ Group Workshops seeded");

  // ============================================================
  // INSTITUTIONAL EVENTS
  // ============================================================
  const eventsData = [
    {
      organizerId: arjun.id,
      title: "SkillBank Campus Hackathon 2026: Hyperlocal Innovations",
      description: "A 36-hour flagship campus hackathon bringing together students, developers, and designers to solve real-world community problems. Cash prizes worth ₹50,000, mentor sessions, and food sponsored by corporate partners.",
      type: "HACKATHON",
      format: "HYBRID",
      startsAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      endsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      venue: "Student Activity Centre & Discord",
      meetingLink: "https://discord.gg/skillbank-hack",
      capacity: 200,
      registeredCount: 142,
      priceInr: 0,
      campus: "NIT Calicut",
      institution: "NIT Calicut",
      isFeatured: true,
      status: "UPCOMING",
    },
    {
      organizerId: dev.id,
      title: "Industry Tech Showcase: Cloud & Generative AI in Enterprise",
      description: "Learn how global technology companies deploy enterprise generative AI at scale. Keynotes by engineering directors, followed by a networking mixer and resume drop booth.",
      type: "CORPORATE",
      format: "ONLINE",
      startsAt: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
      endsAt: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      meetingLink: "https://meet.google.com/sbk-tech-summit",
      capacity: 300,
      registeredCount: 185,
      priceInr: 0,
      campus: "South India Campus Network",
      institution: "Google Developer Groups Collaboration",
      isFeatured: true,
      status: "UPCOMING",
    },
    {
      organizerId: priya.id,
      title: "SkillSwap Fest 2026: Annual Campus Skills Expo",
      description: "An open community fair where creators, coders, musicians, and artists set up live demonstration booths. Exchange 15-minute speed-skills, earn welcome credits, and connect with peers.",
      type: "SHOWCASE",
      format: "IN_PERSON",
      startsAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      endsAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
      venue: "Central Amphitheatre & Lawn, NIT Calicut",
      capacity: 500,
      registeredCount: 230,
      priceInr: 0,
      campus: "NIT Calicut",
      institution: "NIT Calicut",
      isFeatured: false,
      status: "UPCOMING",
    },
  ];

  for (const e of eventsData) {
    const existing = await prisma.event.findFirst({ where: { title: e.title } });
    if (!existing) {
      await prisma.event.create({ data: e });
    }
  }
  console.log("✅ Institutional Events seeded");

  // Also create a sample certificate for Arjun in Rahul's UI/UX course
  const figmaCourse = await prisma.course.findFirst({ where: { slug: "ui-ux-figma-masterclass" } });
  if (figmaCourse) {
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { courseId_userId: { courseId: figmaCourse.id, userId: arjun.id } },
    });
    const enrollment = existingEnrollment || await prisma.enrollment.create({
      data: {
        courseId: figmaCourse.id,
        userId: arjun.id,
        status: "COMPLETED",
        paidAmount: 999,
        progress: 100,
        completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    });

    const certNo = "SKB-CERT-2026-ARJUN";
    const existingCert = await prisma.certificate.findFirst({ where: { certificateNo: certNo } });
    if (!existingCert) {
      await prisma.certificate.create({
        data: {
          userId: arjun.id,
          courseId: figmaCourse.id,
          enrollmentId: enrollment.id,
          certificateNo: certNo,
          issuedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
      });
      console.log("✅ Sample Certificate seeded for Arjun");
    }
  }

  console.log("\n🎉 Phase 5 Business Modules seeded successfully!");
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
