import { ArrowRight, PlayCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  Button,
  Container,
} from "../../../shared/components/ui";

export default function CTA() {
  const navigate = useNavigate();
  return (
    <section className="py-24">
      <Container>

        <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-8 py-20 text-center text-white shadow-2xl">

          <h2 className="text-4xl font-bold lg:text-5xl">
            Ready to Transform Attendance?
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100">
            Join schools, colleges, and universities using our AI-powered
            attendance system to save time, improve accuracy, and eliminate
            proxy attendance.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-5">

            <Button
              size="lg"
              className="bg-white text-blue-700 hover:bg-gray-100"
              onClick={() => navigate("/register")}
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-blue-700"
            >
              <PlayCircle className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>

          </div>

        </div>

      </Container>
    </section>
  );
}