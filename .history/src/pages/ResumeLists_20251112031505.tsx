import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase"; // Adjust this path to your firebase config

// Import your UI components
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../components/ui/table"; // Adjust path as needed
import Badge from "../components/ui/badge/Badge"; // Adjust path as needed
import Button from "../components/ui/button/Button"; // Adjust path as needed
import PageBreadcrumb from "../components/common/PageBreadCrumb"; // Optional
import PageMeta from "../components/common/PageMeta"; // Optional

/**
 * Defines the structure for an applicant's data
 * after we process it from Firestore.
 */
interface Applicant {
  id: string; // The Firestore document ID
  name: string;
  jobTitle: string;
  status: string;
  resumeUrl: string;
  profileImage: string;
}

export default function ResumeListPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from Firestore when the component mounts
  useEffect(() => {
    const fetchApplicants = async () => {
      setLoading(true);
      setError(null);

      try {
        const querySnapshot = await getDocs(collection(db, "applications"));

        const fetchedData: Applicant[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();

          return {
            id: doc.id,
            name: `${data.firstName || ""} ${data.lastName || "Unknown"}`,
            jobTitle: data.jobTitle || "N/A",
            status: data.status || "Pending",
            resumeUrl: data.resumeUrl || "",
            profileImage:
              data.profileImageUrl || "/images/applicants/default-user.jpg",
          };
        });

        setApplicants(fetchedData);
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError("Failed to load applications. Check console for details.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, []); // The empty array [] means this effect runs once on mount

  // Simple handler to open the resume
  const handleViewResume = (resumeUrl: string) => {
    if (resumeUrl) {
      window.open(resumeUrl, "_blank");
    } else {
      alert("No resume URL provided for this applicant.");
    }
  };

  // Helper component for loading state
  const renderLoading = () => (
    <div className="p-4 text-center text-gray-500">Loading applications...</div>
  );

  // Helper component for error state
  const renderError = () => (
    <div className="p-4 text-center text-error-500 border border-error-500 bg-red-50">
      {error}
    </div>
  );

  // Helper component for empty state
  const renderEmpty = () => (
    <div className="p-4 text-center text-gray-500">No applications found.</div>
  );

  // Main table render
  const renderTable = () => (
    <div className="max-w-full overflow-x-auto">
      <Table>
        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
          <TableRow>
            <TableCell isHeader className="px-5 py-3 text-start">
              Applicant
            </TableCell>
            <TableCell isHeader className="px-5 py-3 text-start">
              Job Title
            </TableCell>
            <TableCell isHeader className="px-5 py-3 text-start">
              Status
            </TableCell>
            <TableCell isHeader className="px-5 py-3 text-start">
              Action
            </TableCell>
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
          {applicants.map((applicant) => (
            <TableRow key={applicant.id}>
              {/* Applicant Info */}
              <TableCell className="px-5 py-4 sm:px-6 text-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 overflow-hidden rounded-full">
                    <img
                      width={40}
                      height={40}
                      src={applicant.profileImage}
                      alt={applicant.name}
                    />
                  </div>
                  <div>
                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {applicant.name}
                    </span>
                  </div>
                </div>
              </TableCell>

              {/* Job Title */}
              <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                {applicant.jobTitle}
              </TableCell>

              {/* Status Badge */}
              <TableCell className="px-4 py-3 text-start text-theme-sm">
                <Badge
                  size="sm"
                  color={
                    applicant.status === "Success"
                      ? "success"
                      : applicant.status === "Pending"
                      ? "primary"
                      : applicant.status === "Failed"
                      ? "error"
                      : "secondary"
                  }
                >
                  {applicant.status}
                </Badge>
              </TableCell>

              {/* View Button */}
              <TableCell className="px-4 py-3 text-start">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewResume(applicant.resumeUrl)}
                >
                  View Resume
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <>
      <PageMeta
        title="Resume Applications"
        description="View all resume applications"
      />
      <PageBreadcrumb pageTitle="Resume Applications" />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        {loading && renderLoading()}
        {error && renderError()}
        {!loading && !error && applicants.length === 0 && renderEmpty()}
        {!loading && !error && applicants.length > 0 && renderTable()}
      </div>
    </>
  );
}
