// BasicTableOne.tsx
import { useState, useEffect } from "react"; // <-- Import useEffect
// -------------------------------------------------------------------------
// FIREBASE IMPORTS
// -------------------------------------------------------------------------
import { collection, getDocs } from "firebase/firestore"; // <-- Import Firestore functions
import { db } from "../../../firebase"; // <-- Adjust path if necessary
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

// Define the structure of the data you get from Firestore.
// Note: Firestore data doesn't naturally have an 'id' that is a number, 
// so we'll use the document ID (uid).
interface Order {
  id: string; // Changed to string to match Firestore UID
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
  address: string; // Contains the combined street, city, etc.
}