"use client";
import { Car, Menu } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { ThemeToggle } from "../theme-toggle";
import { AnimatePresence, motion } from "framer-motion";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white shadow-md py-2 dark:bg-gray-900 dark:shadow-gray-800/20"
          : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Car className="h-8 w-8 text-[#2C45AA] dark:text-[#4e6cde]" />
          <span className="font-bold text-xl text-[#2C45AA] dark:text-[#4e6cde]">
            Hilton Car SuperMarket
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            href="/signup"
            className="text-gray-700 hover:text-[#2C45AA] font-medium dark:text-gray-300 dark:hover:text-[#4e6cde]"
          >
            Create User
          </Link>
          <Link
            href="/logout"
            className="text-gray-700 hover:text-[#2C45AA] font-medium dark:text-gray-300 dark:hover:text-[#4e6cde]"
          >
            Logout
          </Link>
          <ThemeToggle />
        </nav>

        {/* Mobile Menu Button and Orders */}
        <div className="md:hidden flex items-center space-x-4">
          <ThemeToggle />
          <button
            className="text-gray-700 dark:text-gray-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-gray-900"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              <Link
                href="/create-user"
                className="text-gray-700 hover:text-[#2C45AA] font-medium py-2 dark:text-gray-300 dark:hover:text-[#4e6cde]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Create User
              </Link>
              <Link
                href="/logout"
                className="text-gray-700 hover:text-[#2C45AA] font-medium py-2 dark:text-gray-300 dark:hover:text-[#4e6cde]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Logout
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
