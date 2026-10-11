import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button, Container } from "../shared/components/ui";
const navLinks = [
  { label: "Home", href: "#" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/70 bg-white/80 backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
              SA
            </div>

            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Smart Attendance
              </h1>

              <p className="text-xs text-gray-500">
                No Proxy
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-gray-600 transition hover:text-blue-600"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop Buttons */}
          <div className="hidden items-center gap-3 md:flex">
            <Button variant="outline" onClick={() => navigate("/login")}>
              Login
            </Button>

            <Button onClick={() => navigate("/register")}>
              Get Started
            </Button>
          </div>

          {/* Mobile Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="space-y-4 border-t py-5 md:hidden">

            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="block text-gray-700"
              >
                {item.label}
              </a>
            ))}

            <div className="space-y-3 pt-2">

              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/login")}
              >
                Login
              </Button>

              <Button className="w-full" onClick={() => navigate("/register")}>
                Get Started
              </Button>

            </div>
          </div>
        )}
      </Container>
    </header>
  );
}