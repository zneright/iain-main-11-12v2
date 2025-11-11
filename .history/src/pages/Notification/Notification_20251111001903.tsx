import { useState, useEffect } from "react"; // ⭐ ADDED useEffect
// -------------------------------------------------------------------------
// FIREBASE IMPORTS
// -------------------------------------------------------------------------
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";
import { db } from "../../../firebase"; // ⭐ NOTE: Adjusted path assuming correct structure
// -------------------------------------------------------------------------

import Button from "../../components/ui/button/Button";
import { Bell } from "lucide-react";
import { Link } from "react-router";

// Define the expected structure for display in the component
interface Notification {
  id: string; // Changed from number to string for Firestore document ID
  name: string; // The user/system that created the notification
  message: string; // The main body/description
  category: string;
  time: string; // Formatted date/time
  read: boolean;
}

// Helper function to format timestamp/date into a readable 'time ago' string
const formatTime = (timestamp: Date) => {
  // Basic date formatting for demonstration
  if (isNaN(timestamp.getTime())) return 'Unknown time';
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return timestamp.toLocaleDateString(); // Fallback to date
};


export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // =================================================================
  // 🎯 FIREBASE FETCH LOGIC
  // =================================================================
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        // Query the 'notifications' collection, ordering by creation time
        const notifQuery = query(
          collection(db, "notifications"),
          orderBy("createdAt", "desc"),
          limit(20) // Limit to the last 20 notifications
        );

        const querySnapshot = await getDocs(notifQuery);

        const fetchedNotifs: Notification[] = querySnapshot.docs.map(doc => {
          const data = doc.data();

          // Convert Firestore Timestamp to JavaScript Date
          const createdAtDate = data.createdAt ? data.createdAt.toDate() : new Date();

          return {
            id: doc.id, // Use document ID as the unique key
            // Map Firestore fields to the local structure
            name: data.sourceUser || "System Scheduler", // Assuming creator field or 'System Scheduler'
            message: data.description || data.title || "No description provided.",
            category: data.status === 'scheduled' ? 'Scheduled' : 'System',
            time: formatTime(createdAtDate),
            read: data.read || false, // Use Firestore read status or default to false
          };
        });

        setNotifications(fetchedNotifs);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError("Failed to load notifications. Check console/security rules.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []); // Run only once on mount


  const markAllAsRead = () => {
    // TODO: In a production app, this should also update the 'read' status in Firestore.
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    // NOTE: This only clears local state. Should ideally delete records in Firestore too.
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

      {/* Loading/Error state */}
      {loading && (
        <div className="py-20 text-center text-gray-500 dark:text-gray-400">
          Loading notifications...
        </div>
      )}
      {error && (
        <div className="py-10 text-center text-error-500 border border-error-500 bg-red-50 rounded-lg">
          Error: {error}
        </div>
      )}

      {/* Notifications list */}
      {!loading && !error && (
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
                className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${notif.read
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
                      // TODO: Add Firestore update logic here to mark 'read: true'
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
      )}

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