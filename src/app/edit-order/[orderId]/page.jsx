"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { CalendarIcon, Clock, Loader2, X } from "lucide-react";
import Navbar from "@/components/shared/navbar";
import { toast } from "sonner";

// Searchable select component
function SearchableSelect({ options, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);

  // Add a default empty array if options is undefined
  const safeOptions = options || [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between dark:bg-gray-700 dark:text-white dark:border-gray-600"
        >
          {value ? value : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 dark:bg-gray-800">
        <Command className="dark:bg-gray-800">
          <CommandInput
            placeholder="Search..."
            className="h-9 dark:bg-gray-700 dark:text-white pl-3"
          />
          <CommandList>
            <CommandEmpty className="py-2 text-center text-sm dark:text-gray-400">
              No results found.
            </CommandEmpty>
            <CommandGroup className="max-h-[200px] overflow-auto">
              {safeOptions.map((option) => (
                <CommandItem
                  key={option}
                  onSelect={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                  className="cursor-pointer dark:text-white dark:hover:bg-gray-700"
                >
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function EditOrderPage() {
  const params = useParams();
  const router = useRouter();

  const orderId = params?.orderId;
  console.log("orders", orderId);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Get current UK date and time
  const getCurrentUKDateTime = () => {
    // Create a date object with the current time
    const now = new Date();

    // Format the date in UK format (en-GB locale)
    const ukDate = now.toLocaleDateString("en-GB", {
      timeZone: "Europe/London",
    });

    // Format the time in UK format (24-hour)
    const ukTime = now.toLocaleTimeString("en-GB", {
      timeZone: "Europe/London",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    // Parse the formatted date back to a Date object for the date pickers
    const [day, month, year] = ukDate.split("/");
    const dateObj = new Date(year, month - 1, day);

    return {
      date: dateObj,
      time: ukTime,
      formattedDate: ukDate, // DD/MM/YYYY format
    };
  };

  // Parse date string to Date object
  const parseDate = (dateString) => {
    if (!dateString) return null;

    // If it's already a Date object
    if (dateString instanceof Date) return dateString;

    // Try to parse ISO string
    if (typeof dateString === "string") {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) return date;

      // Try to parse UK format (DD/MM/YYYY)
      const [day, month, year] = dateString.split("/");
      if (day && month && year) {
        return new Date(year, month - 1, day);
      }
    }

    return null;
  };

  const [formData, setFormData] = useState({
    entryDate: getCurrentUKDateTime().date,
    entryTime: getCurrentUKDateTime().time,
    registeration: "",
    enquiryType: "",
    orderDate: getCurrentUKDateTime().date,
    collectionDate: getCurrentUKDateTime().date,
    collectionTime: getCurrentUKDateTime().time,
    salesExecutive: "",
    customer: "",
    location: "",
    isPctSheetReceivedWithinTime: "",
    pctStatus: "",
    orderStatus: "",
    isShowUp: "",
    isDeal: "",
    cancellationDate: getCurrentUKDateTime().date,
    reasonForAction: "",
    reasonDetail: "",
    isLossDeal: "",
  });

  const [errors, setErrors] = useState({});
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [firstError, setFirstError] = useState({ field: "", message: "" });

  // Initialize options state with default empty objects for each field
  const [options, setOptions] = useState({
    enquiryType: [],
    salesExecutive: [],
    location: [],
    isPctSheetReceivedWithinTime: [],
    pctStatus: [],
    orderStatus: [],
    isShowUp: [],
    isDeal: [],
    reasonForAction: [],
    isLossDeal: [],
  });

  // Fetch order data and options
  useEffect(() => {
    const fetchOrderAndOptions = async () => {
      try {
        setLoading(true);

        // Fetch filter options
        const optionsResponse = await axios.get("/api/filter-options");
        setOptions(optionsResponse.data);

        // Fetch order data
        const orderResponse = await axios.get(`/api/orders/${orderId}`);

        if (orderResponse.data.success && orderResponse.data.data) {
          const orderData = orderResponse.data.data;

          // Parse dates from strings to Date objects
          const parsedData = {
            ...orderData,
            entryDate: parseDate(orderData.entryDate),
            orderDate: parseDate(orderData.orderDate),
            collectionDate: parseDate(orderData.collectionDate),
            cancellationDate: parseDate(orderData.cancellationDate),
          };

          setFormData(parsedData);
        } else {
          toast.error("Failed to load order data");
          router.push("/view-orders");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load order data");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderAndOptions();
    }
  }, [orderId, router]);

  // Handle input changes
  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });

    // Clear error when field is updated
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null,
      });
    }
  };

  // Handle date changes
  const handleDateChange = (field, date) => {
    setFormData({
      ...formData,
      [field]: date,
    });

    // Clear error when field is updated
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null,
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    let firstErrorField = null;
    let firstErrorMessage = "";

    // Registration validation - uppercase, no spaces or special chars
    if (!formData.registeration) {
      newErrors.registeration = "Registration is required";
      if (!firstErrorField) {
        firstErrorField = "registeration";
        firstErrorMessage = "Registration is required";
      }
    } else {
      const registerationRegex = /^[A-Z0-9]+$/;
      if (!registerationRegex.test(formData.registeration)) {
        newErrors.registeration =
          "Registration must contain only uppercase letters and numbers, no spaces or special characters";
        if (!firstErrorField) {
          firstErrorField = "registeration";
          firstErrorMessage =
            "Registration must contain only uppercase letters and numbers, no spaces or special characters";
        }
      }
    }

    // Customer validation - at least 3 chars
    if (!formData.customer) {
      newErrors.customer = "Customer is required";
      if (!firstErrorField) {
        firstErrorField = "customer";
        firstErrorMessage = "Customer is required";
      }
    } else if (formData.customer.length < 3) {
      newErrors.customer = "Customer name must be at least 3 characters";
      if (!firstErrorField) {
        firstErrorField = "customer";
        firstErrorMessage = "Customer name must be at least 3 characters";
      }
    }

    // Required fields
    const requiredFields = [
      { field: "entryDate", label: "Entry date" },
      { field: "entryTime", label: "Entry time" },
      { field: "enquiryType", label: "Enquiry type" },
      { field: "orderDate", label: "Order date" },
      { field: "collectionDate", label: "Collection date" },
      { field: "collectionTime", label: "Collection time" },
      { field: "salesExecutive", label: "Sales executive" },
      { field: "location", label: "Location" },
      {
        field: "isPctSheetReceivedWithinTime",
        label: "PCT sheet received status",
      },
      { field: "pctStatus", label: "PCT status" },
      { field: "orderStatus", label: "Order status" },
      { field: "isShowUp", label: "Show up status" },
      { field: "isDeal", label: "Deal status" },
      { field: "reasonForAction", label: "Reason for action" },
      { field: "isLossDeal", label: "Loss deal status" },
    ];

    requiredFields.forEach(({ field, label }) => {
      if (!formData[field]) {
        newErrors[field] = `${label} is required`;
        if (!firstErrorField) {
          firstErrorField = field;
          firstErrorMessage = `${label} is required`;
        }
      }
    });

    // Date validations
    if (formData.orderDate && formData.entryDate) {
      const orderDateStr = format(formData.orderDate, "yyyy-MM-dd");
      const entryDateStr = format(formData.entryDate, "yyyy-MM-dd");

      if (orderDateStr > entryDateStr) {
        newErrors.orderDate = "Order date cannot be later than entry date";
        if (!firstErrorField) {
          firstErrorField = "orderDate";
          firstErrorMessage = "Order date cannot be later than entry date";
        }
      }
    }

    if (formData.collectionDate && formData.orderDate) {
      const collectionDateStr = format(formData.collectionDate, "yyyy-MM-dd");
      const orderDateStr = format(formData.orderDate, "yyyy-MM-dd");

      if (collectionDateStr < orderDateStr) {
        newErrors.collectionDate =
          "Collection date cannot be earlier than order date";
        if (!firstErrorField) {
          firstErrorField = "collectionDate";
          firstErrorMessage =
            "Collection date cannot be earlier than order date";
        }
      }
    }

    // Validate cancellation date is not earlier than order date
    if (formData.cancellationDate && formData.orderDate) {
      const cancellationDateStr = format(
        formData.cancellationDate,
        "yyyy-MM-dd"
      );
      const orderDateStr = format(formData.orderDate, "yyyy-MM-dd");

      if (cancellationDateStr < orderDateStr) {
        newErrors.cancellationDate =
          "Cancellation date cannot be earlier than order date";
        if (!firstErrorField) {
          firstErrorField = "cancellationDate";
          firstErrorMessage =
            "Cancellation date cannot be earlier than order date";
        }
      }
    }

    setErrors(newErrors);

    // Set first error for modal
    if (firstErrorField) {
      setFirstError({
        field: firstErrorField,
        message: firstErrorMessage,
      });
      setErrorModalOpen(true);
      return false;
    }

    return true;
  };

  // Format date for MongoDB storage
  const formatDateForMongoDB = (date) => {
    if (!date) return null;
    // Return the date object directly which will be converted to ISODate in MongoDB
    return new Date(date);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        setSubmitting(true);

        // If reasonDetail is empty, set it to "Not Given"
        const finalFormData = {
          ...formData,
          reasonDetail: formData.reasonDetail || "Not Given",
        };

        // Format dates for MongoDB storage
        const formattedData = {
          ...finalFormData,
          entryDate: formatDateForMongoDB(finalFormData.entryDate),
          orderDate: formatDateForMongoDB(finalFormData.orderDate),
          collectionDate: formatDateForMongoDB(finalFormData.collectionDate),
          cancellationDate: formatDateForMongoDB(
            finalFormData.cancellationDate
          ),
        };

        // Update order data
        const response = await axios.put(
          `/api/orders/${orderId}`,
          formattedData
        );

        toast.success("Order updated successfully");

        // Redirect back to orders page
        router.push("/view-orders");
      } catch (error) {
        console.error("Error updating order:", error);
        toast.error("Failed to update order");
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium">Loading order data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mt-6 mx-auto">
          <div className="text-center py-6">
            <h1 className="text-2xl md:text-3xl font-bold dark:text-white">
              Edit Order
            </h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Entry Date */}
              <Card className="dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg dark:text-white">
                    Entry Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="entryDate" className="dark:text-gray-300">
                      Entry Date*
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.entryDate
                            ? format(formData.entryDate, "dd/MM/yyyy")
                            : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 dark:bg-gray-800">
                        <Calendar
                          mode="single"
                          selected={formData.entryDate}
                          onSelect={(date) =>
                            handleDateChange("entryDate", date)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="entryTime" className="dark:text-gray-300">
                      Entry Time*
                    </Label>
                    <div className="flex items-center">
                      <Input
                        id="entryTime"
                        type="time"
                        value={formData.entryTime}
                        onChange={(e) =>
                          handleChange("entryTime", e.target.value)
                        }
                        className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                      <Clock className="ml-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="registeration"
                      className="dark:text-gray-300"
                    >
                      Registration*
                    </Label>
                    <Input
                      id="registeration"
                      value={formData.registeration}
                      onChange={(e) =>
                        handleChange(
                          "registeration",
                          e.target.value.toUpperCase()
                        )
                      }
                      placeholder="ABC123"
                      className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="enquiryType" className="dark:text-gray-300">
                      Enquiry Type*
                    </Label>
                    <SearchableSelect
                      options={options.enquiryType}
                      value={formData.enquiryType}
                      onChange={(value) => handleChange("enquiryType", value)}
                      placeholder="Select enquiry type"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Order Details */}
              <Card className="dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg dark:text-white">
                    Order Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="orderDate" className="dark:text-gray-300">
                      Order Date*
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.orderDate
                            ? format(formData.orderDate, "dd/MM/yyyy")
                            : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 dark:bg-gray-800">
                        <Calendar
                          mode="single"
                          selected={formData.orderDate}
                          onSelect={(date) =>
                            handleDateChange("orderDate", date)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="collectionDate"
                      className="dark:text-gray-300"
                    >
                      Collection Date*
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.collectionDate
                            ? format(formData.collectionDate, "dd/MM/yyyy")
                            : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 dark:bg-gray-800">
                        <Calendar
                          mode="single"
                          selected={formData.collectionDate}
                          onSelect={(date) =>
                            handleDateChange("collectionDate", date)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="collectionTime"
                      className="dark:text-gray-300"
                    >
                      Collection Time*
                    </Label>
                    <div className="flex items-center">
                      <Input
                        id="collectionTime"
                        type="time"
                        value={formData.collectionTime}
                        onChange={(e) =>
                          handleChange("collectionTime", e.target.value)
                        }
                        className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                      <Clock className="ml-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="salesExecutive"
                      className="dark:text-gray-300"
                    >
                      Sales Executive*
                    </Label>
                    <SearchableSelect
                      options={options.salesExecutive}
                      value={formData.salesExecutive}
                      onChange={(value) =>
                        handleChange("salesExecutive", value)
                      }
                      placeholder="Select sales executive"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="dark:text-gray-300">
                      Location*
                    </Label>
                    <SearchableSelect
                      options={options.location}
                      value={formData.location}
                      onChange={(value) => handleChange("location", value)}
                      placeholder="Select location"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Customer Details */}
              <Card className="dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg dark:text-white">
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer" className="dark:text-gray-300">
                      Customer*
                    </Label>
                    <Input
                      id="customer"
                      value={formData.customer}
                      onChange={(e) => handleChange("customer", e.target.value)}
                      placeholder="Customer name"
                      className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* PCT Details */}
              <Card className="dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg dark:text-white">
                    PCT Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="isPctSheetReceivedWithinTime"
                      className="dark:text-gray-300"
                    >
                      PCT Sheet Received Within Time*
                    </Label>
                    <SearchableSelect
                      options={options.isPctSheetReceivedWithinTime}
                      value={formData.isPctSheetReceivedWithinTime}
                      onChange={(value) =>
                        handleChange("isPctSheetReceivedWithinTime", value)
                      }
                      placeholder="Select option"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pctStatus" className="dark:text-gray-300">
                      PCT Status*
                    </Label>
                    <SearchableSelect
                      options={options.pctStatus}
                      value={formData.pctStatus}
                      onChange={(value) => handleChange("pctStatus", value)}
                      placeholder="Select PCT status"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Order Status */}
              <Card className="dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg dark:text-white">
                    Order Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="orderStatus" className="dark:text-gray-300">
                      Order Status*
                    </Label>
                    <SearchableSelect
                      options={options.orderStatus}
                      value={formData.orderStatus}
                      onChange={(value) => handleChange("orderStatus", value)}
                      placeholder="Select order status"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="isShowUp" className="dark:text-gray-300">
                      Show Up*
                    </Label>
                    <SearchableSelect
                      options={options.isShowUp}
                      value={formData.isShowUp}
                      onChange={(value) => handleChange("isShowUp", value)}
                      placeholder="Select option"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="isDeal" className="dark:text-gray-300">
                      Is Deal*
                    </Label>
                    <SearchableSelect
                      options={options.isDeal}
                      value={formData.isDeal}
                      onChange={(value) => handleChange("isDeal", value)}
                      placeholder="Select option"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Cancellation Details */}
              <Card className="dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg dark:text-white">
                    Cancellation Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="cancellationDate"
                      className="dark:text-gray-300"
                    >
                      Cancellation Date*
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.cancellationDate
                            ? format(formData.cancellationDate, "dd/MM/yyyy")
                            : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 dark:bg-gray-800">
                        <Calendar
                          mode="single"
                          selected={formData.cancellationDate}
                          onSelect={(date) =>
                            handleDateChange("cancellationDate", date)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="reasonForAction"
                      className="dark:text-gray-300"
                    >
                      Reason For Action*
                    </Label>
                    <SearchableSelect
                      options={options.reasonForAction}
                      value={formData.reasonForAction}
                      onChange={(value) =>
                        handleChange("reasonForAction", value)
                      }
                      placeholder="Select reason"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="reasonDetail"
                      className="dark:text-gray-300"
                    >
                      Reason Detail
                    </Label>
                    <Textarea
                      id="reasonDetail"
                      value={formData.reasonDetail}
                      onChange={(e) =>
                        handleChange("reasonDetail", e.target.value)
                      }
                      placeholder="Enter reason details or leave empty for 'Not Given'"
                      className="min-h-[80px] dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="isLossDeal" className="dark:text-gray-300">
                      Is Loss Deal*
                    </Label>
                    <SearchableSelect
                      options={options.isLossDeal}
                      value={formData.isLossDeal}
                      onChange={(value) => handleChange("isLossDeal", value)}
                      placeholder="Select option"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/view-orders")}
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="lg"
                className="bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 cursor-pointer"
                disabled={submitting}
              >
                {submitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update Order
              </Button>
            </div>
          </form>

          {/* Error Modal */}
          <Dialog open={errorModalOpen} onOpenChange={setErrorModalOpen}>
            <DialogContent className="sm:max-w-md dark:bg-gray-800">
              <DialogHeader>
                <DialogTitle className="flex items-center text-red-500 dark:text-red-400">
                  <span>Validation Error</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setErrorModalOpen(false)}
                    className="ml-auto h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </DialogTitle>
              </DialogHeader>
              <div className="py-4 dark:text-white">{firstError.message}</div>
              <DialogFooter>
                <Button
                  onClick={() => setErrorModalOpen(false)}
                  className="w-full dark:bg-primary dark:hover:bg-primary/90"
                >
                  OK
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
