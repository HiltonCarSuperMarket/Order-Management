"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { format, subDays, isBefore } from "date-fns";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { CalendarIcon, Clock, Loader2 } from "lucide-react";
import Navbar from "@/components/shared/navbar";
import { toast } from "sonner";

// Searchable select component
function SearchableSelect({ options, value, onChange, placeholder, disabled }) {
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
          className="w-full justify-between border-gray-300 bg-white hover:bg-gray-50 hover:border-indigo-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          disabled={disabled}
        >
          {value ? value : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 shadow-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
        <Command className="bg-white dark:bg-gray-800 rounded-md">
          <CommandInput
            placeholder="Search..."
            className="h-9 border-0 focus:ring-0 bg-transparent text-gray-700 dark:bg-gray-700 dark:text-white pl-3"
          />
          <CommandList>
            <CommandEmpty className="py-2 text-center text-sm text-gray-500 dark:text-gray-400">
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
                  className="cursor-pointer text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 dark:text-white dark:hover:bg-gray-700"
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
    registration: "",
    enquiryType: "",
    openingDate: getCurrentUKDateTime().date,
    closingDate: null,
    closingTime: getCurrentUKDateTime().time,
    salesExecutive: "",
    customer: "",
    location: "",
    isPctSheetReceivedWithinTime: "",
    pctStatus: "",
    orderStatus: "Active",
    isShowUp: null,
    isDeal: null,
    reasonForAction: null,
    reasonDetail: null,
    isLossDeal: null,
  });

  const [errors, setErrors] = useState({});
  // Error modal state removed in favor of toast notifications

  // Initialize options state with default empty objects for each field
  const [options, setOptions] = useState({
    enquiryType: [],
    salesExecutive: [],
    location: [],
    isPctSheetReceivedWithinTime: [],
    pctStatus: [],
    orderStatus: ["Active", "Inactive"],
    isShowUp: [],
    isDeal: [],
    reasonForAction: [],
    isLossDeal: [],
  });

  // Filtered reasonForAction options based on isShowUp and isDeal values
  const filteredReasonForActionOptions = () => {
    if (!options.reasonForAction || !options.reasonForAction.length) {
      return [];
    }

    // If isShowUp = Yes and isDeal = No, only show options starting with "Onsite"
    if (formData.isShowUp === "Yes" && formData.isDeal === "No") {
      return options.reasonForAction.filter((option) =>
        option.startsWith("Onsite")
      );
    }

    // If isShowUp = No and isDeal = No, only show options starting with "Phone"
    if (formData.isShowUp === "No" && formData.isDeal === "No") {
      return options.reasonForAction.filter((option) =>
        option.startsWith("Phone")
      );
    }

    // Default: return all options
    return options.reasonForAction;
  };

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
            openingDate: parseDate(orderData.openingDate),
            closingDate: parseDate(orderData.closingDate),
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
    const updatedFormData = {
      ...formData,
      [field]: value,
    };

    // If changing order status to Active, reset the additional fields to null
    if (field === "orderStatus" && value === "Active") {
      updatedFormData.isShowUp = null;
      updatedFormData.isDeal = null;
      updatedFormData.reasonForAction = null;
      updatedFormData.reasonDetail = null;
      updatedFormData.isLossDeal = null;
    }

    setFormData(updatedFormData);

    // Clear error when field is updated
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null,
      });
    }
  };

  // Handle changes for isShowUp field with validation rules
  const handleShowUpChange = (value) => {
    const updatedFormData = { ...formData, isShowUp: value };

    // Rule 1: if isShowUp = 'No' then automatically fill isDeal = 'No' and make it disable
    if (value === "No") {
      updatedFormData.isDeal = "No";

      // If isDeal is changing to 'No', we need to update dependent fields
      if (formData.isDeal === "Yes") {
        updatedFormData.reasonForAction = null;
        updatedFormData.isLossDeal = null;
      }
    }

    // Reset reasonForAction when isShowUp changes to ensure it matches the new filtering rules
    updatedFormData.reasonForAction = null;

    setFormData(updatedFormData);

    // Clear error when field is updated
    if (errors.isShowUp) {
      setErrors({
        ...errors,
        isShowUp: null,
      });
    }
  };

  // Handle changes for isDeal field with validation rules
  const handleIsDealChange = (value) => {
    // Don't allow changing isDeal if isShowUp is 'No'
    if (formData.isShowUp === "No" && value !== "No") {
      toast.error("Deal must be 'No' when Show Up is 'No'");
      return;
    }

    const updatedFormData = { ...formData, isDeal: value };

    // Rule 2: if isDeal = 'Yes' then automatically fill reasonForAction = 'Sold' and isLossDeal = 'No'
    if (value === "Yes") {
      updatedFormData.reasonForAction = "Sold";
      updatedFormData.isLossDeal = "No";
    } else if (value === "No") {
      // If changing from Yes to No, reset reasonForAction if it was "Sold"
      if (formData.reasonForAction === "Sold") {
        updatedFormData.reasonForAction = null;
      }
      // Reset isLossDeal if it was set by the Yes condition
      if (formData.isLossDeal === "No" && formData.isDeal === "Yes") {
        updatedFormData.isLossDeal = null;
      }
    }

    setFormData(updatedFormData);

    // Clear error when field is updated
    if (errors.isDeal) {
      setErrors({
        ...errors,
        isDeal: null,
      });
    }
  };

  // Handle changes for reasonForAction field with validation rules
  const handleReasonForActionChange = (value) => {
    // Rule 3: if isDeal = 'No' then reasonForAction can never be "Sold"
    if (formData.isDeal === "No" && value === "Sold") {
      toast.error("Reason for action cannot be 'Sold' when Deal is 'No'");
      return;
    }

    // If isDeal is 'Yes', reasonForAction must be 'Sold'
    if (formData.isDeal === "Yes" && value !== "Sold") {
      toast.error("Reason for action must be 'Sold' when Deal is 'Yes'");
      return;
    }

    setFormData({
      ...formData,
      reasonForAction: value,
    });

    // Clear error when field is updated
    if (errors.reasonForAction) {
      setErrors({
        ...errors,
        reasonForAction: null,
      });
    }
  };

  // Handle changes for isLossDeal field with validation rules
  const handleLossDealChange = (value) => {
    // Rule 5: if isDeal = No, then isLossDeal can either Yes or No but not Sold
    if (formData.isDeal === "No" && value === "Sold") {
      toast.error("Loss Deal cannot be 'Sold' when Deal is 'No'");
      return;
    }

    // If isDeal is 'Yes', isLossDeal must be 'No'
    if (formData.isDeal === "Yes" && value !== "No") {
      toast.error("Loss Deal must be 'No' when Deal is 'Yes'");
      return;
    }

    setFormData({
      ...formData,
      isLossDeal: value,
    });

    // Clear error when field is updated
    if (errors.isLossDeal) {
      setErrors({
        ...errors,
        isLossDeal: null,
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
    if (!formData.registration) {
      newErrors.registration = "Registration is required";
      if (!firstErrorField) {
        firstErrorField = "registration";
        firstErrorMessage = "Registration is required";
      }
    } else {
      const registrationRegex = /^[A-Z0-9]+$/;
      if (!registrationRegex.test(formData.registration)) {
        newErrors.registration =
          "Registration must contain only uppercase letters and numbers, no spaces or special characters";
        if (!firstErrorField) {
          firstErrorField = "registration";
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

    // Required fields for all orders
    const requiredFields = [
      { field: "entryDate", label: "Entry date" },
      { field: "entryTime", label: "Entry time" },
      { field: "enquiryType", label: "Enquiry type" },
      { field: "openingDate", label: "Order date" },
      { field: "salesExecutive", label: "Sales executive" },
      { field: "location", label: "Location" },
      { field: "orderStatus", label: "Order status" },
    ];

    // Additional required fields for inactive orders
    const inactiveRequiredFields = [
      { field: "closingDate", label: "Closing date" },
      { field: "closingTime", label: "Closing time" },
      {
        field: "isPctSheetReceivedWithinTime",
        label: "PCT sheet received status",
      },
      { field: "pctStatus", label: "PCT status" },
      { field: "isShowUp", label: "Show up status" },
      { field: "isDeal", label: "Deal status" },
      { field: "reasonForAction", label: "Reason for action" },
      { field: "isLossDeal", label: "Loss deal status" },
    ];

    // Check required fields for all orders
    requiredFields.forEach(({ field, label }) => {
      if (!formData[field]) {
        newErrors[field] = `${label} is required`;
        if (!firstErrorField) {
          firstErrorField = field;
          firstErrorMessage = `${label} is required`;
        }
      }
    });

    // Check additional required fields for inactive orders
    if (formData.orderStatus === "Inactive") {
      inactiveRequiredFields.forEach(({ field, label }) => {
        if (!formData[field]) {
          newErrors[field] = `${label} is required`;
          if (!firstErrorField) {
            firstErrorField = field;
            firstErrorMessage = `${label} is required`;
          }
        }
      });
    }

    // Date validations
    if (formData.openingDate && formData.entryDate) {
      const openingDateStr = format(formData.openingDate, "yyyy-MM-dd");
      const entryDateStr = format(formData.entryDate, "yyyy-MM-dd");

      if (openingDateStr > entryDateStr) {
        newErrors.openingDate = "Order date cannot be later than entry date";
        if (!firstErrorField) {
          firstErrorField = "openingDate";
          firstErrorMessage = "Order date cannot be later than entry date";
        }
      }
    }

    if (formData.closingDate && formData.openingDate) {
      const closingDateStr = format(formData.closingDate, "yyyy-MM-dd");
      const openingDateStr = format(formData.openingDate, "yyyy-MM-dd");

      if (closingDateStr < openingDateStr) {
        newErrors.closingDate =
          "Closing date cannot be earlier than order date";
        if (!firstErrorField) {
          firstErrorField = "closingDate";
          firstErrorMessage = "Closing date cannot be earlier than order date";
        }
      }
    }

    // Additional validation for inactive orders
    if (formData.orderStatus === "Inactive") {
      // 1. If order is inactive, closing date can't be in the future
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0); // Reset time to start of day

      if (formData.closingDate) {
        const closingDate = new Date(formData.closingDate);
        closingDate.setHours(0, 0, 0, 0); // Reset time to start of day

        if (closingDate > currentDate) {
          newErrors.closingDate =
            "Closing date cannot be in the future for inactive orders";
          if (!firstErrorField) {
            firstErrorField = "closingDate";
            firstErrorMessage =
              "Closing date cannot be in the future for inactive orders";
          }
        }

        // 2. Closing date can't be more than two days in the past
        const twoDaysAgo = subDays(currentDate, 2);
        if (isBefore(closingDate, twoDaysAgo)) {
          newErrors.closingDate =
            "Closing date cannot be more than two days in the past for inactive orders";
          if (!firstErrorField) {
            firstErrorField = "closingDate";
            firstErrorMessage =
              "Closing date cannot be more than two days in the past for inactive orders";
          }
        }
      }

      // 3. If order is inactive, isPctSheetReceivedWithinTime and pctStatus should not be "waiting"
      if (formData.isPctSheetReceivedWithinTime === "Waiting") {
        newErrors.isPctSheetReceivedWithinTime =
          "PCT sheet received status cannot be 'Waiting' for inactive orders";
        if (!firstErrorField) {
          firstErrorField = "isPctSheetReceivedWithinTime";
          firstErrorMessage =
            "PCT sheet received status cannot be 'Waiting' for inactive orders";
        }
      }

      if (formData.pctStatus === "Waiting") {
        newErrors.pctStatus =
          "PCT status cannot be 'Waiting' for inactive orders";
        if (!firstErrorField) {
          firstErrorField = "pctStatus";
          firstErrorMessage =
            "PCT status cannot be 'Waiting' for inactive orders";
        }
      }

      // Additional validation rules for Inactive Orders

      // Rule 1: If isShowUp = 'No', isDeal must be 'No'
      if (formData.isShowUp === "No" && formData.isDeal !== "No") {
        newErrors.isDeal = "Deal must be 'No' when Show Up is 'No'";
        if (!firstErrorField) {
          firstErrorField = "isDeal";
          firstErrorMessage = "Deal must be 'No' when Show Up is 'No'";
        }
      }

      // Rule 2: If isDeal = 'Yes', reasonForAction must be 'Sold' and isLossDeal must be 'No'
      if (formData.isDeal === "Yes") {
        if (formData.reasonForAction !== "Sold") {
          newErrors.reasonForAction =
            "Reason for action must be 'Sold' when Deal is 'Yes'";
          if (!firstErrorField) {
            firstErrorField = "reasonForAction";
            firstErrorMessage =
              "Reason for action must be 'Sold' when Deal is 'Yes'";
          }
        }

        if (formData.isLossDeal !== "No") {
          newErrors.isLossDeal = "Loss Deal must be 'No' when Deal is 'Yes'";
          if (!firstErrorField) {
            firstErrorField = "isLossDeal";
            firstErrorMessage = "Loss Deal must be 'No' when Deal is 'Yes'";
          }
        }
      }

      // Rule 3: If isDeal = 'No', reasonForAction cannot be 'Sold'
      if (formData.isDeal === "No" && formData.reasonForAction === "Sold") {
        newErrors.reasonForAction =
          "Reason for action cannot be 'Sold' when Deal is 'No'";
        if (!firstErrorField) {
          firstErrorField = "reasonForAction";
          firstErrorMessage =
            "Reason for action cannot be 'Sold' when Deal is 'No'";
        }
      }

      // Rule 5: If isDeal = 'No', isLossDeal cannot be 'Sold'
      if (formData.isDeal === "No" && formData.isLossDeal === "Sold") {
        newErrors.isLossDeal = "Loss Deal cannot be 'Sold' when Deal is 'No'";
        if (!firstErrorField) {
          firstErrorField = "isLossDeal";
          firstErrorMessage = "Loss Deal cannot be 'Sold' when Deal is 'No'";
        }
      }
    }

    setErrors(newErrors);

    // Show first error as toast notification
    if (firstErrorField) {
      toast.error(firstErrorMessage);
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

        // Prepare form data based on order status
        let finalFormData = { ...formData };

        if (finalFormData.orderStatus === "Active") {
          // If order is Active, set additional fields to null
          finalFormData = {
            ...finalFormData,
            isShowUp: null,
            isDeal: null,
            reasonForAction: null,
            reasonDetail: null,
            isLossDeal: null,
          };
        } else {
          // If order is Inactive and reasonDetail is empty, set it to "No Reason Mentioned"
          finalFormData = {
            ...finalFormData,
            reasonDetail: finalFormData.reasonDetail || "No Reason Mentioned",
          };
        }

        // Format dates for MongoDB storage
        const formattedData = {
          ...finalFormData,
          entryDate: formatDateForMongoDB(finalFormData.entryDate),
          openingDate: formatDateForMongoDB(finalFormData.openingDate),
          closingDate: formatDateForMongoDB(finalFormData.closingDate),
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 dark:text-indigo-400" />
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
            Loading order data...
          </p>
        </div>
      </div>
    );
  }

  // Determine if we should show the additional fields for inactive orders
  const showInactiveFields = formData.orderStatus === "Inactive";

  return (
    <div className="text-sm">
      <Navbar />
      <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mt-6 mx-auto">
          <div className="text-center py-6">
            <h1 className="text-2xl md:text-3xl font-bold text-indigo-700 dark:text-white">
              Edit Order
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Update order details and status
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Entry Date */}
              <Card className="dark:bg-gray-800 pt-0 bg-white border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden rounded-lg">
                <div className="h-1 bg-indigo-500 dark:bg-gray-700"></div>
                <CardHeader className="bg-white dark:bg-gray-800">
                  <CardTitle className="text-lg text-indigo-700 dark:text-white">
                    Entry Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="entryDate"
                      className="text-gray-700 dark:text-gray-300 font-medium"
                    >
                      Entry Date*
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal border-gray-300 bg-white hover:bg-gray-50 hover:border-indigo-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-indigo-500 dark:text-gray-400" />
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
                    {errors.entryDate && (
                      <p className="text-sm text-red-500">{errors.entryDate}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="entryTime"
                      className="text-gray-700 dark:text-gray-300 font-medium"
                    >
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
                        className="border-gray-300 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                      <Clock className="ml-2 h-4 w-4 text-indigo-500 dark:text-gray-400" />
                    </div>
                    {errors.entryTime && (
                      <p className="text-sm text-red-500">{errors.entryTime}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="registration"
                      className="text-gray-700 dark:text-gray-300 font-medium"
                    >
                      Registration*
                    </Label>
                    <Input
                      id="registration"
                      value={formData.registration}
                      onChange={(e) =>
                        handleChange(
                          "registration",
                          e.target.value.toUpperCase()
                        )
                      }
                      placeholder="ABC123"
                      className="border-gray-300 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                    {errors.registration && (
                      <p className="text-sm text-red-500">
                        {errors.registration}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="enquiryType"
                      className="text-gray-700 dark:text-gray-300 font-medium"
                    >
                      Enquiry Type*
                    </Label>
                    <SearchableSelect
                      options={options.enquiryType}
                      value={formData.enquiryType}
                      onChange={(value) => handleChange("enquiryType", value)}
                      placeholder="Select enquiry type"
                    />
                    {errors.enquiryType && (
                      <p className="text-sm text-red-500">
                        {errors.enquiryType}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Order Details */}
              <Card className="dark:bg-gray-800 pt-0 bg-white border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden rounded-lg">
                <div className="h-1 bg-purple-500 dark:bg-gray-700"></div>
                <CardHeader className="bg-white dark:bg-gray-800">
                  <CardTitle className="text-lg text-purple-700 dark:text-white">
                    Order Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="openingDate"
                      className="text-gray-700 dark:text-gray-300 font-medium"
                    >
                      Order Date*
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal border-gray-300 bg-white hover:bg-gray-50 hover:border-purple-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-purple-500 dark:text-gray-400" />
                          {formData.openingDate
                            ? format(formData.openingDate, "dd/MM/yyyy")
                            : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 dark:bg-gray-800">
                        <Calendar
                          mode="single"
                          selected={formData.openingDate}
                          onSelect={(date) =>
                            handleDateChange("openingDate", date)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.openingDate && (
                      <p className="text-sm text-red-500">
                        {errors.openingDate}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="closingDate"
                      className="text-gray-700 dark:text-gray-300 font-medium"
                    >
                      {formData.orderStatus === "Active"
                        ? "Collection Date (Optional)"
                        : "Closing Date*"}
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal border-gray-300 bg-white hover:bg-gray-50 hover:border-purple-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-purple-500 dark:text-gray-400" />
                          {formData.closingDate
                            ? format(formData.closingDate, "dd/MM/yyyy")
                            : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 dark:bg-gray-800">
                        <Calendar
                          mode="single"
                          selected={formData.closingDate}
                          onSelect={(date) =>
                            handleDateChange("closingDate", date)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.closingDate && (
                      <p className="text-sm text-red-500">
                        {errors.closingDate}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="closingTime"
                      className="text-gray-700 dark:text-gray-300 font-medium"
                    >
                      {formData.orderStatus === "Active"
                        ? "Collection Time (Optional)"
                        : "Closing Time*"}
                    </Label>
                    <div className="flex items-center">
                      <Input
                        id="closingTime"
                        type="time"
                        value={formData.closingTime}
                        onChange={(e) =>
                          handleChange("closingTime", e.target.value)
                        }
                        className="border-gray-300 bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                      <Clock className="ml-2 h-4 w-4 text-purple-500 dark:text-gray-400" />
                    </div>
                    {errors.closingTime && (
                      <p className="text-sm text-red-500">
                        {errors.closingTime}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="salesExecutive"
                      className="text-gray-700 dark:text-gray-300 font-medium"
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
                    {errors.salesExecutive && (
                      <p className="text-sm text-red-500">
                        {errors.salesExecutive}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="location"
                      className="text-gray-700 dark:text-gray-300 font-medium"
                    >
                      Location*
                    </Label>
                    <SearchableSelect
                      options={options.location}
                      value={formData.location}
                      onChange={(value) => handleChange("location", value)}
                      placeholder="Select location"
                    />
                    {errors.location && (
                      <p className="text-sm text-red-500">{errors.location}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Customer Details */}
              <Card className="dark:bg-gray-800 pt-0 bg-white border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden rounded-lg">
                <div className="h-1 bg-teal-500 dark:bg-gray-700"></div>
                <CardHeader className="bg-white dark:bg-gray-800">
                  <CardTitle className="text-lg text-teal-700 dark:text-white">
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="customer"
                      className="text-gray-700 dark:text-gray-300 font-medium"
                    >
                      Customer*
                    </Label>
                    <Input
                      id="customer"
                      value={formData.customer}
                      onChange={(e) => handleChange("customer", e.target.value)}
                      placeholder="Customer name"
                      className="border-gray-300 bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                    {errors.customer && (
                      <p className="text-sm text-red-500">{errors.customer}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* PCT Details */}
              <Card className="dark:bg-gray-800 pt-0 bg-white border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden rounded-lg">
                <div className="h-1 bg-amber-500 dark:bg-gray-700"></div>
                <CardHeader className="bg-white dark:bg-gray-800">
                  <CardTitle className="text-lg text-amber-700 dark:text-white">
                    PCT Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="isPctSheetReceivedWithinTime"
                      className="text-gray-700 dark:text-gray-300 font-medium"
                    >
                      {formData.orderStatus === "Active"
                        ? "PCT Sheet Received Within Time (Optional)"
                        : "PCT Sheet Received Within Time*"}
                    </Label>
                    <SearchableSelect
                      options={options.isPctSheetReceivedWithinTime}
                      value={formData.isPctSheetReceivedWithinTime}
                      onChange={(value) =>
                        handleChange("isPctSheetReceivedWithinTime", value)
                      }
                      placeholder="Select option"
                    />
                    {errors.isPctSheetReceivedWithinTime && (
                      <p className="text-sm text-red-500">
                        {errors.isPctSheetReceivedWithinTime}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="pctStatus"
                      className="text-gray-700 dark:text-gray-300 font-medium"
                    >
                      {formData.orderStatus === "Active"
                        ? "PCT Status (Optional)"
                        : "PCT Status*"}
                    </Label>
                    <SearchableSelect
                      options={options.pctStatus}
                      value={formData.pctStatus}
                      onChange={(value) => handleChange("pctStatus", value)}
                      placeholder="Select PCT status"
                    />
                    {errors.pctStatus && (
                      <p className="text-sm text-red-500">{errors.pctStatus}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Order Status */}
              <Card className="dark:bg-gray-800 pt-0 bg-white border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden rounded-lg">
                <div className="h-1 bg-rose-500 dark:bg-gray-700"></div>
                <CardHeader className="bg-white dark:bg-gray-800">
                  <CardTitle className="text-lg text-rose-700 dark:text-white">
                    Order Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="orderStatus"
                      className="text-gray-700 dark:text-gray-300 font-medium"
                    >
                      Order Status*
                    </Label>
                    <SearchableSelect
                      options={options.orderStatus}
                      value={formData.orderStatus}
                      onChange={(value) => handleChange("orderStatus", value)}
                      placeholder="Select order status"
                    />
                    {errors.orderStatus && (
                      <p className="text-sm text-red-500">
                        {errors.orderStatus}
                      </p>
                    )}
                  </div>

                  {/* Only show these fields if order status is Inactive */}
                  {showInactiveFields && (
                    <>
                      <div className="space-y-2">
                        <Label
                          htmlFor="isShowUp"
                          className="text-gray-700 dark:text-gray-300 font-medium"
                        >
                          Show Up*
                        </Label>
                        <SearchableSelect
                          options={options.isShowUp}
                          value={formData.isShowUp}
                          onChange={(value) => handleShowUpChange(value)}
                          placeholder="Select option"
                        />
                        {errors.isShowUp && (
                          <p className="text-sm text-red-500">
                            {errors.isShowUp}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="isDeal"
                          className="text-gray-700 dark:text-gray-300 font-medium"
                        >
                          Deal*
                        </Label>
                        <SearchableSelect
                          options={options.isDeal}
                          value={formData.isDeal}
                          onChange={(value) => handleIsDealChange(value)}
                          placeholder="Select option"
                          disabled={formData.isShowUp === "No"}
                        />
                        {errors.isDeal && (
                          <p className="text-sm text-red-500">
                            {errors.isDeal}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Cancellation Details - Only show if order status is Inactive */}
              {showInactiveFields && (
                <Card className="dark:bg-gray-800 pt-0 bg-white border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden rounded-lg">
                  <div className="h-1 bg-blue-500 dark:bg-gray-700"></div>
                  <CardHeader className="bg-white dark:bg-gray-800">
                    <CardTitle className="text-lg text-blue-700 dark:text-white">
                      Cancellation Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="reasonForAction"
                        className="text-gray-700 dark:text-gray-300 font-medium"
                      >
                        Reason For Action*
                      </Label>
                      <SearchableSelect
                        options={filteredReasonForActionOptions()}
                        value={formData.reasonForAction}
                        onChange={(value) => handleReasonForActionChange(value)}
                        placeholder="Select reason"
                        disabled={formData.isDeal === "Yes"}
                      />
                      {errors.reasonForAction && (
                        <p className="text-sm text-red-500">
                          {errors.reasonForAction}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="reasonDetail"
                        className="text-gray-700 dark:text-gray-300 font-medium"
                      >
                        Reason Detail
                      </Label>
                      <Textarea
                        id="reasonDetail"
                        value={formData.reasonDetail}
                        onChange={(e) =>
                          handleChange("reasonDetail", e.target.value)
                        }
                        placeholder="Enter reason details or leave empty for 'No Reason Mentioned'"
                        className="min-h-[80px] border-gray-300 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                      {errors.reasonDetail && (
                        <p className="text-sm text-red-500">
                          {errors.reasonDetail}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="isLossDeal"
                        className="text-gray-700 dark:text-gray-300 font-medium"
                      >
                        Loss Deal*
                      </Label>
                      <SearchableSelect
                        options={options.isLossDeal}
                        value={formData.isLossDeal}
                        onChange={(value) => handleLossDealChange(value)}
                        placeholder="Select option"
                        disabled={formData.isDeal === "Yes"}
                      />
                      {errors.isLossDeal && (
                        <p className="text-sm text-red-500">
                          {errors.isLossDeal}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="mt-8 flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/view-orders")}
                className="border-gray-300 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="lg"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium px-8 py-2 rounded-md shadow-md hover:shadow-lg transition-all duration-300 dark:bg-primary dark:hover:bg-primary/90"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Update Order"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
