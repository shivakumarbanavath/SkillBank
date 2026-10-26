"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";

export async function getCourses(filters?: {
  categoryId?: string;
  level?: string;
  search?: string;
}) {
  try {
    const where: any = { isPublished: true };

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }
    if (filters?.level) {
      where.level = filters.level;
    }
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { description: { contains: filters.search } },
        { shortDesc: { contains: filters.search } },
      ];
    }

    const courses = await prisma.course.findMany({
      where,
      include: {
        instructor: { include: { profile: true } },
        category: true,
      },
      orderBy: [{ rating: "desc" }, { enrollmentCount: "desc" }],
    });

    return { success: true, courses };
  } catch (error) {
    console.error("getCourses error:", error);
    return { success: false, error: "Failed to load courses", courses: [] };
  }
}

export async function getCourseBySlug(slug: string) {
  try {
    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        instructor: { include: { profile: true } },
        category: true,
        _count: { select: { enrollments: true } },
      },
    });

    return course;
  } catch (error) {
    console.error("getCourseBySlug error:", error);
    return null;
  }
}

export async function getCourseEnrollment(courseId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  try {
    return await prisma.enrollment.findUnique({
      where: {
        courseId_userId: {
          courseId,
          userId: session.user.id,
        },
      },
      include: {
        course: {
          include: {
            certificates: {
              where: { userId: session.user.id },
            },
          },
        },
      },
    });
  } catch {
    return null;
  }
}

export async function enrollInCourse(courseId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const userId = session.user.id;

  try {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return { success: false, error: "Course not found" };

    const existing = await prisma.enrollment.findUnique({
      where: {
        courseId_userId: {
          courseId,
          userId,
        },
      },
    });

    if (existing) {
      return { success: false, error: "You are already enrolled in this course" };
    }

    const orderId = `order_${nanoid(10)}`;
    const paymentId = `pay_${nanoid(12)}`;

    await prisma.$transaction(async (tx) => {
      // Record payment
      const payment = await tx.payment.create({
        data: {
          userId,
          type: "COURSE",
          targetId: courseId,
          amountInr: course.priceInr * 100, // paise
          currency: "INR",
          status: "COMPLETED",
          provider: "MOCK_GATEWAY",
          externalOrderId: orderId,
          externalId: paymentId,
          completedAt: new Date(),
        },
      });

      // Create enrollment
      await tx.enrollment.create({
        data: {
          courseId,
          userId,
          status: "ACTIVE",
          paidAmount: course.priceInr,
          paymentId: payment.id,
          progress: 0,
        },
      });

      // Increment course enrollment count
      await tx.course.update({
        where: { id: courseId },
        data: { enrollmentCount: { increment: 1 } },
      });

      // Notify user
      await tx.notification.create({
        data: {
          userId,
          type: "COURSE_ENROLLED",
          title: "Course Enrollment Confirmed!",
          body: `You have successfully enrolled in "${course.title}". Start learning today!`,
          link: `/courses/${course.slug}`,
        },
      });
    });

    revalidatePath(`/courses/${course.slug}`);
    revalidatePath("/courses");
    return { success: true };
  } catch (error) {
    console.error("enrollInCourse error:", error);
    return { success: false, error: "Failed to enroll in course" };
  }
}

export async function updateCourseProgress(courseId: string, progress: number) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const userId = session.user.id;

  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        courseId_userId: {
          courseId,
          userId,
        },
      },
      include: { course: true },
    });

    if (!enrollment) return { success: false, error: "Enrollment not found" };

    const newProgress = Math.min(100, Math.max(0, progress));
    const isCompleted = newProgress === 100;

    await prisma.$transaction(async (tx) => {
      await tx.enrollment.update({
        where: { id: enrollment.id },
        data: {
          progress: newProgress,
          status: isCompleted ? "COMPLETED" : "ACTIVE",
          completedAt: isCompleted ? new Date() : enrollment.completedAt,
        },
      });

      // If reached 100% and course has certificate, issue certificate
      if (isCompleted && enrollment.course.hasCertificate) {
        const certExists = await tx.certificate.findUnique({
          where: {
            userId_courseId: {
              userId,
              courseId,
            },
          },
        });

        if (!certExists) {
          const certificateNo = `SKB-${nanoid(8).toUpperCase()}`;
          await tx.certificate.create({
            data: {
              userId,
              courseId,
              enrollmentId: enrollment.id,
              certificateNo,
            },
          });

          await tx.notification.create({
            data: {
              userId,
              type: "COURSE_ENROLLED",
              title: "Certificate Issued! 🎓",
              body: `Congratulations on completing "${enrollment.course.title}". Your certificate is ready!`,
              link: `/certificates/${certificateNo}`,
            },
          });
        }
      }
    });

    revalidatePath(`/courses/${enrollment.course.slug}`);
    return { success: true, progress: newProgress };
  } catch (error) {
    console.error("updateCourseProgress error:", error);
    return { success: false, error: "Failed to update progress" };
  }
}
