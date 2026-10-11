import { Mail, MapPin, Phone } from "lucide-react";

import {
  Button,
  Container,
  Input,
  SectionTitle,
} from "../../../shared/components/ui";

export default function Contact() {
  return (
    <section
      id="contact"
      className="bg-gray-50 py-24"
    >
      <Container>

        <SectionTitle
          title="Contact Us"
          subtitle="Have questions? We'd love to hear from you."
        />

        <div className="grid gap-10 lg:grid-cols-2">

          {/* Left */}

          <div className="space-y-8">

            <div className="flex items-center gap-4">
              <Mail className="text-blue-600" />

              <div>
                <h4 className="font-semibold">
                  Email
                </h4>

                <p className="text-gray-600">
                  support@smartattendance.com
                </p>
              </div>

            </div>

            <div className="flex items-center gap-4">

              <Phone className="text-blue-600" />

              <div>

                <h4 className="font-semibold">
                  Phone
                </h4>

                <p className="text-gray-600">
                  +91 9876543210
                </p>

              </div>

            </div>

            <div className="flex items-center gap-4">

              <MapPin className="text-blue-600" />

              <div>

                <h4 className="font-semibold">
                  Address
                </h4>

                <p className="text-gray-600">
                  Jaipur, Rajasthan, India
                </p>

              </div>

            </div>

          </div>

          {/* Right */}

          <form className="space-y-5">

            <Input
              label="Full Name"
              placeholder="Enter your full name"
            />

            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
            />

            <Input
              label="Subject"
              placeholder="Subject"
            />

            <div>

              <label className="mb-2 block text-sm font-medium">
                Message
              </label>

              <textarea
                rows={6}
                placeholder="Write your message..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
              />

            </div>

            <Button
              type="submit"
              className="w-full"
            >
              Send Message
            </Button>

          </form>

        </div>

      </Container>
    </section>
  );
}