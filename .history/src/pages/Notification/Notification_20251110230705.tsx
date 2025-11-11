import { useState } from "react";
import Button from "../../components/ui/button/Button";
import { Bell } from "lucide-react";
import { Link } from "react-router"; // or "next/link" if you're using Next.js

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      name: "Terry Franci",
      message: "requested permission to change Project - Nganter App",
      category: "Project",
      time: "5 min ago",
      read: false,
    },
    {
      id: 2,
      name: "Lianne Santos",
      message: "uploaded a new document to Applicant Results folder",
      category: "Documents",
      time: "20 min ago",
      read: true,
    },
    {
      id: 3,
      name: "System Bot",
      message: "Server maintenance scheduled at 11:00 PM tonight",
      category: "System",
      time: "1 hour ago",
      read: false,
    },
  ]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="text-orange-500" size={26} />
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Notifications
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={markAllAsRead}>
            Mark All as Read
          </Button>
          <Button variant="outline" onClick={clearAll}>
            Clear All
          </Button>
        </div>
      </div>

      {/* Notifications list */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Bell size={48} className="mb-3 text-gray-300" />
            <p>No notifications found.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
                notif.read
                  ? "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800"
                  : "border-orange-300 bg-orange-50 dark:border-orange-800 dark:bg-orange-950"
              }`}
            >
              <div className="flex-1">
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {notif.name}
                  </span>{" "}
                  {notif.message}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <span>{notif.category}</span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span>{notif.time}</span>
                </div>
              </div>

              {!notif.read && (
                <button
                  onClick={() =>
                    setNotifications((prev) =>
                      prev.map((n) =>
                        n.id === notif.id ? { ...n, read: true } : n
                      )
                    )
                  }
                  className="text-xs font-medium text-orange-600 bg-orange-100 dark:bg-orange-900 px-3 py-1 rounded-full hover:bg-orange-200 dark:hover:bg-orange-800"
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Back link */}
      <div className="flex justify-center mt-10">
        <Link
          to="/"
          className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
