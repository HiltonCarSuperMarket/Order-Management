"use client";
import { Car, Menu, X } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { ThemeToggle } from "../theme-toggle";
import { AnimatePresence, motion } from "framer-motion";
import useAuth from "@/hooks/use-auth";
import { Button } from "../ui/button";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const router = useRouter();

  const role = useAuth();

  const ADMIN_ROLE = role === "ADMIN";

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

  const handleLogout = async () => {
    try {
      await axios.get("/api/logout");
      setMobileMenuOpen(false);
      toast.success("Logout successful");
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed");
    }
  };

  return (
    <header
      className={`fixed  w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white shadow-md py-3 dark:bg-gray-900 dark:shadow-gray-800/20"
          : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl  mx-auto w-full px-4 flex justify-between items-center">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Car className="h-8 w-8 text-[#2C45AA] dark:text-[#4e6cde]" />
          <span className="font-bold text-xl text-[#2C45AA] dark:text-[#4e6cde] ">
            Hilton Car <span> SuperMarket </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            href="/register-order"
            className="text-gray-700 hover:text-[#2C45AA] font-medium py-2 dark:text-gray-300 dark:hover:text-[#4e6cde]"
            onClick={() => setMobileMenuOpen(false)}
          >
            Register Order
          </Link>
          <Link
            href="/view-active-orders"
            className="text-gray-700 hover:text-[#2C45AA] font-medium py-2 dark:text-gray-300 dark:hover:text-[#4e6cde]"
            onClick={() => setMobileMenuOpen(false)}
          >
            Active Orders
          </Link>
          <Link
            href="/view-orders"
            className="text-gray-700 hover:text-[#2C45AA] font-medium py-2 dark:text-gray-300 dark:hover:text-[#4e6cde]"
            onClick={() => setMobileMenuOpen(false)}
          >
            Inactive Orders
          </Link>
          {ADMIN_ROLE && (
            <Link
              href="/signup"
              className="text-gray-700 hover:text-[#2C45AA] font-medium dark:text-gray-300 dark:hover:text-[#4e6cde]"
            >
              Create User
            </Link>
          )}
          {role && (
            <Button
              className="text-white  bg-red-600  hover:bg-red-600/90 hover:text-white/90 font-medium dark:text-white dark:hover:text-white/90"
              onClick={handleLogout}
            >
              Logout
            </Button>
          )}
          {!role && (
            <Link href={"/"}>
              <Button className="text-white  bg-primary  hover:bg-primary hover:text-white/90 font-medium dark:text-white dark:hover:text-white/90">
                Login
              </Button>
            </Link>
          )}
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
              {ADMIN_ROLE && (
                <Link
                  href="/signup"
                  className="text-gray-700 hover:text-[#2C45AA] font-medium py-2 dark:text-gray-300 dark:hover:text-[#4e6cde]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Create User
                </Link>
              )}

              {
                <Link
                  href="/view-active-orders"
                  className="text-gray-700 hover:text-[#2C45AA] font-medium py-2 dark:text-gray-300 dark:hover:text-[#4e6cde]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Active Orders
                </Link>
              }
              {
                <Link
                  href="/view-orders"
                  className="text-gray-700 hover:text-[#2C45AA] font-medium py-2 dark:text-gray-300 dark:hover:text-[#4e6cde]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Inactive Orders
                </Link>
              }
              {role && (
                <Button
                  className="text-white  bg-red-600  hover:bg-red-600/90 hover:text-white/90 font-medium dark:text-white dark:hover:text-white/90"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              )}

              {!role && (
                <Link
                  href={"/"}
                  className="text-white  bg-primary  hover:bg-primary hover:text-white/90 font-medium dark:text-white dark:hover:text-white/90"
                >
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
