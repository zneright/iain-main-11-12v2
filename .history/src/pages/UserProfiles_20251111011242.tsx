import { useState, useEffect } from "react";
// -------------------------------------------------------------------------
// FIREBASE IMPORTS
// -------------------------------------------------------------------------
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"; // Added setDoc/updateDoc
import { db } from "../../../firebase";
// -------------------------------------------------------------------------

import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
// Assuming Input, Label, and Button are available
import Input from "../components/form/input/InputField";
import Label from "../components/form/Label";
import Button from "../components/ui/button/Button";

// --- 1. INTERFACES ---
interface CompanyData {
  companyName: string;
  email: string;
  phone: string;
  industry: string;
  registrationDate: string;
  street: string;
  city: string;
  zip: string;
  country: string;
}

// --- 2. FALLBACK/EMPTY DATA ---
// All fields initialize to empty strings, ready for editing/saving.
const emptyData: CompanyData = {
  companyName: '',
  email: '',
  phone: '',
  industry: '',
  registrationDate: '',
  street: '',
  city: '',
  zip: '',
  country: '',
};

// --- 3. REPLACEMENT FOR CHILD COMPONENTS (Editable Forms) ---

// Component 1: CompanyMetaCard replacement (Editable)
const CompanyMetaForm = ({ data, onChange }: { data: CompanyData, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
    <h4 className="text-md font-semibold text-gray-800 dark:text-white/90 mb-4">Company Overview</h4>
    <div className="space-y-3">
      <div>
        <Label htmlFor="companyName">Company Name</Label>
        <Input type="text" id="companyName" name="companyName" value={data.companyName} onChange={onChange} />
      </div>
      <div>
        <Label htmlFor="industry">Industry</Label>
        <Input type="text" id="industry" name="industry" value={data.industry} onChange={onChange} />
      </div>
      <div>
        <Label htmlFor="registrationDate">Registration Date</Label>
        <Input type="text" id="registrationDate" name="registrationDate" placeholder="YYYY-MM-DD" value={data.registrationDate} onChange={onChange} />
      </div>
    </div>
  </div>
);

// Component 2: CompanyInfoCard replacement (Editable)
const CompanyInfoForm = ({ data, onChange }: { data: CompanyData, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
    <h4 className="text-md font-semibold text-gray-800 dark:text-white/90 mb-4">Contact Details</h4>
    <div className="space-y-3">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input type="email" id="email" name="email" value={data.email} onChange={onChange} />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input type="tel" id="phone" name="phone" value={data.phone} onChange={onChange} />
      </div>
    </div>
  </div>
);

// Component 3: CompanyAddressCard replacement (Editable)
const CompanyAddressForm = ({ data, onChange }: { data: CompanyData, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
    <h4 className="text-md font-semibold text-gray-800 dark:text-white/90 mb-4">Official Address</h4>
    <div className="space-y-3">
      <div>
        <Label htmlFor="street">Street</Label>
        <Input type="text" id="street" name="street" value={data.street} onChange={onChange} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input type="text" id="city" name="city" value={data.city} onChange={onChange} />
        </div>
        <div>
          <Label htmlFor="zip">Zip/Postal Code</Label>
          <Input type="text" id="zip" name="zip" value={data.zip} onChange={onChange} />
        </div>
      </div>
      <div>
        <Label htmlFor="country">Country</Label>
        <Input type="text" id="country" name="country" value={data.country} onChange={onChange} />
      </div>
    </div>
  </div>
);


export default function EnzaladaCompanyProfile() {
  const COMPANY_DOC_ID = 'enzalada-main'; // ⭐ CRITICAL: Hardcoded document ID
  const COMPANY_COLLECTION = 'company_settings'; // ⭐ CRITICAL: Collection name

  const [companyData, setCompanyData] = useState<CompanyData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dbExists, setDbExists] = useState(false); // Tracks if the document exists for setDoc/updateDoc
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);


  // Handler for all form inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompanyData(prev => ({ ...prev, [name]: value }));
    setError(null);
    setSuccessMessage(null);
  };


  // =================================================================
  // 🎯 FETCH LOGIC
  // =================================================================
  useEffect(() => {
    const fetchCompanyData = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, COMPANY_COLLECTION, COMPANY_DOC_ID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          setCompanyData({
            companyName: data.companyName || '',
            email: data.email || '',
            phone: data.phone || '',
            industry: data.industry || '',
            registrationDate: data.registrationDate || '',
            street: data.address?.street || '',
            city: data.address?.city || '',
            zip: data.address?.zip || '',
            country: data.address?.country || '',
          });
          setDbExists(true);
        } else {
          setDbExists(false); // Document does not exist, fields remain empty
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


  // =================================================================
  // 💾 SAVE LOGIC (Set or Update)
  // =================================================================
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    // Basic check for required field
    if (!companyData.companyName) {
      setError("Company Name is required to save the profile.");
      setSaving(false);
      return;
    }

    try {
      const docRef = doc(db, COMPANY_COLLECTION, COMPANY_DOC_ID);

      // Structure data to save (including nested address)
      const dataToSave = {
        companyName: companyData.companyName,
        email: companyData.email,
        phone: companyData.phone,
        industry: companyData.industry,
        registrationDate: companyData.registrationDate,
        address: {
          street: companyData.street,
          city: companyData.city,
          zip: companyData.zip,
          country: companyData.country,
        },
        lastUpdated: new Date(),
      };

      if (dbExists) {
        // If document exists, use updateDoc
        await updateDoc(docRef, dataToSave);
        setSuccessMessage("Profile updated successfully! 🎉");
      } else {
        // If document doesn't exist, use setDoc to create it
        await setDoc(docRef, dataToSave);
        setDbExists(true); // Mark as existing for future updates
        setSuccessMessage("Profile created successfully! 🎉");
      }

    } catch (err) {
      console.error("Error saving company data:", err);
      setError("Failed to save profile. Check security rules for WRITE permissions on 'company_settings'.");
    } finally {
      setSaving(false);
    }
  };


  return (
    <>
      <PageMeta
        title="Enzalada Company Profile"
        description="IAIN Admin Dashboard Enzalada Company Profile Page"
      />
      <PageBreadcrumb pageTitle="Company Profile" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Enzalada Company Profile
        </h3>

        {/* Status Messages */}
        {error && (
          <div className="text-center py-2 px-4 mb-4 text-error-500 border border-error-500 bg-red-100 rounded-lg">{error}</div>
        )}
        {successMessage && (
          <div className="text-center py-2 px-4 mb-4 text-success-500 border border-success-500 bg-green-100 rounded-lg">{successMessage}</div>
        )}

        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading company details...</div>
        ) : (
          <div className="space-y-6">
            <CompanyMetaForm data={companyData} onChange={handleInputChange} />
            <CompanyInfoForm data={companyData} onChange={handleInputChange} />
            <CompanyAddressForm data={companyData} onChange={handleInputChange} />

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <Button
                size="lg"
                variant="primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving Changes..." : "Save Profile"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}