import { useState, useEffect } from "react";
// -------------------------------------------------------------------------
// FIREBASE IMPORTS
// -------------------------------------------------------------------------
import { doc, getDoc } from "firebase/firestore";
// NOTE: Adjust the path to firebase.js based on your file structure
import { db } from "../../../firebase";
// -------------------------------------------------------------------------

import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
// Assuming Input and Label are available for consistent styling (though not used directly in the cards below)
// import Input from "../components/form/input/InputField"; 
// import Label from "../components/form/Label"; 

// --- 1. INTERFACES ---
interface CompanyData {
  companyName: string;
  email: string;
  phone: string;
  // Meta/Info
  industry: string;
  registrationDate: string;
  // Address
  street: string;
  city: string;
  zip: string;
  country: string;
}

// --- 2. DUMMY/FALLBACK DATA ---
const initialData: CompanyData = {
  companyName: 'Loading...',
  email: 'N/A',
  phone: 'N/A',
  industry: 'N/A',
  registrationDate: 'N/A',
  street: 'N/A',
  city: 'N/A',
  zip: 'N/A',
  country: 'N/A',
};

// --- 3. REPLACEMENT FOR CHILD COMPONENTS (Render Helpers) ---

// Component 1: CompanyMetaCard replacement
const CompanyMetaCard = ({ data }: { data: CompanyData }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
    <h4 className="text-md font-semibold text-gray-800 dark:text-white/90">Company Overview</h4>
    <div className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
      <p><strong>Name:</strong> {data.companyName}</p>
      <p><strong>Industry:</strong> {data.industry}</p>
      <p><strong>Registered:</strong> {data.registrationDate}</p>
    </div>
  </div>
);

// Component 2: CompanyInfoCard replacement
const CompanyInfoCard = ({ data }: { data: CompanyData }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
    <h4 className="text-md font-semibold text-gray-800 dark:text-white/90">Contact Details</h4>
    <div className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
      <p><strong>Email:</strong> {data.email}</p>
      <p><strong>Phone:</strong> {data.phone}</p>
    </div>
  </div>
);

// Component 3: CompanyAddressCard replacement
const CompanyAddressCard = ({ data }: { data: CompanyData }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
    <h4 className="text-md font-semibold text-gray-800 dark:text-white/90">Official Address</h4>
    <div className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
      <p><strong>Street:</strong> {data.street}</p>
      <p><strong>City/Zip:</strong> {data.city}, {data.zip}</p>
      <p><strong>Country:</strong> {data.country}</p>
    </div>
  </div>
);


export default function EnzaladaCompanyProfile() {
  const [companyData, setCompanyData] = useState<CompanyData>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // =================================================================
  // 🎯 FIREBASE FETCH LOGIC
  // =================================================================
  useEffect(() => {
    const fetchCompanyData = async () => {
      const COMPANY_DOC_ID = 'enzalada-main'; // ⭐ CRITICAL: Hardcoded document ID
      setLoading(true);
      setError(null);
      try {
        // Target the specific document in the 'company_settings' collection
        const docRef = doc(db, "company_settings", COMPANY_DOC_ID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          // Format Firestore data to match our local state interface
          const fetchedData: CompanyData = {
            companyName: data.name || 'Enzalada',
            email: data.email || 'N/A',
            phone: data.phone || 'N/A',
            industry: data.industry || 'Food Service',
            registrationDate: data.registered_on
              ? new Date(data.registered_on).toLocaleDateString()
              : 'N/A',
            street: data.address?.street || 'N/A',
            city: data.address?.city || 'N/A',
            zip: data.address?.zip || 'N/A',
            country: data.address?.country || 'N/A',
          };
          setCompanyData(fetchedData);
        } else {
          setError("No company profile document found.");
        }
      } catch (err) {
        console.error("Error fetching company data:", err);
        setError("Failed to load company data. Check console/security rules.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, []);
  // =================================================================

  return (
    <>
      <PageMeta
        title="Enzalada Company Profile"
        description="IAIN Admin Dashboard Enzalada Company Profile Page"
      />
      <PageBreadcrumb pageTitle="Company Profile" />

      {/* Main Content Area */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Enzalada Company Profile
        </h3>

        {loading && (
          <div className="text-center py-10 text-gray-500">Loading company details...</div>
        )}

        {error && (
          <div className="text-center py-5 text-error-500 border border-error-500 bg-red-100 rounded-lg">
            Error: {error}
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-6">
            {/* Render using the helper functions/components */}
            <CompanyMetaCard data={companyData} />
            <CompanyInfoCard data={companyData} />
            <CompanyAddressCard data={companyData} />
          </div>
        )}
      </div>
    </>
  );
}