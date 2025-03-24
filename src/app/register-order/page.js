"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { CalendarIcon, Clock } from "lucide-react";
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

  const [formData, setFormData] = useState({
    entryDate: getCurrentUKDateTime().date,
    entryTime: getCurrentUKDateTime().time,
    registration: "",
    enquiryType: "",
    openingDate: getCurrentUKDateTime().date,
    closingDate: getCurrentUKDateTime().date,
    closingTime: getCurrentUKDateTime().time,
    salesExecutive: "",
    customer: "",
    location: "",
    isPctSheetReceivedWithinTime: "",
    pctStatus: "",
    orderStatus: "Active", // Default to Active
    isShowUp: null,
    isDeal: null,
    reasonForAction: null,
    reasonDetail: null,
    isLossDeal: null,
  });

  const [errors, setErrors] = useState({});
  // No need for these states when using toast
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
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await axios.get("/api/filter-options");
        setOptions(response.data);
      } catch (error) {
        console.error("Error fetching filter options:", error);
        // Set default options if API call fails
        setOptions({
          enquiryType: ["Phone", "Email", "Walk-in", "Referral"],
          salesExecutive: ["John Doe", "Jane Smith", "Mark Johnson"],
          location: ["London", "Manchester", "Birmingham", "Leeds"],
          isPctSheetReceivedWithinTime: ["Yes", "No"],
          pctStatus: ["Completed", "Pending", "Not Required"],
          orderStatus: ["New", "In Progress", "Completed", "Cancelled"],
          isShowUp: ["Yes", "No"],
          isDeal: ["Yes", "No"],
          reasonForAction: [
            "Customer Request",
            "Technical Issue",
            "Pricing",
            "Other",
          ],
          isLossDeal: ["Yes", "No"],
        });
      }
    };

    fetchOptions();
  }, []);

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

    // Required fields
    const requiredFields = [
      { field: "entryDate", label: "Entry date" },
      { field: "entryTime", label: "Entry time" },
      { field: "enquiryType", label: "Enquiry type" },
      { field: "openingDate", label: "Order date" },
      { field: "closingDate", label: "Closing date" },
      { field: "closingTime", label: "Closing time" },
      { field: "salesExecutive", label: "Sales executive" },
      { field: "location", label: "Location" },
      {
        field: "isPctSheetReceivedWithinTime",
        label: "PCT sheet received status",
      },
      { field: "pctStatus", label: "PCT status" },
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

    setErrors(newErrors);

    // Set first error for modal
    if (firstErrorField) {
      toast.error(firstErrorMessage);
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Format dates for MongoDB storage
      const formattedData = {
        ...formData,
        entryDate: new Date(formData.entryDate),
        openingDate: new Date(formData.openingDate),
        closingDate: new Date(formData.closingDate),
      };

      try {
        const response = await axios.post(
          "/api/orders/register",
          formattedData
        );

        // Show success toast
        toast.success("Order registered successfully!");

        // Clear form after successful submission
        setFormData({
          entryDate: getCurrentUKDateTime().date,
          entryTime: getCurrentUKDateTime().time,
          registration: "",
          enquiryType: "",
          openingDate: getCurrentUKDateTime().date,
          closingDate: getCurrentUKDateTime().date,
          closingTime: getCurrentUKDateTime().time,
          salesExecutive: "",
          customer: "",
          location: "",
          isPctSheetReceivedWithinTime: "",
          pctStatus: "",
          orderStatus: "Active", // Default to Active
          isShowUp: null,
          isDeal: null,
          reasonForAction: null,
          reasonDetail: null,
          isLossDeal: null,
        });

        console.log("Form submitted:", formattedData);
      } catch (error) {
        // Show error toast
        toast.error("Failed to register order!");

        console.error(
          "Error registering order:",
          error.response?.data || error.message
        );
      }
    }
  };

  return (
    <div>
      <Navbar />
      <div
        className={`min-h-screen p-4 md:p-8 
         `}
      >
        <div className="max-w-6xl mt-6 mx-auto">
          <div className="text-center py-6">
            <h1 className="text-2xl  md:text-3xl font-bold dark:text-white">
              Order Registration
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
                      htmlFor="registration"
                      className="dark:text-gray-300"
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
                    <Label htmlFor="openingDate" className="dark:text-gray-300">
                      Order Date*
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="closingDate" className="dark:text-gray-300">
                      Closing Date*
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="closingTime" className="dark:text-gray-300">
                      Closing Time*
                    </Label>
                    <div className="flex items-center">
                      <Input
                        id="closingTime"
                        type="time"
                        value={formData.closingTime}
                        onChange={(e) =>
                          handleChange("closingTime", e.target.value)
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
                    <Input
                      id="orderStatus"
                      value="Active"
                      disabled
                      className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
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
        </div>
      </div>
    </div>
  );
}
