import { useState } from "react";
// -------------------------------------------------------------------------
// FIREBASE IMPORTS
// -------------------------------------------------------------------------
import { collection, addDoc } from "firebase/firestore"; // Import addDoc for creating new documents
import { db } from "../../../firebase"; // NOTE: Adjust path as necessary
// -------------------------------------------------------------------------

import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import TextArea from "../../components/form/input/TextArea";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import DatePicker from "../../components/form/date-picker";

// Define the state structure for the form
interface NotificationData {
  title: string;
  description: string;
  date: string;
}

export default function CreateNotif() {
  const [formData, setFormData] = useState<NotificationData>({
    title: '',
    description: '',
    date: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // General handler for all input fields (Input and TextArea)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
    setSuccessMessage(null);
  };

  // Handler for the specialized DatePicker component
  const handleDateChange = (dates: any, dateString: string) => {
    setFormData(prev => ({ ...prev, date: dateString }));
    setError(null);
    setSuccessMessage(null);
  };

  // 🎯 Main function to save data to Firestore
  const handleCreateNotif = async () => {
    setError(null);
    setSuccessMessage(null);

    if (!formData.title || !formData.description || !formData.date) {
      setError("All fields (Title, Description, and Date) are required.");
      return;
    }

    setLoading(true);

    try {
      // Get a reference to the 'notifications' collection
      const notifCollectionRef = collection(db, "notifications");

      // Use addDoc to automatically generate a document ID
      await addDoc(notifCollectionRef, {
        title: formData.title,
        description: formData.description,
        scheduledDate: formData.date,
        status: 'scheduled', // Initial status
        createdAt: new Date(),
      });

      setSuccessMessage("Notification created and saved successfully!");
      setFormData({ title: '', description: '', date: '' }); // Clear form
    } catch (err) {
      console.error("Firestore Error:", err);
      setError("Failed to create notification. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ComponentCard title="Notification Details">

      {/* Display Messages */}
      {error && (
        <p className="text-error-500 mb-4 p-3 bg-red-100 border border-error-500 rounded">{error}</p>
      )}
      {successMessage && (
        <p className="text-success-500 mb-4 p-3 bg-green-100 border border-success-500 rounded">{successMessage}</p>
      )}

      {/* Notification Title */}
      <div className="mb-4">
        <Label htmlFor="title">Notification Title</Label>
        <Input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
        />
      </div>

      <div className="space-y-6">
        {/* Description */}
        <div>
          <Label>Description</Label>
          <TextArea
            name="description" // Add name attribute for the handler
            value={formData.description}
            onChange={handleInputChange}
            rows={6}
          />
        </div>
      </div>

      {/* Date Picker */}
      <div>
        <DatePicker
          id="date-picker"
          label="Scheduled Date" // Changed label for clarity
          placeholder="Select a date"
          onChange={handleDateChange} // Use the specialized handler
        // You may need to pass the current value back to the DatePicker component
        // to display the selected date if the component requires it.
        />
      </div>

      <div className="flex justify-end">
        <Button
          size="md"
          variant="primary"
          className="mt-6"
          onClick={handleCreateNotif} // ⬅️ Attach the save function
          disabled={loading}
        >
          {loading ? "Saving..." : "Create Notification"}
        </Button>
      </div>
    </ComponentCard>
  );
}