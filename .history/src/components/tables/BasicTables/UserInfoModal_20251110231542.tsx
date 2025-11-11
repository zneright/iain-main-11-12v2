import Button from "../../ui/button/Button";
// Using the same Order interface for type safety
interface Order {
  id: number;
  user: {
    image: string;
    name: string;
    role: string;
  };
  phone: string;
  email: string;
  status: string;
  age: number;
  gender: string;
  address: string;
}

interface UserInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

// NOTE: I'm assuming 'EditStatusModal' is built on a base modal.
// You will need to create the actual UI for this modal.
// I'm using a placeholder for the modal structure.
export default function UserInfoModal({
  isOpen,
  onClose,
  order,
}: UserInfoModalProps) {
  if (!isOpen || !order) return null;

  const { user, email, phone, age, gender, address } = order;

  return (
    // Placeholder for your actual Modal component UI structure (e.g., a simple dialog)
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
          <p className="text-gray-700 dark:text-gray-300">Email: {email}</p>
          <p className="text-gray-700 dark:text-gray-300">Phone: {phone}</p>
          <p className="text-gray-700 dark:text-gray-300">Age: {age}</p>
          <p className="text-gray-700 dark:text-gray-300">Gender: {gender}</p>
          <p className="text-gray-700 dark:text-gray-300">Address: {address}</p>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
