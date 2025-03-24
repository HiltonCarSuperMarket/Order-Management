"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, TrendingUp, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ActiveOrderCard({
  totalOrders,
  title = "Active Orders",
  subtitle = "Total filtered orders",
}) {
  const [count, setCount] = useState(0);

  // Animate count up to total orders
  useEffect(() => {
    if (totalOrders === 0) {
      setCount(0);
      return;
    }

    let start = 0;
    const end = totalOrders;
    const duration = 1500;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start > end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [totalOrders]);

  return (
    <Card className="overflow-hidden relative border border-[#2C45AA]/20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Animated background elements */}
      <motion.div
        className="absolute -right-16 -top-16 w-32 h-32 bg-primary/5 rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute right-20 bottom-4 w-24 h-24 bg-primary/5 rounded-full"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />
      <motion.div
        className="absolute left-10 top-10 w-16 h-16 bg-primary/5 rounded-full"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 3.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold tracking-tight">
            {title}
          </CardTitle>
          <motion.div
            whileHover={{ rotate: 15, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Package className="w-5 h-5 text-primary" />
          </motion.div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-end gap-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <span className="text-4xl font-bold tracking-tight">{count}</span>
            <motion.div
              className="absolute -right-4 top-0 h-2 w-2 rounded-full bg-primary"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Activity className="h-3 w-3" />
              <span>Orders</span>
            </div>
          </motion.div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <p className="text-muted-foreground">{subtitle}</p>
            <motion.div
              className="flex items-center gap-1 text-primary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <TrendingUp className="h-3 w-3" />
              <span className="font-medium">Active</span>
            </motion.div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
