import { useState, useEffect } from "react";
// -------------------------------------------------------------------------
// FIREBASE IMPORTS
// -------------------------------------------------------------------------
import { collection, getDocs, orderBy, query, limit, doc, updateDoc } from "firebase/firestore";
// NOTE: Adjust the path to firebase.js based on your file structure
import { db } from "../../../firebase";
// -------------------------------------------------------------------------

import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Link } from "react-router";
import { Bell } from "lucide-react";

// Define the structure for the notification items
interface Notification {
  id: string;
  title: string;
  description: string;
  category: string; // This will hold the dynamic type (e.g., Interview)
  time: string; // Formatted time ago
  read: boolean;
}

// Helper function to format timestamp/date into "X time ago"
const formatTime = (timestamp: Date) => {
  if (isNaN(timestamp.getTime())) return 'N/A';
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr ago`;
  return timestamp.toLocaleDateString();
};


export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // State driven by unread count
  const notifying = notifications.some(n => !n.read);


  // =================================================================
  // 🎯 FIREBASE FETCH LOGIC
  // =================================================================
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Query the latest 5 notifications, ordered by creation date
      const notifQuery = query(
        collection(db, "notifications"),
        orderBy("createdAt", "desc"),
        limit(5)
      );

      const querySnapshot = await getDocs(notifQuery);

      const fetchedNotifs: Notification[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const createdAtDate = data.createdAt && data.createdAt.toDate
          ? data.createdAt.toDate()
          : new Date();

        const safeDescription = String(data.description || "View details.");

        return {
          id: doc.id,
          title: data.title || "New Message",
          description: safeDescription,
          // ⭐ FIX: Map the 'type' field from Firestore to the local 'category' field
          category: data.type || 'General',
          time: formatTime(createdAtDate),
          read: data.read || false,
        };
      });

      setNotifications(fetchedNotifs);
    } catch (err) {
      console.error("Error fetching dropdown notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts and refresh when dropdown opens
  useEffect(() => {
    fetchNotifications();
  }, []);


  // =================================================================
  // 🎯 HANDLERS
  // =================================================================

  const handleClick = () => {
    toggleDropdown();
  };

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleItemClick = async (notif: Notification) => {
    // 1. Mark as read in Firestore
    if (!notif.read) {
      try {
        const notifDocRef = doc(db, "notifications", notif.id);
        await updateDoc(notifDocRef, { read: true });

        // Optimistically update local state
        setNotifications(prev =>
          prev.map(n => (n.id === notif.id ? { ...n, read: true } : n))
        );
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }

    // 2. Close dropdown and redirect to the full notification page
    closeDropdown();

    // Redirect to the full notification list page
    window.location.assign('/notifications');
  };


  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleClick}
      >
        <span
          className={`absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400 ${!notifying ? "hidden" : "flex"
            }`}
        >
          <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
        </span>
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Notification
          </h5>
          <button
            onClick={toggleDropdown}
            className="text-gray-500 transition dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            {/* Closing icon SVG */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z" />
            </svg>
          </button>
        </div>
        <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
          {loading ? (
            <li className="text-center py-5 text-gray-500">Fetching notifications...</li>
          ) : notifications.length === 0 ? (
            <li className="text-center py-5 text-gray-500">No recent notifications.</li>
          ) : (
            notifications.map((notif) => (
              <li key={notif.id}>
                <DropdownItem
                  onItemClick={() => handleItemClick(notif)}
                  className={`flex gap-3 rounded-lg p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5 ${!notif.read ? 'bg-orange-50 dark:bg-orange-950' : ''
                    }`}
                >
                  {/* Dummy Image/Icon placeholder */}
                  <span className="relative block w-full h-10 rounded-full z-1 max-w-10 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                    <Bell size={20} className="text-gray-500" />
                    {/* Only show success dot if notification is read */}
                    {notif.read && <span className="absolute bottom-0 right-0 z-10 h-2.5 w-full max-w-2.5 rounded-full border-[1.5px] border-white bg-success-500 dark:border-gray-900"></span>}
                  </span>

                  <span className="block">
                    <span className="mb-1.5 block text-theme-sm text-gray-500 dark:text-gray-400">
                      {/* Notification Title */}
                      <span className="font-medium text-gray-800 dark:text-white/90">
                        {notif.title}
                      </span>
                      {/* Short Description snippet */}
                      <span className="text-gray-700 dark:text-gray-300 ml-1">
                        — {notif.description.substring(0, 30)}{notif.description.length > 30 ? '...' : ''}
                      </span>
                    </span>

                    <span className="flex items-center gap-2 text-gray-500 text-theme-xs dark:text-gray-400">
                      {/* ⭐ FIX: Using the category/type */}
                      <span className="font-medium text-blue-600 dark:text-blue-400">{notif.category}</span>
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span>{notif.time}</span>
                    </span>
                  </span>
                </DropdownItem>
              </li>
            ))
          )}

          {/* View All Link */}
          <li>
            <Link
              to="/notifications"
              onClick={closeDropdown}
              className="block px-4 py-2 mt-3 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              View All Notifications
            </Link>
          </li>
        </ul>
      </Dropdown>
    </div>
  );
}