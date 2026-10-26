import { notFound } from "next/navigation";
import { getCertificateByNo } from "@/actions/certificates";
import { CertificateView } from "@/components/certificates/certificate-view";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const cert = await getCertificateByNo(params.id);
  if (!cert) return { title: "Certificate Not Found" };
  const studentName = cert.user.profile?.displayName || cert.user.name || "Student";
  return {
    title: `Certificate: ${cert.course.title} — ${studentName}`,
    description: `Verified completion certificate ${cert.certificateNo} issued by SkillBank.`,
  };
}

export default async function CertificatePage({
  params,
}: {
  params: { id: string };
}) {
  const cert = await getCertificateByNo(params.id);
  if (!cert) notFound();

  return <CertificateView cert={cert as any} />;
}
