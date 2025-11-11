import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../../firebase";

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
  // ⭐ ADDED: Category field
  category: string;
}

export default function CreateNotif() {
  const [formData, setFormData] = useState<NotificationData>({
    title: '',
    description: '',
    date: '',
    // ⭐ ADDED: Category initialization
    category: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // This handler manages native <input> and <textarea> elements
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
    setSuccessMessage(null);
  };

  // Dedicated handler for TextArea (assuming it returns only the value string)
  const handleTextAreaChange = (value: string) => {
    setFormData(prev => ({ ...prev, description: value }));
    setError(null);
    setSuccessMessage(null);
  };

  // Handler for the specialized DatePicker component
  const handleDateChange = (dates: any, dateString: string) => {
    setFormData(prev => ({ ...prev, date: dateString }));
    setError(null);
    setSuccessMessage(null);
  };

  const handleCreateNotif = async () => {
    setError(null);
    setSuccessMessage(null);

    // ⭐ UPDATED VALIDATION: Check for category
    if (!formData.title || !formData.description || !formData.date || !formData.category) {
      setError("All fields (Title, Description, Date, and Category) are required.");
      return;
    }

    setLoading(true);

    try {
      const notifCollectionRef = collection(db, "notifications");

      await addDoc(notifCollectionRef, {
        title: formData.title,
        description: formData.description,
        scheduledDate: formData.date,
        // ⭐ ADDED: Save category to Firestore
        category: formData.category,
        status: 'scheduled',
        createdAt: new Date(),
      });

      setSuccessMessage("Notification created and saved successfully!");
      setFormData({ title: '', description: '', date: '', category: '' }); // Clear form
    } catch (err) {
      console.error("Firestore Error:", err);
      setError("Failed to create notification. Check console for details and security rules.");
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

      {/* ⭐ NEW SECTION: Category Select */}
      <div className="mb-4">
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-700 text-theme-sm transition duration-300 placeholder:text-gray-400 focus:border-brand-500 focus:ring-brand-500 dark:border-white/[0.05] dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-gray-500 dark:focus:border-brand-500 dark:focus:ring-brand-500"
        >
          <option value="" disabled>Select Category</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Update">Update</option>
          <option value="Reminder">Reminder</option>
          <option value="Alert">Alert</option>
        </select>
      </div>

      <div className="space-y-6">
        {/* Description */}
        <div>
          <Label>Description</Label>
          <TextArea
            name="description"
            value={formData.description}
            onChange={handleTextAreaChange}
            rows={6}
          />
        </div>
      </div>

      <div className="mb-4">
        <DatePicker
          id="date-picker"
          label="Scheduled Date"
          placeholder="Select a date"
          onChange={handleDateChange}
        />
      </div>

      <div className="flex justify-end">
        <Button
          size="md"
          variant="primary"
          className="mt-6"
          onClick={handleCreateNotif}
          disabled={loading}
        >
          {loading ? "Saving..." : "Create Notification"}
        </Button>
      </div>
    </ComponentCard>
  );
}