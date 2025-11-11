import Button from "../../ui/button/Button";

// Utility function to calculate age from a date string (YYYY-MM-DD format)
const calculateAge = (birthDateString: string): number | string => {
  if (!birthDateString) return "N/A";

  const today = new Date();
  const birthDate = new Date(birthDateString);

  // Check if the birthDate is valid
  if (isNaN(birthDate.getTime())) return "Invalid Date";

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  // Adjust age if the birthday hasn't occurred yet this year
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// ⭐ FIX 1: Updated ID to string (to match Firebase UID)
// ⭐ FIX 2: Added birthDate field
interface Order {
  id: string;
  user: {
    image: string;
    name: string;
    role: string;
  };
  phone: string;
  email: string;
  status: string;
  // age: number is now a redundant placeholder but kept in the interface for backward compatibility
  age: number;
  gender: string;
  address: string;
  birthDate: string;
}

interface UserInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export default function UserInfoModal({
  isOpen,
  onClose,
  order,
}: UserInfoModalProps) {
  if (!isOpen || !order) return null;

  // Destructure all available fields
  const { user, email, phone, gender, address, birthDate } = order;

  // ⭐ ACTION 2 & 3: Calculate age based on birthDate
  const calculatedAge = calculateAge(birthDate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded-lg bg-white p-6 shadow-xl w-96 dark:bg-gray-800">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          User Information
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <img
              width={60}
              height={60}
              src={user.image}
              alt={user.name}
              className="rounded-full w-14 h-14 object-cover"
            />
            <div>
              <p className="font-bold text-lg dark:text-white">{user.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user.role}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-3 space-y-2 dark:border-gray-700">
            {/* Contact Details (Bolding removed) */}
            <p className="text-gray-700 dark:text-gray-300">
              Email: {email}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Phone: {phone}
            </p>

            {/* Personal Details (Bolding removed) */}
            <p className="text-gray-700 dark:text-gray-300">
              Gender: {gender}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Birthdate: {birthDate}
            </p>

            {/* ⭐ ACTION 3: Use the calculated age */}
            <p className="text-gray-700 dark:text-gray-300">
              Age: {calculatedAge}
            </p>

            {/* Location (Bolding removed) */}
            <p className="text-gray-700 dark:text-gray-300">
              Address: {address}
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}