"use client";

import {
  Car,
  ChevronDown,
  FileBarChart,
  LogOut,
  Menu,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

import { ThemeToggle } from "../theme-toggle";
import { Button } from "@/components/ui/button";
import useAuth from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const navVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0 },
};

const mobileMenuVariants = {
  closed: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
  open: {
    opacity: 1,
    height: "auto",
    transition: {
      duration: 0.5,
      ease: "easeInOut",
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const mobileItemVariants = {
  closed: { opacity: 0, x: -20 },
  open: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

const NavLink = ({ href, children, onClick, className }) => (
  <Link
    href={href}
    className={cn(
      "relative text-gray-700 hover:text-primary font-medium py-2 dark:text-gray-300 dark:hover:text-primary-foreground transition-colors duration-200",
      "after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full dark:after:bg-primary-foreground",
      className
    )}
    onClick={onClick}
  >
    {children}
  </Link>
);

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const role = useAuth();
  const ADMIN_ROLE = role === "ADMIN";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
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
      className={cn(
        "fixed w-full z-50 transition-all duration-500",
        isScrolled
          ? "bg-white/95 backdrop-blur-sm shadow-md py-3 dark:bg-gray-900/95 dark:shadow-gray-800/20"
          : "bg-transparent py-5"
      )}
    >
      <motion.div
        className="max-w-7xl mx-auto w-full px-4 flex justify-between items-center"
        initial="hidden"
        animate="visible"
        variants={navVariants}
      >
        <motion.div variants={itemVariants}>
          <Link href="/dashboard" className="flex items-center space-x-2 group">
            <Car className="h-8 w-8 text-[#2C45AA] dark:text-[#4e6cde] transition-transform duration-500 group-hover:scale-110" />
            <span className="font-bold text-xl text-[#2C45AA] dark:text-[#4e6cde]">
              Hilton Car{" "}
              <span className="hidden sm:inline"> SuperMarket (HCS) </span>
            </span>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <motion.nav
          className="hidden md:flex items-center space-x-6"
          variants={navVariants}
        >
          <motion.div variants={itemVariants}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-1 px-3 cursor-pointer"
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Orders
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/register-order" className="cursor-pointer">
                    Register Order
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/view-active-orders" className="cursor-pointer">
                    Active Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/view-orders" className="cursor-pointer">
                    Inactive Orders
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>

          <motion.div variants={itemVariants}>
            <NavLink href="/cancellation-report">
              <FileBarChart className="h-4 w-4 mr-1 inline" />
              Cancellation Report
            </NavLink>
          </motion.div>

          {ADMIN_ROLE && (
            <motion.div variants={itemVariants}>
              <NavLink href="/signup">
                <User className="h-4 w-4 mr-1 inline" />
                Create User
              </NavLink>
            </motion.div>
          )}

          <motion.div variants={itemVariants}>
            {role ? (
              <Button
                variant="destructive"
                size="sm"
                className="gap-1"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            ) : (
              <Link href="/">
                <Button size="sm">Login</Button>
              </Link>
            )}
          </motion.div>

          <motion.div variants={itemVariants}>
            <ThemeToggle />
          </motion.div>
        </motion.nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-4">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-700 dark:text-gray-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <AnimatePresence mode="wait">
              {mobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-6 w-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-6 w-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </motion.div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={mobileMenuVariants}
            className="md:hidden bg-white/95 backdrop-blur-sm dark:bg-gray-900/95 border-t dark:border-gray-800"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-3">
              <motion.div
                variants={mobileItemVariants}
                className="border-b dark:border-gray-800 pb-3"
              >
                <div className="font-medium text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Orders
                </div>
                <div className="flex flex-col space-y-2 pl-2">
                  <NavLink
                    href="/register-order"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center"
                  >
                    <span className="bg-primary/10 dark:bg-primary-foreground/10 p-1 rounded-md mr-2">
                      <ShoppingCart className="h-4 w-4 text-[#2C45AA] dark:text-[#4e6cde]" />
                    </span>
                    Register Order
                  </NavLink>
                  <NavLink
                    href="/view-active-orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center"
                  >
                    <span className="bg-green-500/10 dark:bg-green-500/10 p-1 rounded-md mr-2">
                      <ShoppingCart className="h-4 w-4 text-green-500" />
                    </span>
                    Active Orders
                  </NavLink>
                  <NavLink
                    href="/view-orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center"
                  >
                    <span className="bg-gray-500/10 dark:bg-gray-400/10 p-1 rounded-md mr-2">
                      <ShoppingCart className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    </span>
                    Inactive Orders
                  </NavLink>
                </div>
              </motion.div>

              <motion.div
                variants={mobileItemVariants}
                className="border-b dark:border-gray-800 pb-3"
              >
                <NavLink
                  href="/cancellation-report"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center"
                >
                  <span className="bg-orange-500/10 dark:bg-orange-500/10 p-1 rounded-md mr-2">
                    <FileBarChart className="h-4 w-4 text-orange-500" />
                  </span>
                  Cancellation Report
                </NavLink>
              </motion.div>

              {ADMIN_ROLE && (
                <motion.div
                  variants={mobileItemVariants}
                  className="border-b dark:border-gray-800 pb-3"
                >
                  <NavLink
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center"
                  >
                    <span className="bg-blue-500/10 dark:bg-blue-500/10 p-1 rounded-md mr-2">
                      <User className="h-4 w-4 text-blue-500" />
                    </span>
                    Create User
                  </NavLink>
                </motion.div>
              )}

              <motion.div variants={mobileItemVariants} className="pt-2">
                {role ? (
                  <Button
                    variant="destructive"
                    className="w-full justify-start gap-2"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                ) : (
                  <Link href="/" className="w-full block">
                    <Button className="w-full justify-start gap-2">
                      <LogOut className="h-4 w-4" />
                      Login
                    </Button>
                  </Link>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
