import {
  CheckCircle2,
  MapPin,
 QrCode,
  UserCheck,
} from "lucide-react";

import {
  Card,
  Container,
  SectionTitle,
} from "../../../shared/components/ui";

const steps = [
  {
    id: "01",
    title: "Teacher Creates Session",
    description:
      "Teacher starts a new attendance session for a class with one click.",
    icon: UserCheck,
  },
  {
    id: "02",
    title: "Dynamic QR Generated",
    description:
      "A secure QR code is generated that automatically expires after a short time.",
    icon: QrCode,
  },
  {
    id: "03",
    title: "Student Verification",
    description:
      "Students scan the QR code. GPS verifies they are inside the allowed campus area.",
    icon: MapPin,
  },
  {
    id: "04",
    title: "Attendance Recorded",
    description:
      "Attendance is securely stored in Firebase and immediately appears on the dashboard.",
    icon: CheckCircle2,
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-24 bg-white"
    >
      <Container>

        <SectionTitle
          title="How It Works"
          subtitle="Mark attendance in four simple and secure steps."
        />

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">

          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <Card
                key={step.id}
                className="relative text-center p-8"
              >
                <div className="absolute right-5 top-5 text-4xl font-bold text-gray-100">
                  {step.id}
                </div>

                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <Icon
                    className="text-blue-600"
                    size={32}
                  />
                </div>

                <h3 className="mb-4 text-xl font-semibold">
                  {step.title}
                </h3>

                <p className="text-gray-600 leading-7">
                  {step.description}
                </p>

              </Card>
            );
          })}

        </div>

      </Container>
    </section>
  );
}