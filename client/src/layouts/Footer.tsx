import { Link } from "react-router-dom";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">

          {/* Brand */}
          <div>
            <h2 className="text-2xl font-bold text-blue-400">
              Smart Attendance
            </h2>

            <p className="mt-4 text-sm leading-6 text-gray-400">
              AI Powered Smart Attendance System using QR Code,
              Firebase, GPS Verification and Real-Time Analytics.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">
              Quick Links
            </h3>

            <ul className="space-y-3 text-gray-400">
              <li>
                <a href="#home" className="hover:text-blue-400 transition">
                  Home
                </a>
              </li>

              <li>
                <a href="#features" className="hover:text-blue-400 transition">
                  Features
                </a>
              </li>

              <li>
                <a href="#how-it-works" className="hover:text-blue-400 transition">
                  How It Works
                </a>
              </li>

              <li>
                <a href="#faq" className="hover:text-blue-400 transition">
                  FAQ
                </a>
              </li>

              <li>
                <a href="#contact" className="hover:text-blue-400 transition">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">
              Account
            </h3>

            <ul className="space-y-3 text-gray-400">
              <li>
                <Link to="/login" className="hover:text-blue-400 transition">
                  Login
                </Link>
              </li>

              <li>
                <Link to="/register" className="hover:text-blue-400 transition">
                  Register
                </Link>
              </li>

              <li>
                <Link
                  to="/forgot-password"
                  className="hover:text-blue-400 transition"
                >
                  Forgot Password
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">
              Contact
            </h3>

            <div className="space-y-3 text-gray-400 text-sm">
              <p>📍 India</p>
              <p>📧 support@smartattendance.com</p>
              <p>📞 +91 XXXXX XXXXX</p>
            </div>
          </div>
        </div>

        <div className="my-10 border-t border-slate-800" />

        <div className="flex flex-col items-center justify-between gap-4 text-sm text-gray-500 md:flex-row">
          <p>
            © {year} Smart Attendance System. All Rights Reserved.
          </p>

          <div className="flex gap-6">
            <a
              href="#"
              className="hover:text-blue-400 transition"
            >
              Privacy Policy
            </a>

            <a
              href="#"
              className="hover:text-blue-400 transition"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;