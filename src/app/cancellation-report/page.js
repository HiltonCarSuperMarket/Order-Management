"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Trash2,
  X,
  Edit,
  CalendarIcon,
  UserIcon,
  EyeIcon,
} from "lucide-react";
import Navbar from "@/components/shared/navbar";
import DeleteOrderDialog from "@/components/shared/delete-order-dialog";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function CancellationReport() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 200);
  const controls = useAnimation();
  const [filterOptions, setFilterOptions] = useState({
    salesExecutive: [],
    isShowUp: [],
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  // Date filters
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedSalesExecutives, setSelectedSalesExecutives] = useState([]);
  const [selectedShowUp, setSelectedShowUp] = useState("");

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1.0],
      },
    },
  };

  const tableRowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.03,
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1.0],
      },
    }),
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1.0],
      },
    },
  };

  const filterBadgeVariants = {
    hidden: { opacity: 0, scale: 0.8, x: -10 },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1.0],
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      x: -10,
      transition: {
        duration: 0.2,
        ease: [0.25, 0.1, 0.25, 1.0],
      },
    },
  };

  // Generate years, months, and days for dropdowns
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear; i++) {
      years.push(i.toString());
    }
    return years;
  };

  const generateMonths = () => {
    return [
      { value: "1", label: "January" },
      { value: "2", label: "February" },
      { value: "3", label: "March" },
      { value: "4", label: "April" },
      { value: "5", label: "May" },
      { value: "6", label: "June" },
      { value: "7", label: "July" },
      { value: "8", label: "August" },
      { value: "9", label: "September" },
      { value: "10", label: "October" },
      { value: "11", label: "November" },
      { value: "12", label: "December" },
    ];
  };

  const generateDays = () => {
    const days = [];
    for (let i = 1; i <= 31; i++) {
      days.push(i.toString());
    }
    return days;
  };

  // Fetch filter options from API
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await fetch("/api/filter-options");
        const data = await response.json();

        setFilterOptions({
          salesExecutive: data.salesExecutive || [],
          isShowUp: data.isShowUp || [],
        });
      } catch (error) {
        console.error("Failed to fetch filter options:", error);
      }
    };

    fetchFilterOptions();
  }, []);

  // Format date for display - handle string dates
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      // Try to parse the date string
      const date = new Date(dateString);

      // Check if it's a valid date
      if (!isNaN(date.getTime())) {
        return format(date, "dd MMM yyyy");
      }

      // If it's already in a format like "2024-02-24" or contains dashes
      if (dateString.includes("-")) {
        const parts = dateString.split("-");
        // Check if we have a year-month-day format
        if (parts.length === 3) {
          const [year, month, day] = parts;
          const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          // Convert month number (1-12) to index (0-11)
          const monthIndex = Number.parseInt(month, 10) - 1;
          // Format as "24 Feb 2024"
          return `${Number.parseInt(day, 10)} ${
            monthNames[monthIndex]
          } ${year}`;
        }
      }

      // If it's in a format like "24/02/2024" or contains slashes
      if (dateString.includes("/")) {
        const parts = dateString.split("/");
        // Check if we have a day/month/year format
        if (parts.length === 3) {
          const [day, month, year] = parts;
          const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          // Convert month number (1-12) to index (0-11)
          const monthIndex = Number.parseInt(month, 10) - 1;
          // Format as "24 Feb 2024"
          return `${Number.parseInt(day, 10)} ${
            monthNames[monthIndex]
          } ${year}`;
        }
      }

      // Return the original string if we couldn't parse it
      return dateString;
    } catch (error) {
      return dateString;
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedYear("");
    setSelectedMonth("");
    setSelectedDay("");
    setSelectedSalesExecutives([]);
    setSelectedShowUp("");
    setSearch("");
  };

  // Effect to fetch orders when filters or pagination changes
  useEffect(() => {
    fetchOrders();
  }, [
    currentPage,
    limit,
    debouncedSearch,
    selectedYear,
    selectedMonth,
    selectedDay,
    selectedSalesExecutives,
    selectedShowUp,
  ]);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // Calculate total pages
  const totalPages = Math.ceil(totalOrders / limit);

  // Badge variants for different statuses
  const getBadgeVariantForShowUp = (value) => {
    if (value === "Yes") return "success";
    if (value === "No") return "destructive";
    return "default";
  };

  // Fetch orders with filters
  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = `/api/reports/cancellation?page=${currentPage}&limit=${limit}`;

      if (debouncedSearch) {
        url += `&search=${encodeURIComponent(debouncedSearch)}`;
      }

      if (selectedYear) {
        url += `&year=${encodeURIComponent(selectedYear)}`;
      }

      if (selectedMonth) {
        url += `&month=${encodeURIComponent(selectedMonth)}`;
      }

      if (selectedDay) {
        url += `&day=${encodeURIComponent(selectedDay)}`;
      }

      if (selectedSalesExecutives.length > 0) {
        url += `&salesExecutive=${encodeURIComponent(
          selectedSalesExecutives.join(",")
        )}`;
      }

      if (selectedShowUp) {
        url += `&isShowUp=${encodeURIComponent(selectedShowUp)}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setOrders(data.data);
        setTotalOrders(data.totalOrders);
        controls.start("visible");
      } else {
        console.error("Error fetching cancellation report:", data.error);
      }
    } catch (error) {
      console.error("Failed to fetch cancellation report:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle order deletion
  const handleOrderDeleted = (deletedOrderId) => {
    setOrders((prevOrders) =>
      prevOrders.filter((order) => order._id !== deletedOrderId)
    );
    setTotalOrders((prev) => prev - 1);
  };

  // Handle edit order (redirect to order detail page)
  const handleEditOrder = (orderId) => {
    router.push(`/edit-order/${orderId}`);
  };

  // Handle sales executive selection
  const handleSalesExecutiveChange = (value, checked) => {
    if (checked) {
      setSelectedSalesExecutives((prev) => [...prev, value]);
    } else {
      setSelectedSalesExecutives((prev) =>
        prev.filter((item) => item !== value)
      );
    }
  };

  // Remove a sales executive filter
  const removeSalesExecutive = (value) => {
    setSelectedSalesExecutives((prev) => prev.filter((item) => item !== value));
  };

  // Table columns configuration
  const columns = [
    { key: "entryDate", label: "Entry Date", format: formatDate },
    { key: "entryTime", label: "Entry Time" },
    { key: "registration", label: "Registration" },
    { key: "enquiryType", label: "Enquiry Type" },
    { key: "openingDate", label: "Order Date", format: formatDate },
    { key: "closingDate", label: "Cancellation Date", format: formatDate },
    // { key: "closingTime", label: "Cancellation Time" },
    { key: "salesExecutive", label: "Sales Executive" },
    { key: "customer", label: "Customer" },
    { key: "location", label: "Location" },
    {
      key: "isShowUp",
      label: "Show Up",
      badge: true,
      badgeVariant: getBadgeVariantForShowUp,
    },
    { key: "reasonForAction", label: "Reason" },
    { key: "reasonDetail", label: "Detail" },
  ];

  return (
    <TooltipProvider>
      <>
        <Navbar />
        <motion.div
          className="container mx-auto py-16 space-y-6 px-4 md:px-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <h2 className="text-center text-3xl font-bold pt-6 sm:pt-8">
            Cancellation Report
          </h2>

          <motion.div variants={itemVariants}>
            <Card className="border border-[#2C45AA]/20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
              <CardHeader className="pt-2 px-4">
                <CardTitle className="text-base">Filters</CardTitle>
              </CardHeader>
              <CardContent className="py-1 px-4">
                <div className="flex flex-col space-y-3">
                  {/* Search and Filters Row */}
                  <div className="flex flex-wrap gap-3 items-center">
                    {/* Search Bar */}
                    <div className="relative w-full sm:w-auto sm:flex-1 max-w-xs">
                      <div className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground">
                        <Search className="h-4 w-4 transition-colors group-hover:text-primary" />
                      </div>
                      <motion.div
                        className="group"
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Input
                          type="search"
                          placeholder="Search orders..."
                          className="pl-8 border-primary/20 focus-visible:ring-primary/30 transition-all duration-300 shadow-sm hover:shadow-md focus-visible:shadow-md"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                        />
                      </motion.div>
                    </div>

                    {/* Date Filters */}
                    <div className="flex flex-wrap gap-2 items-center">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <Select
                          value={selectedYear}
                          onValueChange={(value) => {
                            setSelectedYear(value);
                            // Clear month and day when year changes
                            setSelectedMonth("");
                            setSelectedDay("");
                          }}
                        >
                          <SelectTrigger className="w-24 h-9">
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Years</SelectItem>
                            {generateYears().map((year) => (
                              <SelectItem key={year} value={year}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Select
                        value={selectedMonth}
                        onValueChange={(value) => {
                          setSelectedMonth(value);
                          // Clear day when month changes
                          setSelectedDay("");
                        }}
                        disabled={!selectedYear || selectedYear === "all"}
                      >
                        <SelectTrigger
                          className={`w-28 h-9 ${
                            !selectedYear || selectedYear === "all"
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Months</SelectItem>
                          {generateMonths().map((month) => (
                            <SelectItem key={month.value} value={month.value}>
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={selectedDay}
                        onValueChange={setSelectedDay}
                        disabled={
                          !selectedMonth ||
                          selectedMonth === "all" ||
                          !selectedYear ||
                          selectedYear === "all"
                        }
                      >
                        <SelectTrigger
                          className={`w-20 h-9 ${
                            !selectedMonth ||
                            selectedMonth === "all" ||
                            !selectedYear ||
                            selectedYear === "all"
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          <SelectValue placeholder="Day" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Days</SelectItem>
                          {generateDays().map((day) => (
                            <SelectItem key={day} value={day}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Sales Executive Filter */}
                    <div className="flex items-center gap-1">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="h-9">
                            Sales Executive
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="start"
                          className="w-56 max-h-[300px] overflow-y-auto"
                        >
                          {filterOptions.salesExecutive.map((value) => (
                            <DropdownMenuCheckboxItem
                              key={value}
                              checked={selectedSalesExecutives.includes(value)}
                              onCheckedChange={(checked) =>
                                handleSalesExecutiveChange(value, checked)
                              }
                            >
                              {value}
                            </DropdownMenuCheckboxItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Show Up Filter */}
                    <div className="flex items-center gap-1">
                      <EyeIcon className="h-4 w-4 text-muted-foreground" />
                      <Select
                        value={selectedShowUp}
                        onValueChange={setSelectedShowUp}
                      >
                        <SelectTrigger className="w-28 h-9">
                          <SelectValue placeholder="Show Up" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          {filterOptions.isShowUp.map((value) => (
                            <SelectItem key={value} value={value}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Clear Filters Button */}
                    {(selectedYear ||
                      selectedMonth ||
                      selectedDay ||
                      selectedSalesExecutives.length > 0 ||
                      selectedShowUp ||
                      search) && (
                      <Button
                        variant="ghost"
                        onClick={clearAllFilters}
                        size="sm"
                        className="hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        Clear All
                      </Button>
                    )}
                  </div>

                  {/* Active filters display */}
                  {(selectedYear ||
                    selectedMonth ||
                    selectedDay ||
                    selectedSalesExecutives.length > 0 ||
                    selectedShowUp) && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      <AnimatePresence>
                        {selectedYear && selectedYear !== "all" && (
                          <motion.div
                            variants={filterBadgeVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            layout
                          >
                            <Badge
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              <span>Year: {selectedYear}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 p-0"
                                onClick={() => setSelectedYear("")}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          </motion.div>
                        )}

                        {selectedMonth && selectedMonth !== "all" && (
                          <motion.div
                            variants={filterBadgeVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            layout
                          >
                            <Badge
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              <span>
                                Month:{" "}
                                {
                                  generateMonths().find(
                                    (m) => m.value === selectedMonth
                                  )?.label
                                }
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 p-0"
                                onClick={() => setSelectedMonth("")}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          </motion.div>
                        )}

                        {selectedDay && selectedDay !== "all" && (
                          <motion.div
                            variants={filterBadgeVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            layout
                          >
                            <Badge
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              <span>Day: {selectedDay}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 p-0"
                                onClick={() => setSelectedDay("")}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          </motion.div>
                        )}

                        {selectedSalesExecutives.map((value) => (
                          <motion.div
                            key={`salesExec-${value}`}
                            variants={filterBadgeVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            layout
                          >
                            <Badge
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              <span>Sales Exec: {value}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 p-0"
                                onClick={() => removeSalesExecutive(value)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          </motion.div>
                        ))}

                        {selectedShowUp && selectedShowUp !== "all" && (
                          <motion.div
                            variants={filterBadgeVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            layout
                          >
                            <Badge
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              <span>Show Up: {selectedShowUp}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 p-0"
                                onClick={() => setSelectedShowUp("")}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border border-[#2C45AA]/20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700">
                      <TableRow>
                        {columns.map((column) => (
                          <TableHead
                            key={column.key}
                            className="relative py-1 px-1 text-xs font-medium"
                          >
                            <div className="flex items-center gap-1">
                              {column.label}
                            </div>
                          </TableHead>
                        ))}
                        <TableHead className="w-[100px] py-1 px-1 text-xs font-medium">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {loading ? (
                          <TableRow>
                            <TableCell
                              colSpan={columns.length + 1}
                              className="h-24 text-center"
                            >
                              <motion.div
                                className="flex justify-center"
                                animate={{
                                  rotate: 360,
                                  transition: {
                                    duration: 1.5,
                                    repeat: Number.POSITIVE_INFINITY,
                                    ease: "linear",
                                  },
                                }}
                              >
                                <div className="h-8 w-8 rounded-full border-2 border-[#2C45AA] border-t-transparent"></div>
                              </motion.div>
                            </TableCell>
                          </TableRow>
                        ) : orders.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={columns.length + 1}
                              className="h-24 text-center"
                            >
                              No cancelled orders found
                            </TableCell>
                          </TableRow>
                        ) : (
                          orders.map((order, index) => (
                            <motion.tr
                              key={order._id}
                              custom={index}
                              variants={tableRowVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              className="border-b transition-colors dark:hover:bg-gray-800 data-[state=selected]:bg-muted"
                            >
                              {columns.map((column) => (
                                <TableCell
                                  key={`${order._id}-${column.key}`}
                                  className="py-1.5 px-2 text-xs"
                                >
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="cursor-pointer">
                                        {column.badge ? (
                                          <AnimatedBadge
                                            variant={column.badgeVariant(
                                              order[column.key]
                                            )}
                                          >
                                            {order[column.key]}
                                          </AnimatedBadge>
                                        ) : column.format ? (
                                          column.format(order[column.key])
                                        ) : (
                                          order[column.key] || "-"
                                        )}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>
                                        {column.label}:{" "}
                                        {order[column.key] || "N/A"}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TableCell>
                              ))}
                              <TableCell className="py-1.5 px-2 text-xs">
                                <div className="flex items-center gap-2">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="cursor-pointer h-6 w-6 p-0"
                                        onClick={() =>
                                          handleEditOrder(order._id)
                                        }
                                      >
                                        <Edit className="text-blue-500 w-3 h-3" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Edit order</p>
                                    </TooltipContent>
                                  </Tooltip>

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="cursor-pointer h-6 w-6 p-0"
                                        onClick={() => {
                                          setOrderToDelete(order._id);
                                          setIsDeleteDialogOpen(true);
                                        }}
                                      >
                                        <Trash2 className="text-red-500 w-3 h-3" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Delete order</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              </TableCell>
                            </motion.tr>
                          ))
                        )}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      Showing{" "}
                      <span className="font-medium">{orders.length}</span> of{" "}
                      <span className="font-medium">{totalOrders}</span> orders
                    </p>
                    <Select
                      value={limit.toString()}
                      onValueChange={(value) => {
                        setLimit(Number(value));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-[70px]">
                        <SelectValue placeholder="10" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="border-[#2C45AA]/30"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    </motion.div>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages || 1}
                    </span>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={
                          currentPage === totalPages || totalPages === 0
                        }
                        className="border-[#2C45AA]/30"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Delete Order Dialog */}
        <DeleteOrderDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          orderId={orderToDelete}
          onOrderDeleted={handleOrderDeleted}
        />
      </>
    </TooltipProvider>
  );
}

const AnimatedBadge = ({ variant, children }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Badge variant={variant} className="font-medium">
        {children}
      </Badge>
    </motion.div>
  );
};
