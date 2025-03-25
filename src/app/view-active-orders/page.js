/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { format, subMonths } from "date-fns";
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
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Trash2,
  X,
  Edit,
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

// Initial filter options
const initialFilterOptions = {
  enquiryType: [],
  salesExecutive: [],
  location: [],
  isPCTSheetReceivedWithinTime: [],
  pctStatus: [],
  orderStatus: [],
};

export default function ActiveOrdersDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  // Change the default limit to show all orders by default
  const [limit, setLimit] = useState(Number.MAX_SAFE_INTEGER);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 200); // 500ms debounce delay
  const [activeFilters, setActiveFilters] = useState({});
  const [months, setMonths] = useState([]);
  const controls = useAnimation();
  const [filterOptions, setFilterOptions] = useState(initialFilterOptions);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  const [totalSoldOrders, setTotalSoldOrders] = useState(0);
  const [totalCancelledOrders, setTotalCancelledOrders] = useState(0);

  // Column filters
  const [columnFilters, setColumnFilters] = useState({});

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

  // Fetch filter options from API
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await fetch("/api/filter-options");
        const data = await response.json();

        // Map API response to filterOptions structure
        setFilterOptions({
          enquiryType: data.enquiryType || [],
          salesExecutive: data.salesExecutive || [],
          location: data.location || [],
          isPctSheetReceivedWithinTime: data.isPCTSheetReceivedWithinTime || [],
          pctStatus: data.pctStatus || [],
          orderStatus: data.orderStatus || [],
        });
      } catch (error) {
        console.error("Failed to fetch filter options:", error);
      }
    };

    fetchFilterOptions();
  }, []);

  // Generate last 12 months for dropdown
  const generateMonths = () => {
    const months = [];
    const today = new Date();

    for (let i = 0; i < 12; i++) {
      const date = subMonths(today, i);
      const monthYear = format(date, "MMM yyyy");
      months.push(monthYear);
    }

    return months;
  };

  const availableMonths = generateMonths();

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return format(date, "dd MMM yyyy");
    } catch (error) {
      return dateString;
    }
  };

  // Handle filter changes
  const handleFilterChange = (filterName, value, checked) => {
    setActiveFilters((prev) => {
      const currentValues = prev[filterName] || [];

      if (checked) {
        return { ...prev, [filterName]: [...currentValues, value] };
      } else {
        return {
          ...prev,
          [filterName]: currentValues.filter((v) => v !== value),
        };
      }
    });
  };

  const getBadgeVariantForPCTStatus = (value) => {
    if (value.includes("Ready to Go")) return "success";
    if (value.includes("Mechanical Major")) return "warning";
    if (value.includes("Transit")) return "info";
    if (value.includes("Inspection")) return "secondary";
    return "default";
  };

  const getBadgeVariantForOrderStatus = (value) => {
    if (value === "Active") return "success";
    if (value === "Inactive") return "destructive";
    return "default";
  };

  // Handle column filter changes
  const handleColumnFilterChange = (columnName, value, checked) => {
    setColumnFilters((prev) => {
      const currentValues = prev[columnName] || [];

      if (checked) {
        return { ...prev, [columnName]: [...currentValues, value] };
      } else {
        return {
          ...prev,
          [columnName]: currentValues.filter((v) => v !== value),
        };
      }
    });
  };

  // Handle month selection
  const handleMonthSelect = (month, checked) => {
    if (checked) {
      setMonths((prev) => [...prev, month]);
    } else {
      setMonths((prev) => prev.filter((m) => m !== month));
    }
  };

  // Remove a month filter
  const removeMonth = (month) => {
    setMonths((prev) => prev.filter((m) => m !== month));
  };

  // Remove a filter
  const removeFilter = (filterName, value) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterName]: prev[filterName].filter((v) => v !== value),
    }));
  };

  // Remove a column filter
  const removeColumnFilter = (columnName, value) => {
    setColumnFilters((prev) => ({
      ...prev,
      [columnName]: prev[columnName].filter((v) => v !== value),
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setActiveFilters({});
    setColumnFilters({});
    setMonths([]);
    setSearch("");
  };

  // Effect to fetch orders when filters or pagination changes
  useEffect(() => {
    fetchOrders();
  }, [
    currentPage,
    limit,
    activeFilters,
    columnFilters,
    months,
    debouncedSearch,
  ]);

  // Calculate total pages
  const totalPages = Math.ceil(totalOrders / limit);

  // Fetch orders with filters
  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = `/api/orders/active?page=${currentPage}&limit=${limit}`;

      if (debouncedSearch) {
        url += `&search=${encodeURIComponent(debouncedSearch)}`;
      }

      // Add filter parameters
      Object.entries(activeFilters).forEach(([key, values]) => {
        if (values.length > 0) {
          url += `&${key}=${encodeURIComponent(values.join(","))}`;
        }
      });

      // Add column filter parameters
      Object.entries(columnFilters).forEach(([key, values]) => {
        if (values.length > 0) {
          url += `&${key}=${encodeURIComponent(values.join(","))}`;
        }
      });

      // Add months filter
      if (months.length > 0) {
        url += `&months=${encodeURIComponent(months.join(","))}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setOrders(data.data);
        setTotalOrders(data.totalOrders);
        // Store the total counts for sold and cancelled orders
        setTotalSoldOrders(data.totalSoldOrders || 0);
        setTotalCancelledOrders(data.totalCancelledOrders || 0);
        controls.start("visible");
      } else {
        console.error("Error fetching orders:", data.error);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
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

  // Table columns configuration - excluding the specified columns
  const columns = [
    { key: "entryDate", label: "Entry Date", format: formatDate },
    { key: "entryTime", label: "Entry Time" },
    { key: "registration", label: "Registration" },
    { key: "enquiryType", label: "Enquiry Type", filterable: true },
    { key: "openingDate", label: "Opening Date", format: formatDate },
    { key: "closingDate", label: "Closing Date", format: formatDate },
    { key: "closingTime", label: "Closing Time" },
    { key: "salesExecutive", label: "Sales Executive", filterable: true },
    { key: "customer", label: "Customer" },
    { key: "location", label: "Location", filterable: true },
    {
      key: "isPctSheetReceivedWithinTime",
      label: "PCT Received",
      badge: true,
      badgeVariant: (value) => (value === "Yes" ? "success" : "destructive"),
    },
    {
      key: "pctStatus",
      label: "PCT Status",
      filterable: true,
      badge: true,
      badgeVariant: getBadgeVariantForPCTStatus,
    },
    {
      key: "orderStatus",
      label: "Order Status",
      filterable: true,
      badge: true,
      badgeVariant: getBadgeVariantForOrderStatus,
    },
  ];

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  return (
    <TooltipProvider>
      <>
        <Navbar />
        <motion.div
          className="container mx-auto py-10 space-y-4 px-2 md:px-4"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <h2 className="text-center text-2xl md:text-3xl font-bold pt-6 sm:pt-10">
            Active Orders Dashboard
          </h2>

          {/* Search Bar */}
          <motion.div variants={itemVariants} className="max-w-[500px] mx-auto">
            <div>
              <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1">
                  <div className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground">
                    <Search className="h-4 w-4 transition-colors group-hover:text-primary" />
                  </div>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="group"
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

                {(Object.keys(activeFilters).length > 0 ||
                  Object.keys(columnFilters).length > 0 ||
                  months.length > 0) && (
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
              {(Object.keys(activeFilters).length > 0 ||
                Object.keys(columnFilters).length > 0 ||
                months.length > 0) && (
                <div className="flex flex-wrap gap-2 mt-2">
                  <AnimatePresence>
                    {months.map((month) => (
                      <motion.div
                        key={`month-${month}`}
                        variants={filterBadgeVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                      >
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1 dark:bg-gray-800"
                        >
                          <span>Month: {month}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0"
                            onClick={() => removeMonth(month)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      </motion.div>
                    ))}

                    {Object.entries(activeFilters).map(([filterName, values]) =>
                      values.map((value) => (
                        <motion.div
                          key={`${filterName}-${value}`}
                          variants={filterBadgeVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          layout
                        >
                          <Badge
                            variant="secondary"
                            className="flex items-center gap-1 dark:bg-gray-800"
                          >
                            <span className="capitalize">
                              {filterName}: {value}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 p-0"
                              onClick={() => removeFilter(filterName, value)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        </motion.div>
                      ))
                    )}

                    {Object.entries(columnFilters).map(([columnName, values]) =>
                      values.map((value) => (
                        <motion.div
                          key={`col-${columnName}-${value}`}
                          variants={filterBadgeVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          layout
                        >
                          <Badge
                            variant="secondary"
                            className="flex items-center gap-1 dark:bg-gray-800"
                          >
                            <span className="capitalize">
                              {columnName}: {value}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 p-0"
                              onClick={() =>
                                removeColumnFilter(columnName, value)
                              }
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
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
                            className="relative py-1 px-1 text-xs"
                          >
                            <div className="flex items-center gap-1">
                              {column.label}

                              {column.filterable && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 p-0 ml-1"
                                    >
                                      <Filter className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="start"
                                    className="w-56 max-h-[300px] overflow-y-auto dark:hover:bg-gray-800"
                                  >
                                    {column.key === "enquiryType" &&
                                      filterOptions.enquiryType.map((value) => (
                                        <DropdownMenuCheckboxItem
                                          key={`${column.key}-${value}`}
                                          checked={(
                                            columnFilters[column.key] || []
                                          ).includes(value)}
                                          onCheckedChange={(checked) =>
                                            handleColumnFilterChange(
                                              column.key,
                                              value,
                                              checked
                                            )
                                          }
                                          className={"hover:bg-gray-800"}
                                        >
                                          {value}
                                        </DropdownMenuCheckboxItem>
                                      ))}

                                    {column.key === "salesExecutive" &&
                                      filterOptions.salesExecutive.map(
                                        (value) => (
                                          <DropdownMenuCheckboxItem
                                            key={`${column.key}-${value}`}
                                            checked={(
                                              columnFilters[column.key] || []
                                            ).includes(value)}
                                            onCheckedChange={(checked) =>
                                              handleColumnFilterChange(
                                                column.key,
                                                value,
                                                checked
                                              )
                                            }
                                            className={"hover:bg-gray-800"}
                                          >
                                            {value}
                                          </DropdownMenuCheckboxItem>
                                        )
                                      )}

                                    {column.key === "location" &&
                                      filterOptions.location.map((value) => (
                                        <DropdownMenuCheckboxItem
                                          key={`${column.key}-${value}`}
                                          checked={(
                                            columnFilters[column.key] || []
                                          ).includes(value)}
                                          onCheckedChange={(checked) =>
                                            handleColumnFilterChange(
                                              column.key,
                                              value,
                                              checked
                                            )
                                          }
                                          className={"hover:bg-gray-800"}
                                        >
                                          {value}
                                        </DropdownMenuCheckboxItem>
                                      ))}

                                    {column.key ===
                                      "isPctSheetReceivedWithinTime" &&
                                      filterOptions.isPCTSheetReceivedWithinTime?.map(
                                        (value) => (
                                          <DropdownMenuCheckboxItem
                                            key={`${column.key}-${value}`}
                                            checked={(
                                              columnFilters[column.key] || []
                                            ).includes(value)}
                                            onCheckedChange={(checked) =>
                                              handleColumnFilterChange(
                                                column.key,
                                                value,
                                                checked
                                              )
                                            }
                                            className={"hover:bg-gray-800"}
                                          >
                                            {value}
                                          </DropdownMenuCheckboxItem>
                                        )
                                      )}

                                    {column.key === "pctStatus" &&
                                      filterOptions.pctStatus.map((value) => (
                                        <DropdownMenuCheckboxItem
                                          key={`${column.key}-${value}`}
                                          checked={(
                                            columnFilters[column.key] || []
                                          ).includes(value)}
                                          onCheckedChange={(checked) =>
                                            handleColumnFilterChange(
                                              column.key,
                                              value,
                                              checked
                                            )
                                          }
                                          className={"hover:bg-gray-800"}
                                        >
                                          {value}
                                        </DropdownMenuCheckboxItem>
                                      ))}

                                    {column.key === "orderStatus" &&
                                      filterOptions.orderStatus.map((value) => (
                                        <DropdownMenuCheckboxItem
                                          key={`${column.key}-${value}`}
                                          checked={(
                                            columnFilters[column.key] || []
                                          ).includes(value)}
                                          onCheckedChange={(checked) =>
                                            handleColumnFilterChange(
                                              column.key,
                                              value,
                                              checked
                                            )
                                          }
                                          className={"hover:bg-gray-800"}
                                        >
                                          {value}
                                        </DropdownMenuCheckboxItem>
                                      ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </TableHead>
                        ))}
                        <TableHead className="w-[100px] py-1 px-1 text-xs">
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
                              No orders found
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
                                  className="py-2 px-2 text-xs"
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
                              <TableCell className="py-2 px-2 text-xs">
                                <div className="flex items-center gap-2">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="cursor-pointer h-7 w-7 p-0"
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
                                  </TooltipProvider>

                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="cursor-pointer h-7 w-7 p-0"
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
                                  </TooltipProvider>
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
                <div className="flex items-center justify-between px-4 py-4 border-t">
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
                      className="dark:bg-gray-800"
                    >
                      <SelectTrigger className="w-[70px]">
                        <SelectValue placeholder="10" />
                      </SelectTrigger>
                      <SelectContent className={"dark:bg-gray-800"}>
                        <SelectItem
                          value="5"
                          className=" dark:bg-gray-800 dark:hover:bg-gray-700"
                        >
                          5
                        </SelectItem>
                        <SelectItem
                          value="10"
                          className="dark:bg-gray-800 dark:hover:bg-gray-700"
                        >
                          10
                        </SelectItem>
                        <SelectItem
                          value="20"
                          className="dark:bg-gray-800 dark:hover:bg-gray-700"
                        >
                          20
                        </SelectItem>
                        <SelectItem
                          value="50"
                          className="dark:bg-gray-800 dark:hover:bg-gray-700"
                        >
                          50
                        </SelectItem>
                        <SelectItem
                          value={`${totalOrders}`}
                          className="dark:bg-gray-800 dark:hover:bg-gray-700"
                        >
                          All
                        </SelectItem>
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

                {/* Total Active Orders Summary */}
                <div className="px-4 py-3 border-t bg-gray-50 dark:bg-gray-800">
                  <div className="flex justify-center items-center">
                    <div className="font-medium text-sm text-center">
                      Total Active Orders:{" "}
                      <span className="dark:text-white font-bold text-lg">
                        {totalOrders}
                      </span>
                    </div>
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
