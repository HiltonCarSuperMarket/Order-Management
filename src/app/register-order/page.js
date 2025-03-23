"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Moon, Sun, CalendarIcon, Clock, X } from "lucide-react";

// Options for select menus - can be modified later
const options = {
  enquiryType: ["Reservation", "Test Drive"],
  salesExecutive: [
    "Zaiyaan Ashraf",
    "Abul Thaher",
    "Mirza Ansab",
    "Abubaker Basharat",
    "Riley Tiesse",
    "Danyal Mehmood",
    "Venu Padhyay",
    "Abdul Wahid",
  ],
  location: [
    "Ready To Retail",
    "Milton Keynes",
    "New Arrivals",
    "Transit",
    "Aylesbury",
  ],
  isPctSheetReceivedWithinTime: ["Yes", "No", "In-Process"],
  pctStatus: [
    "Ready to Go - 0 to 99",
    "Mechanical Major: 151 - 299",
    "Mechanical Minor: 100 - 150",
    "Bodywork Major: 451 - 499",
    "Finance: 800 - 899",
    "Test Drive: 600 - 699",
    "Bodywork Minor: 400 - 450",
    "Transit: 500 - 599",
    "Test Drive: 700 - 799",
    "Inspection: 300 - 399",
    "Bodywork Minor: 400 - 449",
  ],
  orderStatus: ["Inactive", "Active"],
  isShowUp: ["Yes", "No", "Active-Order"],
  isDeal: ["Yes", "No", "Active-Order"],
  reasonForAction: [
    "Sold",
    "Phone - Cancellation - Not interested anymore",
    "Phone - Cancellation - Not answering phone",
    "Phone - Cancellation - Finance declined",
    "Onsite - Cancellation - Not interested anymore",
    "Phone - Cancellation - Changed to new order",
    "Phone - Cancellation - Bought another car from Hilton",
    "Phone - Cancellation - SE - 72-hour timeline not met",
    "Phone - Cancellation - Bought another car from elsewhere",
  ],
  isLossDeal: ["Sold", "Yes", "No"],
};

// Searchable select component
function SearchableSelect({ options, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);

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
            className="h-9 dark:bg-gray-700 dark:text-white"
          />
          <CommandList>
            <CommandEmpty className="py-2 text-center text-sm dark:text-gray-400">
              No results found.
            </CommandEmpty>
            <CommandGroup className="max-h-[200px] overflow-auto">
              {options.map((option) => (
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

export default function OrderRegistrationPage() {
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

  // Format date to UK format
  const formatUKDate = (date) => {
    if (!date) return "";
    return format(date, "dd/MM/yyyy");
  };

  const [darkMode, setDarkMode] = useState(false);
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

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  // Set dark mode class on initial load
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    }
  }, [darkMode]);

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
      { field: "cancellationDate", label: "Cancellation date" },
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

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // If reasonDetail is empty, set it to "Not Given"
      const finalFormData = {
        ...formData,
        reasonDetail: formData.reasonDetail || "Not Given",
      };

      // Format dates in UK format for console output
      const formattedData = {
        ...finalFormData,
        entryDate: formatUKDate(finalFormData.entryDate),
        orderDate: formatUKDate(finalFormData.orderDate),
        collectionDate: formatUKDate(finalFormData.collectionDate),
        cancellationDate: formatUKDate(finalFormData.cancellationDate),
      };

      console.log("Form submitted:", formattedData);
    }
  };

  return (
    <div
      className={`min-h-screen p-4 md:p-8 ${
        darkMode ? "dark bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold dark:text-white">
            Order Registration
          </h1>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleDarkMode}
            className="rounded-full"
          >
            {darkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle dark mode</span>
          </Button>
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
                          ? formatUKDate(formData.entryDate)
                          : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 dark:bg-gray-800">
                      <Calendar
                        mode="single"
                        selected={formData.entryDate}
                        onSelect={(date) => handleDateChange("entryDate", date)}
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
                  <Label htmlFor="registeration" className="dark:text-gray-300">
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
                          ? formatUKDate(formData.orderDate)
                          : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 dark:bg-gray-800">
                      <Calendar
                        mode="single"
                        selected={formData.orderDate}
                        onSelect={(date) => handleDateChange("orderDate", date)}
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
                          ? formatUKDate(formData.collectionDate)
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
                    onChange={(value) => handleChange("salesExecutive", value)}
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
                          ? formatUKDate(formData.cancellationDate)
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
                    onChange={(value) => handleChange("reasonForAction", value)}
                    placeholder="Select reason"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reasonDetail" className="dark:text-gray-300">
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

          <div className="mt-8 flex justify-end">
            <Button
              type="submit"
              size="lg"
              className="bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90"
            >
              Register Order
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
  );
}
