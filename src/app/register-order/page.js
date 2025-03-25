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
          className="w-full justify-between border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
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
    closingDate: null,
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
  // Add a loading state to the component
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      { field: "closingTime", label: "Closing time" },
      { field: "salesExecutive", label: "Sales executive" },
      { field: "location", label: "Location" },
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

  // Update the handleSubmit function to include loading state
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Set loading state to true when submitting

    if (validateForm()) {
      // Format dates for MongoDB storage
      const formattedData = {
        ...formData,
        entryDate: new Date(formData.entryDate),
        openingDate: new Date(formData.openingDate),
        closingDate: formData.closingDate
          ? new Date(formData.closingDate)
          : null,
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
          closingDate: null,
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
      } finally {
        setIsSubmitting(false); // Reset loading state regardless of outcome
      }
    } else {
      setIsSubmitting(false); // Reset loading state if validation fails
    }
  };

  // Update the return statement to include enhanced light theme styling and loading button
  return (
    <div className="text-sm">
      <Navbar />
      <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mt-6 mx-auto">
          <div className="text-center py-6">
            <h1 className="text-2xl md:text-3xl font-bold text-indigo-700 dark:text-white">
              Order Registration
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Complete the form below to register a new order
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
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="closingDate"
                      className="text-gray-700 dark:text-gray-300 font-medium"
                    >
                      Closing Date (Optional)
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
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="closingTime"
                      className="text-gray-700 dark:text-gray-300 font-medium"
                    >
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
                        className="border-gray-300 bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                      <Clock className="ml-2 h-4 w-4 text-purple-500 dark:text-gray-400" />
                    </div>
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
                      PCT Sheet Received Within Time (Optional)
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
                    <Label
                      htmlFor="pctStatus"
                      className="text-gray-700 dark:text-gray-300 font-medium"
                    >
                      PCT Status (Optional)
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
                    <Input
                      id="orderStatus"
                      value="Active"
                      disabled
                      className="border-gray-300 bg-gray-50 text-gray-600 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium px-8 py-2 rounded-md shadow-md hover:shadow-lg transition-all duration-300 dark:bg-primary dark:hover:bg-primary/90"
              >
                {isSubmitting ? (
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
                  "Register Order"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
