import { useState, useEffect } from "react";
// -------------------------------------------------------------------------
// FIREBASE IMPORTS
// -------------------------------------------------------------------------
import { collection, getDocs, orderBy, query, limit, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase"; // NOTE: Adjusted path assuming correct structure
// -------------------------------------------------------------------------

import Button from "../../components/ui/button/Button";
import { Bell } from "lucide-react";
import { Link } from "react-router";

// Define the expected structure for display in the component
interface Notification {
  id: string; // Document ID (UID) used to target the Firestore document
  name: string;
  message: string;
  category: string;
  time: string;
  read: boolean; // Must match the field in Firestore
  // ⭐ ADDED: Scheduled Date field
  scheduledDate: string;
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
  const [isSaving, setIsSaving] = useState(false); // To prevent double-clicks

  // =================================================================
  // 🎯 FIREBASE FETCH LOGIC (Runs once on mount)
  // =================================================================
  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const notifQuery = query(
        collection(db, "notifications"),
        orderBy("createdAt", "desc"),
        limit(20)
      );

      const querySnapshot = await getDocs(notifQuery);

      const fetchedNotifs: Notification[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const createdAtDate = data.createdAt ? data.createdAt.toDate() : new Date();

        return {
          id: doc.id,
          name: data.sourceUser || "System Scheduler",
          // ⭐ UPDATED: Using title and description for message display
          message: data.description || "No description provided.",
          category: 'Notification',
          time: formatTime(createdAtDate),
          read: data.read || false,
          // ⭐ FETCHED: Scheduled Date
          scheduledDate: data.scheduledDate || 'Not set',
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

  useEffect(() => {
    fetchNotifications();
  }, []);

  // =================================================================
  // ⭐ ACTION: Mark Single Notification as Read
  // =================================================================
  const handleMarkAsRead = async (notifId: string) => {
    if (isSaving) return;
    setIsSaving(true);
    setError(null);

    try {
      const notifDocRef = doc(db, "notifications", notifId);
      await updateDoc(notifDocRef, {
        read: true,
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
      );

    } catch (error) {
      console.error("Error marking notification as read:", error);
      setError("Could not update status in the database.");
    } finally {
      setIsSaving(false);
    }
  };


  const markAllAsRead = () => {
    // TODO: Implement batch write to Firestore for optimal performance
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    // TODO: Should implement bulk delete in Firestore
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
      {isSaving && (
        <div className="py-2 text-center text-primary-500">Updating status...</div>
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
                  {/* 1. Main Title/Source */}
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {notif.name}
                    </span>{" "}

                    <span className="text-sm italic text-gray-600 dark:text-gray-400">
                      (Scheduled on: {notif.scheduledDate})
                    </span>
                  </p>

                  {/* 2. Description (Full Message) */}
                  <p className="text-gray-800 dark:text-gray-300 mt-1 mb-2">
                    {notif.message}
                  </p>

                  {/* 3. Footer Details */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{notif.category}</span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    <span>{notif.time}</span>
                  </div>
                </div>

                {!notif.read && (
                  <button
                    onClick={() => handleMarkAsRead(notif.id)}
                    className="text-xs font-medium text-orange-600 bg-orange-100 dark:bg-orange-900 px-3 py-1 rounded-full hover:bg-orange-200 dark:hover:bg-orange-800"
                    disabled={isSaving}
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