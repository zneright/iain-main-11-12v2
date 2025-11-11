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

  if (!isOpen) return null; // hide modal if not open

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
          <div
            className={`cursor-pointer ${
              selectedStatus === "Pending" ? "" : ""
            }`}
            onClick={() => setSelectedStatus("Pending")}
          >
            <Badge variant="solid" color="primary">
              Pending
            </Badge>
          </div>

          <div
            className={`cursor-pointer ${
              selectedStatus === "Success" ? "" : ""
            }`}
            onClick={() => setSelectedStatus("Success")}
          >
            <Badge variant="solid" color="success">
              {" "}
              Success{" "}
            </Badge>{" "}
          </div>

          <div
            className={`cursor-pointer ${
              selectedStatus === "Failed" ? "" : ""
            }`}
            onClick={() => setSelectedStatus("Failed")}
          >
            <Badge variant="solid" color="error">
              {" "}
              Failed{" "}
            </Badge>{" "}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave(selectedStatus);
              onClose();
            }}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
