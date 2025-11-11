import { useState, useEffect } from "react";
// -------------------------------------------------------------------------
// FIREBASE IMPORTS
// -------------------------------------------------------------------------
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
// -------------------------------------------------------------------------

import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import TextArea from "../../components/form/input/TextArea";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import DatePicker from "../../components/form/date-picker";

// Interface for the fetched applicant data
interface Applicant {
  uid: string;
  name: string;
  email: string;
}

// Interface for the notification form data (targetUids is now a single string/UID)
interface NotificationData {
  title: string;
  description: string;
  date: string;
  // ⭐ MODIFIED: targetUid is now a single string for one selected applicant
  targetUid: string;
}

export default function CreateNotif() {
  const initialFormData: NotificationData = {
    title: '',
    description: '',
    date: '',
    targetUid: '', // Initialize as an empty string
  };

  const [formData, setFormData] = useState<NotificationData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [pendingApplicants, setPendingApplicants] = useState<Applicant[]>([]);


  // Handlers
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

  // ⭐ MODIFIED HANDLER: For selecting a SINGLE applicant
  const handleApplicantSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // The value is just the selected UID string
    const selectedUid = e.target.value;

    // Update targetUid state
    setFormData(prev => ({ ...prev, targetUid: selectedUid }));
  };

  // =================================================================
  // 🎯 FIREBASE FETCH LOGIC: Get Pending Applicants
  // =================================================================
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
  // =================================================================


  const handleCreateNotif = async () => {
    setError(null);
    setSuccessMessage(null);

    // ⭐ UPDATED VALIDATION: Check for single targetUid (empty string check)
    if (!formData.title || !formData.description || !formData.date || !formData.targetUid) {
      setError("All fields (Title, Description, Date) and one applicant must be selected.");
      return;
    }

    setLoading(true);

    try {
      const notifCollectionRef = collection(db, "notifications");

      await addDoc(notifCollectionRef, {
        title: formData.title,
        description: formData.description,
        scheduledDate: formData.date,
        status: 'scheduled',
        // ⭐ CRITICAL: Save the single UID string
        targetUid: formData.targetUid,
        createdAt: new Date(),
      });

      setSuccessMessage(`Notification created and scheduled for one applicant! (UID: ${formData.targetUid})`);
      setFormData(initialFormData); // Reset using initialFormData
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

      {/* ⭐ APPLICANT SELECTION FIELD (Single Select) */}
      <div className="mb-4">
        <Label htmlFor="applicant">Target Applicant (Status: Pending)</Label>
        <select
          id="applicant"
          name="targetUid" // Name now matches the targetUid key in state
          value={formData.targetUid}
          onChange={handleApplicantSelect}
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-700 text-theme-sm transition duration-300 dark:border-white/[0.05] dark:bg-white/[0.03] dark:text-white/90"
        // ⭐ REMOVED 'multiple' attribute for single selection
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
          // Disable if loading OR if no target UID is selected
          disabled={loading || !formData.targetUid}
        >
          {loading ? "Saving..." : "Create Notification"}
        </Button>
      </div>
    </ComponentCard>
  );
}