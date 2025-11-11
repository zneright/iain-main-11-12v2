// BasicTableOne.tsx

import { useState } from "react";
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
  id: number;
  user: {
    image: string;
    name: string;
    role: string;
  };
  phone: string;
  email: string;
  status: string;
  // **UPDATED**
  age: number;
  gender: string;
  address: string;
}

export default function BasicTableOne() {
  // Make tableData stateful
  const [tableData, setTableData] = useState<Order[]>([
    {
      id: 1,
      user: {
        image: "/images/applicants/applicant-1.jpg",
        name: "Nishia Pinlac",
        role: "Developer",
      },
      phone: "09999999999",
      email: "pinlacnishia@gmail.com",
      status: "Pending",
      // **UPDATED DATA**
      age: 24,
      gender: "Female",
      address: "123 Main St, New York, USA",
    },
  ]);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  // Inside BasicTableOne.tsx component:

  const [openStatusModal, setOpenStatusModal] = useState(false); // Renamed the old 'open'
  const [openInfoModal, setOpenInfoModal] = useState(false); // New state for info modal
  const [selectedStatus, setSelectedStatus] = useState("");

  const handleEditClick = (order: Order) => {
    setSelectedOrder(order);
    setSelectedStatus(order.status);
    setOpenStatusModal(true); // Updated
  };

  // 👈 New handler to open the info modal
  const handleUserInfoClick = (order: Order) => {
    setSelectedOrder(order);
    setOpenInfoModal(true);
  };

  const handleSave = (newStatus: string) => {
    if (!selectedOrder) return;

    const updated = tableData.map((o) =>
      o.id === selectedOrder.id ? { ...o, status: newStatus } : o
    );

    setTableData(updated);
    setOpenStatusModal(false); // Updated
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {/* ... (Existing Table Headers) ... */}
              <TableCell
                isHeader
                className="px-5 py-3 text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                User
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Phone
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Email
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Status
              </TableCell>

              <TableCell
                isHeader
                className="px-5 py-3 text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Edit Status
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                View Info
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {tableData.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  {/* ... (User info display) ... */}
                  {/* 👈 Added an onClick handler to the User cell */}
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
                        : order.status === "Failed"
                        ? "error"
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
      </div>

      <EditStatusModal
        isOpen={openStatusModal} // <-- Correct state: opened by Edit button
        onClose={() => setOpenStatusModal(false)}
        currentStatus={selectedStatus} // <-- Props specific to status
        onSave={handleSave} // <-- Props specific to status
      />
      {/* 2. User Info Modal (This must use the selectedOrder object) */}
      <UserInfoModal
        isOpen={openInfoModal} // <-- Correct state: opened by User/View Info click
        onClose={() => setOpenInfoModal(false)}
        order={selectedOrder} // <-- Prop specific to user info
      />
    </div>
  );
}
