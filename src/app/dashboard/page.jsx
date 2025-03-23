"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Car,
  Users,
  Menu,
  X,
  ClipboardList,
  Clock,
  CheckCircle,
  BarChart3,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/shared/navbar";
import ImageCarousel from "@/components/shared/image-corousel";

export default function LandingPage() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const slideIn = {
    hidden: { x: 100, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
      },
    },
  };

  const carouselImages = [
    "/hero.jpg",
    "/hero-1.jpg",
    "/hero-2.jpg",
    "/hero-3.jpg",
  ];

  return (
    <div className="min-h-screen flex flex-col max-w-screen overflow-x-hidden">
      {/* Hero Section */}
      <Navbar />
      <section
        id="dashboard"
        className="pt-24 lg:pt-10 lg:h-screen flex items-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
      >
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="bg-[#2C45AA]/10 text-[#2C45AA] dark:bg-[#4e6cde]/20 dark:text-[#4e6cde] px-3 py-1 text-sm mb-4">
                Order Management System
              </Badge>
            </motion.div>
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight dark:text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Manage Customer Experience with{" "}
              <span className="text-[#2C45AA] dark:text-[#4e6cde]">
                Excellence
              </span>
            </motion.h1>
            <motion.p
              className="text-lg text-gray-600 max-w-lg dark:text-gray-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              Hilton Car SuperMarket offers a comprehensive order management
              system to streamline your operations and enhance customer
              satisfaction.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              <Link href={"/view-orders"}>
                <Button className="bg-[#2C45AA] text-white hover:bg-[#1a2f7a] text-lg px-8 py-6 dark:bg-[#4e6cde] dark:hover:bg-[#3a56b9]">
                  View Orders
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href={"/register-order"}>
                <Button
                  variant="outline"
                  className="border-[#2C45AA] text-[#2C45AA] hover:bg-[#2C45AA] hover:text-white text-lg px-8 py-6 dark:border-[#4e6cde] dark:text-[#4e6cde] dark:hover:bg-[#4e6cde] dark:hover:text-white"
                >
                  Register Order
                </Button>
              </Link>
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[300px] sm:h-[400px] lg:h-[500px] rounded-lg overflow-hidden shadow-2xl mt-4"
          >
            <ImageCarousel
              images={carouselImages}
              interval={5000}
              overlayTitle="Streamlined Order Management"
              overlayDescription="Track, manage, and optimize your vehicle orders"
            />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 dark:text-white">
              Key Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto dark:text-gray-300">
              Our order management system provides powerful tools to streamline
              your operations.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              {
                icon: (
                  <ClipboardList className="h-10 w-10 text-[#2C45AA] dark:text-[#4e6cde]" />
                ),
                title: "Order Tracking",
                description:
                  "Real-time tracking of all orders from placement to delivery.",
              },
              {
                icon: (
                  <BarChart3 className="h-10 w-10 text-[#2C45AA] dark:text-[#4e6cde]" />
                ),
                title: "Analytics Dashboard",
                description:
                  "Comprehensive analytics to monitor performance and identify trends.",
              },
              {
                icon: (
                  <CheckCircle className="h-10 w-10 text-[#2C45AA] dark:text-[#4e6cde]" />
                ),
                title: "Quality Assurance",
                description:
                  "Built-in quality checks to ensure customer satisfaction.",
              },
              {
                icon: (
                  <Users className="h-10 w-10 text-[#2C45AA] dark:text-[#4e6cde]" />
                ),
                title: "Customer Management",
                description:
                  "Detailed customer profiles and purchase history for personalized service.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 dark:bg-gray-800"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Order Process */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 dark:text-white">
              Order Management Process
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto dark:text-gray-300">
              Our streamlined process ensures efficient order handling from
              creation to delivery.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-4 gap-8"
          >
            {[
              {
                step: "01",
                title: "Order Creation",
                description:
                  "Create new orders with comprehensive vehicle and customer details.",
              },
              {
                step: "02",
                title: "Processing",
                description:
                  "Track order processing, including payment verification and documentation.",
              },
              {
                step: "03",
                title: "Vehicle Preparation",
                description:
                  "Monitor vehicle preparation, inspections, and customizations.",
              },
              {
                step: "04",
                title: "Delivery",
                description:
                  "Schedule and track deliveries with real-time updates for customers.",
              },
            ].map((step, index) => (
              <motion.div key={index} variants={slideIn} className="relative">
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 dark:bg-gray-800 h-full hover:transform hover:-translate-y-2">
                  <div className="text-5xl font-bold text-[#2C45AA]/10 mb-4 dark:text-[#4e6cde]/20">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#2C45AA] dark:bg-[#1a2f7a]">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Streamline Your Order Management?
            </h2>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8">
              Join Hilton Car SuperMarket today and experience our exceptional
              order management system.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/view-orders">
                <Button className="bg-white text-[#2C45AA] hover:bg-gray-100 text-lg px-8 py-6 dark:text-[#1a2f7a]">
                  View Orders
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/register-order">
                <Button
                  variant="outline"
                  className="border-white text-[#2C45AA] dark:text-white hover:bg-white hover:text-[#2C45AA]/90 text-lg px-8 py-6 dark:hover:text-white/90"
                >
                  Register Order
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
