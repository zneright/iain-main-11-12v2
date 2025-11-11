import { useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../Label";
import Input from "../input/InputField";
import { EnvelopeIcon } from "../../../icons";
import PhoneInput from "../group-input/PhoneInput";

// Define the expected props structure
interface InputGroupProps {
  onInputChange: (name: string, value: string) => void;
  formData: {
    email: string;
    phone: string;
    [key: string]: any; // Allow other properties
}

export default function InputGroup({ onInputChange, formData }: InputGroupProps) {
  const countries = [{ code: "PH", label: "+64" }];

  const handlePhoneNumberChange = (phoneNumber: string) => {
    onInputChange("phone", phoneNumber);
  };

  return (
    <ComponentCard title="Email and Phone">
      <div className="space-y-6">
        <div>
          <Label>Email</Label>
          <div className="relative">
            <Input
              placeholder="info@gmail.com"
              type="email" 
              name="email" 
              value={formData.email}
              onChange={(e) => onInputChange(e.target.name, e.target.value)}
            />
            <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
              <EnvelopeIcon className="size-6" />
            </span>
          </div>
        </div>

        <div>
          <Label>Phone</Label>
          <PhoneInput
            selectPosition="start"
            countries={countries}
            placeholder="+64 923 456 7890"
          
            onChange={handlePhoneNumberChange}
          />
        </div>
      </div>
    </ComponentCard>
  );
}