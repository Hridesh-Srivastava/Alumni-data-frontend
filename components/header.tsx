"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-background py-4 shadow-sm">
      <div className="container mx-auto flex items-center justify-between px-4">
        {/* Logo + Title */}
        <Link href="/" className="flex items-center space-x-2 text-2xl font-bold">
          <Image
            src="/SRHU-logo.png"
            alt="SRHU logo"
            width={64}
            height={64}
            className="object-contain"
          />
          <span>SST Alumni</span>
        </Link>

        <div className="flex items-center space-x-6">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-base font-medium hover:underline">
              Home
            </Link>
            <Link href="/about" className="text-base font-medium hover:underline">
              About
            </Link>
            <Link href="/contact" className="text-base font-medium hover:underline">
              Contact
            </Link>
          </nav>

          <ThemeToggle />

          <button
            className="md:hidden p-2 rounded hover:bg-muted focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Links */}
      {isOpen && (
        <div className="md:hidden mt-2 px-4">
          <Link
            href="/"
            className="block py-2 text-sm font-medium hover:underline"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/about"
            className="block py-2 text-sm font-medium hover:underline"
            onClick={() => setIsOpen(false)}
          >
            About
          </Link>
          <Link
            href="/contact"
            className="block py-2 text-sm font-medium hover:underline"
            onClick={() => setIsOpen(false)}
          >
            Contact
          </Link>
        </div>
      )}
    </header>
  );
}
