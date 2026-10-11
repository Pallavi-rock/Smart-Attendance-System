import {
  GraduationCap,
  Users,
  Building2,
  BadgeCheck,
} from "lucide-react";

import {
  Card,
  Container,
  SectionTitle,
} from "../../../shared/components/ui";

const stats = [
  {
    title: "10,000+",
    subtitle: "Students",
    icon: GraduationCap,
  },
  {
    title: "500+",
    subtitle: "Teachers",
    icon: Users,
  },
  {
    title: "100+",
    subtitle: "Institutions",
    icon: Building2,
  },
  {
    title: "99.9%",
    subtitle: "Attendance Accuracy",
    icon: BadgeCheck,
  },
];

export default function Statistics() {
  return (
    <section className="bg-blue-50 py-24">
      <Container>

        <SectionTitle
          title="Trusted by Educational Institutions"
          subtitle="Designed for modern schools, colleges, and universities."
        />

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <Card
                key={item.title}
                className="text-center"
              >
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <Icon
                    size={34}
                    className="text-blue-600"
                  />
                </div>

                <h3 className="text-4xl font-bold text-blue-600">
                  {item.title}
                </h3>

                <p className="mt-3 text-gray-600">
                  {item.subtitle}
                </p>
              </Card>
            );
          })}
        </div>

      </Container>
    </section>
  );
}