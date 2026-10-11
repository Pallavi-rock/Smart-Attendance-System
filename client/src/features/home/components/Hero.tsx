import {
  ArrowRight,
  MapPin,
  PlayCircle,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button, Container } from "../../../shared/components/ui";

export default function Hero() {
  const navigate = useNavigate();
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white">

      <Container className="py-24">

        <div className="grid items-center gap-16 lg:grid-cols-2">

          {/* Left */}

          <div>

            <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
              🚀 AI Powered Smart Attendance
            </span>

            <h1 className="mt-8 text-5xl font-extrabold leading-tight text-gray-900 lg:text-6xl">

              Modern Attendance

              <span className="text-blue-600">
                {" "}Management{" "}
              </span>

              using AI

            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">

              Secure attendance using Dynamic QR,
              GPS Verification,
              AI Validation,
              Live Monitoring,
              and Analytics.

            </p>

            <div className="mt-10 flex flex-wrap gap-4">

              <Button size="lg" onClick={() => navigate("/register")}>
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Button
                variant="outline"
                size="lg"
              >
                <PlayCircle className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>

            </div>

          </div>

          {/* Right */}

          <div>

            <div className="rounded-3xl border bg-white p-8 shadow-2xl">

              <div className="grid gap-6">

                <div className="flex items-center gap-4">

                  <div className="rounded-xl bg-blue-100 p-3">

                    <QrCode className="text-blue-600" />

                  </div>

                  <div>

                    <h3 className="font-semibold">

                      Dynamic QR Attendance

                    </h3>

                    <p className="text-sm text-gray-500">

                      QR expires automatically after session.

                    </p>

                  </div>

                </div>

                <div className="flex items-center gap-4">

                  <div className="rounded-xl bg-green-100 p-3">

                    <MapPin className="text-green-600" />

                  </div>

                  <div>

                    <h3 className="font-semibold">

                      GPS Verification

                    </h3>

                    <p className="text-sm text-gray-500">

                      Students must be inside campus radius.

                    </p>

                  </div>

                </div>

                <div className="flex items-center gap-4">

                  <div className="rounded-xl bg-purple-100 p-3">

                    <ShieldCheck className="text-purple-600" />

                  </div>

                  <div>

                    <h3 className="font-semibold">

                      AI Fraud Detection

                    </h3>

                    <p className="text-sm text-gray-500">

                      Prevent proxy attendance using intelligent validation.

                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </Container>

    </section>
  );
}