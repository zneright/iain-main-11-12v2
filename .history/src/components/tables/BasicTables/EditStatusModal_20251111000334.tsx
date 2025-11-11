import { useState } from "react";
import Badge from "../../ui/badge/Badge";
import Button from "../../ui/button/Button";

interface EditStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStatus: string;
  // Note: The onSave function in the parent (ApplicantsInfo) is now responsible for the Firebase update.
  onSave: (newStatus: string) => void;
}

export default function EditStatusModal({
  isOpen,
  onClose,
  currentStatus,
  onSave,
}: EditStatusModalProps) {
  // Initialize state with the status passed from the parent table
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);

  if (!isOpen) return null; // hide modal if not open

  // Common styles for the status selector wrappers
  const statusBaseClasses = "cursor-pointer rounded-full p-0.5 border-2 border-transparent transition-all duration-150";
  // Classes to apply when a status is selected (using a visible ring/border)
  const activeClasses = "ring-2 ring-brand-500/50 dark:ring-brand-400/50 border-brand-500/50";

  // Function to handle save click
  const handleSaveAndClose = () => {
    // 1. Call the parent function to initiate the Firebase update
    onSave(selectedStatus);

    // 2. Close the modal (Since the parent's onSave is async, ideally we'd wait for it, 
    // but we maintain the immediate closure pattern used in your initial code.)
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-96 shadow-xl">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-4">
          Edit Applicant Status
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Select a new status for the applicant
        </p>

        <div className="flex gap-4 mb-6">

          {/* Pending Status */}
          <div
            className={`${statusBaseClasses} ${selectedStatus === "Pending" ? activeClasses : ""
              }`}
            onClick={() => setSelectedStatus("Pending")}
          >
            <Badge variant="solid" color="primary">
              Pending
            </Badge>
          </div>

          {/* Success Status */}
          <div
            className={`${statusBaseClasses} ${selectedStatus === "Success" ? activeClasses : ""
              }`}
            onClick={() => setSelectedStatus("Success")}
          >
            <Badge variant="solid" color="success">
              Success
            </Badge>
          </div>

          {/* Failed Status */}
          <div
            className={`${statusBaseClasses} ${selectedStatus === "Failed" ? activeClasses : ""
              }`}
            onClick={() => setSelectedStatus("Failed")}
          >
            <Badge variant="solid" color="error">
              Failed
            </Badge>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveAndClose}
            // Disable Save button if the status hasn't changed or if it's the initial empty state (optional)
            disabled={selectedStatus === currentStatus}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}