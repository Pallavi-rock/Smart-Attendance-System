import {
  BarChart3,
  MapPin,
  QrCode,
  ShieldCheck,
  Cloud,
  Clock,
} from "lucide-react";

import {
  Card,
  Container,
  SectionTitle,
} from "../../../shared/components/ui";

const features = [
  {
    title: "Dynamic QR Code",
    description:
      "Generate secure QR codes that automatically expire after each attendance session.",
    icon: QrCode,
  },
  {
    title: "GPS Verification",
    description:
      "Attendance is allowed only when students are within the allowed campus radius.",
    icon: MapPin,
  },
  {
    title: "AI Fraud Detection",
    description:
      "Prevent proxy attendance using intelligent validation and activity checks.",
    icon: ShieldCheck,
  },
  {
    title: "Real-Time Dashboard",
    description:
      "Teachers can monitor attendance live with instant updates.",
    icon: BarChart3,
  },
  {
    title: "Cloud Storage",
    description:
      "Attendance data is securely stored in Firebase Cloud Firestore.",
    icon: Cloud,
  },
  {
    title: "Instant Reports",
    description:
      "Generate attendance summaries and reports in seconds.",
    icon: Clock,
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="bg-gray-50 py-24"
    >
      <Container>

        <SectionTitle
          title="Powerful Features"
          subtitle="Everything you need for a secure and intelligent attendance management system."
        />

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card
                key={feature.title}
                className="p-6 hover:-translate-y-2 transition-transform"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">

                  <Icon
                    size={28}
                    className="text-blue-600"
                  />

                </div>

                <h3 className="mb-3 text-xl font-semibold">
                  {feature.title}
                </h3>

                <p className="text-gray-600 leading-7">
                  {feature.description}
                </p>

              </Card>
            );
          })}

        </div>

      </Container>
    </section>
  );
}