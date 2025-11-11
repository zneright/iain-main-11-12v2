import { useState, useEffect } from "react";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";

import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import TextArea from "../../components/form/input/TextArea";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import DatePicker from "../../components/form/date-picker";

interface Applicant {
  uid: string;
  name: string;
  email: string;
}

interface NotificationData {
  title: string;
  description: string;
  date: string;
  type: string;
  // ⭐ ADDED: Time field
  time: string;
  targetUid: string;
}

export default function CreateNotif() {
  const initialFormData: NotificationData = {
    title: '',
    description: '',
    date: '',
    type: '',
    // ⭐ ADDED: Time initialization
    time: '',
    targetUid: '',
  };

  const [formData, setFormData] = useState<NotificationData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [pendingApplicants, setPendingApplicants] = useState<Applicant[]>([]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
    setSuccessMessage(null);
  };

  const handleTextAreaChange = (value: string) => {
    setFormData(prev => ({ ...prev, description: value }));
    setError(null);
    setSuccessMessage(null);
  };

  const handleDateChange = (dates: any, dateString: string) => {
    setFormData(prev => ({ ...prev, date: dateString }));
    setError(null);
    setSuccessMessage(null);
  };

  const handleApplicantSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUid = e.target.value;
    setFormData(prev => ({ ...prev, targetUid: selectedUid }));
  };

  useEffect(() => {
    const fetchPendingApplicants = async () => {
      try {
        const applicantsQuery = query(
          collection(db, "accounts"),
          where("status", "==", "Pending")
        );

        const snapshot = await getDocs(applicantsQuery);

        const applicants = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            uid: doc.id,
            name: `${data.firstName || 'N/A'} ${data.lastName || ''}`,
            email: data.email || 'N/A',
          };
        });

        setPendingApplicants(applicants);
      } catch (err) {
        console.error("Error fetching pending applicants:", err);
      }
    };

    fetchPendingApplicants();
  }, []);


  const handleCreateNotif = async () => {
    setError(null);
    setSuccessMessage(null);

    // UPDATED VALIDATION: Check for type and time field
    if (!formData.title || !formData.description || !formData.date || !formData.time || !formData.targetUid || !formData.type) {
      setError("All fields (Title, Description, Date, Time, Type) and one applicant must be selected.");
      return;
    }

    setLoading(true);

    try {
      const notifCollectionRef = collection(db, "notifications");

      await addDoc(notifCollectionRef, {
        title: formData.title,
        description: formData.description,
        scheduledDate: formData.date,
        scheduledTime: formData.time, // ⭐ SAVED: Scheduled time
        type: formData.type,
        status: 'scheduled',
        targetUid: formData.targetUid,
        createdAt: new Date(),
      });

      setSuccessMessage(`Notification created and scheduled for applicant UID: ${formData.targetUid}`);
      setFormData(initialFormData); // Reset form
    } catch (err) {
      console.error("Firestore Error:", err);
      setError("Failed to create notification. Check console for details and security rules.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ComponentCard title="Notification Details">

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

      {/* Notification Type Select */}
      <div className="mb-4">
        <Label htmlFor="type">Notification Type</Label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleInputChange}
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-700 text-theme-sm transition duration-300 dark:border-white/[0.05] dark:bg-white/[0.03] dark:text-white/90"
        >
          <option value="" disabled>Select Type</option>
          <option value="Interview">Interview</option>
          <option value="Reminder">Reminder</option>
          <option value="General">General</option>
        </select>
      </div>

      {/* APPLICANT SELECTION FIELD (Single Select) */}
      <div className="mb-4">
        <Label htmlFor="applicant">Target Applicant (Status: Pending)</Label>
        <select
          id="applicant"
          name="targetUid"
          value={formData.targetUid}
          onChange={handleApplicantSelect}
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-700 text-theme-sm transition duration-300 dark:border-white/[0.05] dark:bg-white/[0.03] dark:text-white/90"
        >
          <option value="" disabled>Select One Applicant</option>
          {pendingApplicants.length === 0 ? (
            <option disabled>No pending applicants found.</option>
          ) : (
            pendingApplicants.map((applicant) => (
              <option key={applicant.uid} value={applicant.uid}>
                {applicant.name} ({applicant.email})
              </option>
            ))
          )}
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

      {/* DATE AND TIME PICKERS */}
      <div className="grid grid-cols-2 gap-4">
        {/* Date Picker */}
        <div>
          <DatePicker
            id="date-picker"
            label="Scheduled Date"
            placeholder="Select a date"
            onChange={handleDateChange}
          />
        </div>

        {/* ⭐ NEW: Time Picker */}
        <div>
          <Label htmlFor="time">Scheduled Time</Label>
          <Input
            type="time"
            id="time"
            name="time"
            value={formData.time}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          size="md"
          variant="primary"
          className="mt-6"
          onClick={handleCreateNotif}
          // Disable if loading OR if required fields/target UID/type/time is missing
          disabled={loading || !formData.targetUid || !formData.type || !formData.time || !formData.date}
        >
          {loading ? "Saving..." : "Create Notification"}
        </Button>
      </div>
    </ComponentCard>
  );
} 