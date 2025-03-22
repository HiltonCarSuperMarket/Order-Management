"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Car, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post("/api/login", {
        email,
        password,
      });

      toast.success("Login successful", {
        description: "Redirecting you to the dashboard...",
      });

      router.push("/dashboard");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Login failed";

      toast.error("Login failed", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-full">
      {/* Left Side - Form */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="flex flex-col justify-center items-center p-8 lg:p-12 h-screen dark:bg-gray-900"
      >
        <div className="w-full max-w-md">
          <div className="flex justify-end items-center mb-8">
            <ThemeToggle />
          </div>
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <Car className="h-8 w-8 text-[#2C45AA] mr-2 dark:text-[#4e6cde]" />
              <span className="font-bold text-xl text-[#2C45AA] dark:text-[#4e6cde]">
                Hilton Car SuperMarket
              </span>
            </div>
            <motion.h1
              className="text-3xl font-bold text-gray-900 mb-2 dark:text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Welcome back
            </motion.h1>
            <motion.p
              className="text-gray-600 dark:text-gray-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Please enter your details to sign in to your account.
            </motion.p>
          </div>

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="dark:text-gray-200">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="password" className="dark:text-gray-200">
                  Password
                </Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#2C45AA] hover:bg-[#1a2f7a] text-white py-6 dark:bg-[#4e6cde] dark:hover:bg-[#3a56b9]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="mr-2">Signing In</span>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                    className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                  />
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
}
