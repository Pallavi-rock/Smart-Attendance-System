import { useState } from "react";
import { ChevronDown } from "lucide-react";

import {
  Container,
  SectionTitle,
} from "../../../shared/components/ui";

const faqs = [
  {
    question: "How does attendance work?",
    answer:
      "Teachers create an attendance session. Students scan the QR code, GPS verifies their location, and attendance is stored securely in Firebase.",
  },
  {
    question: "Can students mark proxy attendance?",
    answer:
      "No. Dynamic QR codes expire quickly and GPS verification ensures students are physically present.",
  },
  {
    question: "Where is attendance data stored?",
    answer:
      "Attendance records are stored securely in Firebase Firestore with role-based access.",
  },
  {
    question: "Can teachers download reports?",
    answer:
      "Yes. Teachers can generate attendance reports for classes and export them later.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-white">
      <Container>

        <SectionTitle
          title="Frequently Asked Questions"
          subtitle="Everything you need to know about Smart Attendance."
        />

        <div className="mx-auto max-w-3xl space-y-4">

          {faqs.map((faq, index) => (

            <div
              key={faq.question}
              className="rounded-xl border"
            >

              <button
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
                className="flex w-full items-center justify-between p-5 text-left"
              >

                <span className="font-semibold">
                  {faq.question}
                </span>

                <ChevronDown
                  className={`transition ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />

              </button>

              {openIndex === index && (

                <div className="border-t px-5 py-4 text-gray-600">
                  {faq.answer}
                </div>

              )}

            </div>

          ))}

        </div>

      </Container>
    </section>
  );
}