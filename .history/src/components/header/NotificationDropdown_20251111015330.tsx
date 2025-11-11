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
import { Bell } from "lucide-react"; // Added missing Lucide Bell icon import

// Define the structure for the notification items
interface Notification {
  id: string;
  title: string;
  description: string;
  category: string;
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
        // ⭐ FIX 1: Safely convert timestamp or use fallback Date
        const createdAtDate = data.createdAt && data.createdAt.toDate
          ? data.createdAt.toDate()
          : new Date();

        // ⭐ FIX 2: Ensure description is a string for substring safety
        const safeDescription = String(data.description || "View details.");

        return {
          id: doc.id,
          title: data.title || "New Message",
          description: safeDescription, // Use safe string
          category: data.category || 'System',
          time: formatTime(createdAtDate),
          read: data.read || false,
        };
      });

      setNotifications(fetchedNotifs);
    } catch (err) {
      console.error("Error fetching dropdown notifications:", err);
      // It's crucial not to leave loading=true on error, otherwise the component is blocked
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
    closeDropdown();

    if (!notif.read) {
      try {
        const notifDocRef = doc(db, "notifications", notif.id);
        await updateDoc(notifDocRef, { read: true });

        setNotifications(prev =>
          prev.map(n => (n.id === notif.id ? { ...n, read: true } : n))
        );
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }

    // TODO: Add routing logic here (e.g., redirect to notification detail page)
  };


  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleClick}
      >
        <span
          className={`absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400 ${