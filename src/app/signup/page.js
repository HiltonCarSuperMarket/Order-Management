"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Car, Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { toast } from "sonner";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
  });

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleRoleChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      role: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle signup logic here

    try {
      setIsLoading(true);
      await axios.post("/api/signup", formData);

      toast.success("Account created successfully");

      setFormData({
        name: "",
        email: "",
        password: "",
        role: "USER",
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error("Signup failed", {
          description:
            error.response.data.message ||
            "An error occurred. Please try again.",
        });
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen  h-full">
      {/* Left Side - Form */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="flex flex-col justify-center items-center  p-8 lg:p-12 dark:bg-gray-900"
      >
        <div className="w-full max-w-md">
          <div className="flex justify-between items-center mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-[#2C45AA] hover:text-[#1a2f7a] dark:text-[#4e6cde] dark:hover:text-[#6a84e5]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
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
              Create an account
            </motion.h1>
            <motion.p
              className="text-gray-600 dark:text-gray-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Join Hilton Car SuperMarket for an exceptional order management
              experience.
            </motion.p>
          </div>

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="space-y-2">
              <Label htmlFor="name" className="dark:text-gray-200">
                Name
              </Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="dark:text-gray-200">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="dark:text-gray-200">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pr-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                Password must be at least 8 characters long with a number and a
                special character.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="dark:text-gray-200">
                Role
              </Label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800">
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              className="w-full bg-[#2C45AA] hover:bg-[#1a2f7a] text-white py-6 dark:bg-[#4e6cde] dark:hover:bg-[#3a56b9]"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex gap-1 items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-xs ml-2">Creating Account...</span>
                </div>
              ) : (
                <div>{"Create Account"}</div>
              )}
            </Button>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
}
