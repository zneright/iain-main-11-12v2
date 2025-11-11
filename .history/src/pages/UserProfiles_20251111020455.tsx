import { useState, useEffect } from "react";
// -------------------------------------------------------------------------
// FIREBASE IMPORTS
// -------------------------------------------------------------------------
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import Input from "../components/form/input/InputField";
import Label from "../components/form/Label";
import Button from "../components/ui/button/Button";

const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/dupjdmjha/image/upload"; // Replace YOUR_CLOUD_NAME
const CLOUDINARY_UPLOAD_PRESET = "companyimage"; 
const DEFAULT_LOGO_URL = "/images/admin/default-company-logo.svg"; 

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
  // ⭐ ADDED: Field for storing the logo URL
  logoUrl: string;
}

// --- 2. FALLBACK/EMPTY DATA ---
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
  logoUrl: DEFAULT_LOGO_URL, // Default logo path
};

// --- 3. REPLACEMENT FOR CHILD COMPONENTS (Editable Forms) ---
// These components now rely on data structure including logoUrl

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
  const COMPANY_DOC_ID = 'enzalada-main';
  const COMPANY_COLLECTION = 'company_settings';

  const [companyData, setCompanyData] = useState<CompanyData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dbExists, setDbExists] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // ⭐ NEW STATE: For handling the file input
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);


  // Handler for text inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompanyData(prev => ({ ...prev, [name]: value }));
    setError(null);
    setSuccessMessage(null);
  };

  // ⭐ NEW HANDLER: For file input changes
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file)); // Show local preview
    }
  };

  // ⭐ NEW HELPER: Function to upload the image to Cloudinary
  const uploadImageToCloudinary = async (file: File): Promise<string | null> => {
    if (CLOUDINARY_UPLOAD_URL.includes("YOUR_CLOUD_NAME")) {
      setError("Cloudinary not configured. Please replace placeholder settings.");
      return null;
    }

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: "POST",
        body: data,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Cloudinary upload failed.");
      }

      const jsonResponse = await response.json();
      return jsonResponse.secure_url; // Return the secure URL
    } catch (uploadError: any) {
      console.error("Cloudinary Upload Error:", uploadError);
      setError(`Image upload failed: ${uploadError.message}`);
      return null;
    }
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
            // ⭐ FETCH: Load saved logo URL
            logoUrl: data.logoUrl || DEFAULT_LOGO_URL,
          });
          setDbExists(true);
        } else {
          setDbExists(false);
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

    if (!companyData.companyName) {
      setError("Company Name is required to save the profile.");
      setSaving(false);
      return;
    }

    let finalLogoUrl = companyData.logoUrl;

    try {
      // ⭐ STEP 1: Upload new image if a file was selected
      if (logoFile) {
        const uploadedUrl = await uploadImageToCloudinary(logoFile);
        if (!uploadedUrl) {
          // If upload failed, error message is already set, stop save process.
          throw new Error("Logo upload failed, stopping profile save.");
        }
        finalLogoUrl = uploadedUrl;
      }

      const docRef = doc(db, COMPANY_COLLECTION, COMPANY_DOC_ID);

      // Structure data to save (including nested address and the new logo URL)
      const dataToSave = {
        companyName: companyData.companyName,
        email: companyData.email,
        phone: companyData.phone,
        industry: companyData.industry,
        registrationDate: companyData.registrationDate,
        logoUrl: finalLogoUrl, // ⭐ SAVE final URL
        address: {
          street: companyData.street,
          city: companyData.city,
          zip: companyData.zip,
          country: companyData.country,
        },
        lastUpdated: new Date(),
      };

      if (dbExists) {
        await updateDoc(docRef, dataToSave);
        setSuccessMessage("Profile updated successfully! 🎉");
      } else {
        await setDoc(docRef, dataToSave);
        setDbExists(true);
        setSuccessMessage("Profile created successfully! 🎉");
      }

      // Update local state with the final saved URL (in case it was newly uploaded)
      setCompanyData(prev => ({ ...prev, logoUrl: finalLogoUrl }));
      setLogoFile(null); // Clear pending file

    } catch (err: any) {
      console.error("Error saving company data:", err);
      // Catch error thrown if upload failed
      if (err.message === "Logo upload failed, stopping profile save.") {
        // Error message already set by uploadImageToCloudinary
      } else {
        setError("Failed to save profile. Check security rules for WRITE permissions on 'company_settings'.");
      }
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

            {/* ⭐ LOGO UPLOAD SECTION */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <h4 className="text-md font-semibold text-gray-800 dark:text-white/90 mb-4">Company Logo</h4>
              <div className="flex items-center space-x-6">
                <img
                  // Use local preview if available, otherwise use saved URL (or default)
                  src={logoPreview || companyData.logoUrl}
                  alt="Company Logo"
                  className="w-20 h-20 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                  onError={(e) => { e.currentTarget.src = DEFAULT_LOGO_URL; }}
                />
                <label className="cursor-pointer">
                  <span className="bg-brand-500 hover:bg-brand-600 text-white font-medium py-2 px-4 rounded-lg transition text-sm">
                    {logoFile ? "Change Selected Image" : "Upload New Logo"}
                  </span>
                  {/* Input field to select file */}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoFileChange}
                  />
                </label>
              </div>
            </div>
            {/* END LOGO UPLOAD */}


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