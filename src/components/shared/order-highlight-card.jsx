"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";

export default function OrderHighlightCards() {
  const [stats, setStats] = useState({
    activeOrders: 0,
    canceledOrders: 0,
    totalOrders: 0,
    activeOrdersPercentage: 0,
    canceledOrdersPercentage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderStats = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/order-status");

        if (!response.ok) {
          throw new Error("Failed to fetch order statistics");
        }

        const data = await response.json();

        if (data.success) {
          setStats({
            activeOrders: data.activeOrders || 0,
            canceledOrders: data.canceledOrders || 0,
            totalOrders: data.totalOrders || 0,
            activeOrdersPercentage: data.activeOrdersPercentage || 0,
            canceledOrdersPercentage: data.canceledOrdersPercentage || 0,
          });
          setError(null);
        } else {
          throw new Error(data.error || "Failed to load statistics");
        }
      } catch (err) {
        console.error("Error fetching order stats:", err);
        setError("Failed to load order statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderStats();
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1.0],
      },
    },
  };

  const numberVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1.0],
        delay: 0.3,
      },
    },
  };

  const iconVariants = {
    hidden: { opacity: 0, rotate: -10, scale: 0.8 },
    visible: {
      opacity: 1,
      rotate: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1.0],
      },
    },
  };

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Active Orders Card */}
      <motion.div variants={cardVariants}>
        <Card className="overflow-hidden border border-[#2C45AA]/20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  Active Orders
                </h3>
                <motion.div
                  className="text-4xl font-bold text-[#2C45AA] dark:text-blue-400"
                  variants={numberVariants}
                >
                  {loading ? (
                    <div className="h-10 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  ) : (
                    stats.activeOrders
                  )}
                </motion.div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Orders with status "Active"
                </p>
              </div>
              <motion.div
                className="bg-[#2C45AA]/10 dark:bg-blue-900/30 p-3 rounded-full"
                variants={iconVariants}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <CheckCircle className="h-8 w-8 text-[#2C45AA] dark:text-blue-400" />
              </motion.div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>
                  {loading
                    ? "..."
                    : `${Math.round(stats.activeOrdersPercentage)}%`}
                </span>
                <span>of total orders</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <motion.div
                  className="bg-[#2C45AA] dark:bg-blue-500 h-2.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: loading ? "30%" : `${stats.activeOrdersPercentage}%`,
                  }}
                  transition={{ duration: 1, delay: 0.5 }}
                ></motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Canceled Orders Card */}
      <motion.div variants={cardVariants}>
        <Card className="overflow-hidden border border-[#2C45AA]/20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  Canceled Orders
                </h3>
                <motion.div
                  className="text-4xl font-bold text-red-600 dark:text-red-500"
                  variants={numberVariants}
                >
                  {loading ? (
                    <div className="h-10 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  ) : (
                    stats.canceledOrders
                  )}
                </motion.div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Orders with cancellation date
                </p>
              </div>
              <motion.div
                className="bg-red-500/10 dark:bg-red-900/30 p-3 rounded-full"
                variants={iconVariants}
                whileHover={{ scale: 1.1, rotate: -5 }}
              >
                <XCircle className="h-8 w-8 text-red-600 dark:text-red-500" />
              </motion.div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>
                  {loading
                    ? "..."
                    : `${Math.round(stats.canceledOrdersPercentage)}%`}
                </span>
                <span>of total orders</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <motion.div
                  className="bg-red-500 h-2.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: loading
                      ? "30%"
                      : `${stats.canceledOrdersPercentage}%`,
                  }}
                  transition={{ duration: 1, delay: 0.5 }}
                ></motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
