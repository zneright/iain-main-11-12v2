import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import TextArea from "../../components/form/input/TextArea";
import { useState } from "react";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";

import DatePicker from "../../components/form/date-picker";

export default function CreateNotif() {
  const [message, setMessage] = useState("");
  return (
    <ComponentCard title="Notidication Details">
      <div>
        <Label htmlFor="input">Notification Title</Label>
        <Input type="text" id="input" />
      </div>
      <div className="space-y-6">
        <div>
          <Label>Description</Label>
          <TextArea
            value={message}
            onChange={(value) => setMessage(value)}
            rows={6}
          />
        </div>
      </div>
      <div>
        <DatePicker
          id="date-picker"
          label="Birthday"
          placeholder="Select a date"
          onChange={(dates, currentDateString) => {
            // Handle your logic
            console.log({ dates, currentDateString });
          }}
        />
      </div>
      <div className="flex justify-end">
        <Button size="md" variant="primary" className="mt-6 ">
          Create Notification
        </Button>
      </div>
    </ComponentCard>
  );
}
