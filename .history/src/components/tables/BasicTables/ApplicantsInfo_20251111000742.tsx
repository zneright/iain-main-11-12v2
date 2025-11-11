import { useState } from "react";
import Badge from "../../ui/badge/Badge";
import Button from "../../ui/button/Button";

interface EditStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStatus: string;
  onSave: (newStatus: string) => void;
}

export default function EditStatusModal({
  isOpen,
  onClose,
  currentStatus,
  onSave,
}: EditStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);

  if (!isOpen) return null;

  const statusBaseClasses = "cursor-pointer rounded-full p-0.5 border-2 border-transparent transition-all duration-150";
  const activeClasses = "ring-2 ring-brand-500/50 dark:ring-brand-400/50 border-brand-500/50";

  const handleSaveAndClose = () => {
    onSave(selectedStatus);
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
            disabled={selectedStatus === currentStatus}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}