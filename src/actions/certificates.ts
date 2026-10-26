"use server";

import { prisma } from "@/lib/db";

export async function getCertificateByNo(certificateNo: string) {
  try {
    const cert = await prisma.certificate.findUnique({
      where: { certificateNo },
      include: {
        user: { include: { profile: true } },
        course: {
          include: {
            instructor: { include: { profile: true } },
            category: true,
          },
        },
      },
    });

    return cert;
  } catch (error) {
    console.error("getCertificateByNo error:", error);
    return null;
  }
}
