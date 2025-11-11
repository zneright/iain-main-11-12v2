// ApplicantsInfo.tsx 

import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../../firebase";
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
  age: number;
  gender: string;
  address: string;
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
        // 1. Get a reference to the 'accounts' collection
        const accountsCollectionRef = collection(db, "accounts");

        // 2. Fetch all documents
        const querySnapshot = await getDocs(accountsCollectionRef);

        // 3. Map Firestore data to the local 'Order' interface
        const fetchedData: Order[] = querySnapshot.docs.map(doc => {
          const data = doc.data();

          // Combine address fields for simple display
          const fullAddress = data.address
            ? `${data.address.street || ''}, ${data.address.city || ''}, ${data.address.country || ''}`.replace(/,\s*,/g, ', ').replace(/^,\s*/, '').replace(/,\s*$/, '')
            : 'N/A';

          return {
            id: doc.id, // User UID
            user: {
              name: `${data.firstName || ''} ${data.lastName || ''}`,
              role: data.role || 'Applicant', // Default role
              image: data.image || '/images/applicants/default-user.jpg', // Placeholder image
            },
            phone: data.phone || 'N/A',
            email: data.email || 'N/A',
            status: data.status || 'Pending', // Default status for new records
            age: data.age || 0,
            gender: data.gender || 'N/A',
            address: fullAddress,
          };
        });

        setTableData(fetchedData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setFetchError("Failed to load user data from Firebase. Check console for details.");
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  // Handlers
  const handleEditClick = (order: Order) => {
    setSelectedOrder(order);
    setSelectedStatus(order.status);
    setOpenStatusModal(true);
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
                    <Badge
                      size="sm"
                      color={
                        order.status === "Success"
                          ? "success"
                          : order.status === "Pending"
                            ? "primary"
                            : "error"
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