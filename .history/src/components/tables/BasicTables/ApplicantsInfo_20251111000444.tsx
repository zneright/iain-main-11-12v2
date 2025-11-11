// ApplicantsInfo.tsx 

import { useState, useEffect } from "react";
// -------------------------------------------------------------------------
// FIREBASE IMPORTS
// -------------------------------------------------------------------------
import { collection, getDocs } from "firebase/firestore";
// NOTE: Adjust the relative path to firebase.js if necessary based on your file structure
import { db } from "../../../../firebase";
// -------------------------------------------------------------------------

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Badge from "../../ui/badge/Badge";
import Button from "../../ui/button/Button";
import EditStatusModal from "../../tables/BasicTables/UserInfoModal";
import UserInfoModal from "../../tables/BasicTables/UserInfoModal";

// Utility function to calculate age from a date string (YYYY-MM-DD format)
const calculateAge = (birthDateString: string): number => {
  if (!birthDateString) return 0;

  const today = new Date();
  const birthDate = new Date(birthDateString);

  // Return 0 if the date is invalid (to avoid displaying NaN or incorrect numbers)
  if (isNaN(birthDate.getTime())) return 0;

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  // Adjust age if the birthday hasn't occurred yet this year
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Interface for the data fetched from Firestore and mapped to the table structure
interface Order {
  id: string; // Maps to 'uid'
  user: {
    image: string;
    name: string;
    role: string;
  };
  phone: string;
  email: string;
  status: string; // Will be the value from Firestore (e.g., 'Pending', 'Success', 'Failed')
  age: number; // Will hold the calculated age
  birthDate: string; // Maps to 'birthDate'
  gender: string; // Maps to 'gender'
  address: string; // Combined address string
}

export default function ApplicantsInfo() {
  const [tableData, setTableData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [openStatusModal, setOpenStatusModal] = useState(false);
  const [openInfoModal, setOpenInfoModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");

  // =================================================================
  // 🎯 FIREBASE FETCH LOGIC
  // =================================================================
  useEffect(() => {
    const fetchAccounts = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const accountsCollectionRef = collection(db, "accounts");
        const querySnapshot = await getDocs(accountsCollectionRef);

        const fetchedData: Order[] = querySnapshot.docs.map(doc => {
          const data = doc.data();

          // Map the nested address fields into a single string
          const fullAddress = data.address
            ? `${data.address.street || ''}, ${data.address.city || '', data.address.zip || ''}, ${data.address.country || ''}`.replace(/,\s*,/g, ', ').replace(/^,\s*/, '').replace(/,\s*$/, '')
            : 'N/A';

          const userAge = calculateAge(data.birthDate);

          return {
            id: doc.id, // User UID
            user: {
              name: `${data.firstName || ''} ${data.lastName || ''}`,
              role: data.role || 'Applicant',
              image: data.image || '/images/applicants/default-user.jpg',
            },
            phone: data.phone || 'N/A',
            email: data.email || 'N/A',
            // ⭐ CRITICAL: Use the status field directly from Firestore data
            status: data.status || 'Pending',
            age: userAge,
            birthDate: data.birthDate || '',
            gender: data.gender || 'N/A',
            address: fullAddress,
          };
        });

        setTableData(fetchedData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setFetchError("Failed to load user data from Firebase. Check console for details and security rules.");
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  // Inside ApplicantsInfo.tsx
  const handleEditClick = (order: Order) => {
    setSelectedOrder(order);
    setSelectedStatus(order.status);
    setOpenStatusModal(true); // ⬅️ This must be called to open the modal
  };  

  const handleUserInfoClick = (order: Order) => {
    setSelectedOrder(order);
    setOpenInfoModal(true);
  };

  const handleSave = (newStatus: string) => {
    if (!selectedOrder) return;

    // Update the local state
    const updated = tableData.map((o) =>
      o.id === selectedOrder.id ? { ...o, status: newStatus } : o
    );

    setTableData(updated);
    setOpenStatusModal(false);

    // TODO: Add Firestore update logic here to save the new status to the database
  };

  // =================================================================
  // 🎯 RENDER BLOCK
  // =================================================================
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">

        {loading && (
          <div className="p-4 text-center text-gray-500">Loading user data...</div>
        )}

        {fetchError && (
          <div className="p-4 text-center text-error-500 border border-error-500 bg-red-50">{fetchError}</div>
        )}

        {!loading && !fetchError && tableData.length === 0 && (
          <div className="p-4 text-center text-gray-500">No accounts found in Firestore.</div>
        )}

        {/* Render table only if data is present */}
        {!loading && !fetchError && tableData.length > 0 && (
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-gray-500 text-start text-theme-xs dark:text-gray-400">User</TableCell>
                <TableCell isHeader className="px-5 py-3 text-gray-500 text-start text-theme-xs dark:text-gray-400">Phone</TableCell>
                <TableCell isHeader className="px-5 py-3 text-gray-500 text-start text-theme-xs dark:text-gray-400">Email</TableCell>
                <TableCell isHeader className="px-5 py-3 text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                <TableCell isHeader className="px-5 py-3 text-gray-500 text-start text-theme-xs dark:text-gray-400">Edit Status</TableCell>
                <TableCell isHeader className="px-5 py-3 text-gray-500 text-start text-theme-xs dark:text-gray-400">View Info</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {tableData.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div
                      className="flex items-center gap-3 cursor-pointer hover:opacity-80"
                      onClick={() => handleUserInfoClick(order)}
                    >
                      <div className="w-10 h-10 overflow-hidden rounded-full">
                        <img
                          width={40}
                          height={40}
                          src={order.user.image}
                          alt={order.user.name}
                        />
                      </div>
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {order.user.name}
                        </span>
                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                          {order.user.role}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {order.phone}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {order.email}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {/* ⭐ ACTION: Dynamically set color based on actual status value */}
                    <Badge
                      size="sm"
                      color={
                        order.status === "Success"
                          ? "success"
                          : order.status === "Pending"
                            ? "primary"
                            : order.status === "Failed"
                              ? "error"
                              : "gray" // Default case if status is unexpected
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditClick(order)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUserInfoClick(order)}
                    >
                      View Info
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <EditStatusModal
        isOpen={openStatusModal}
        onClose={() => setOpenStatusModal(false)}
        currentStatus={selectedStatus}
        onSave={handleSave}
      />

      <UserInfoModal
        isOpen={openInfoModal}
        onClose={() => setOpenInfoModal(false)}
        order={selectedOrder}
      />
    </div>
  );
}