import { useState } from "react";
// -------------------------------------------------------------------------
// FIREBASE IMPORTS
// -------------------------------------------------------------------------
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../../firebase"; // NOTE: Adjust this path as necessary
// -------------------------------------------------------------------------

// Component Imports
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import PageMeta from "../../components/common/PageMeta";

import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";

// Define the type for the form data
interface FormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: string;
  gender: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  [key: string]: string;
}

// Initial state structure for the entire form data
const initialFormData: FormData = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  phone: '',
  birthDate: '',
  gender: '',
  street: '',
  city: '',
  zip: '',
  country: '',
};

export default function CreateAccount() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // This handler manages both <input> and <select> elements
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
    setSuccessMessage(null);
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!formData.email || !formData.password || !formData.firstName) {
      setError("Email, Password, and First Name are required.");
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // 1. Firebase Authentication: Create User
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // 2. Firestore: Save Profile Data
      const profileData = {
        uid: user.uid,
        email: formData.email,
        firstName: formData.firstName || null,
        lastName: formData.lastName || null,
        phone: formData.phone || null,
        birthDate: formData.birthDate || null,
        gender: formData.gender || null,
        address: {
          street: formData.street || null,
          city: formData.city || null,
          zip: formData.zip || null,
          country: formData.country || null,
        },
        createdAt: new Date(),
      };

      await setDoc(doc(db, "accounts", user.uid), profileData);

      console.log("Account created and data saved successfully for UID:", user.uid);
      setSuccessMessage("New account created successfully!");
      setFormData(initialFormData);

    } catch (authError: any) {
      console.error("Firebase Error:", authError);
      let errorMessage = "Failed to create account.";

      switch (authError.code) {
        case "auth/email-already-in-use":
          errorMessage = "This email is already registered.";
          break;
        case "auth/weak-password":
          errorMessage = "Password must be at least 6 characters.";
          break;
        default:
          errorMessage = authError.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageMeta
        title="IAIN"
        description="IAIN admin dashboard create account form page"
      />
      <PageBreadcrumb pageTitle="Create Account" />

      {error && (
        <p className="text-error-500 mb-4 p-3 bg-red-100 border border-error-500 rounded">{error}</p>
      )}
      {successMessage && (
        <p className="text-success-500 mb-4 p-3 bg-green-100 border border-success-500 rounded">{successMessage}</p>
      )}

      <form onSubmit={handleCreateAccount}>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="space-y-6">

            <div className="component-card">
              <h2 className="mb-4 font-semibold text-gray-800 dark:text-white/90">Profile Information</h2>
              <div className="grid grid-cols-2 gap-4">

                {/* First Name */}
                <div>
                  <Label>First Name</Label>
                  <Input type="text" name="firstName" placeholder="Enter first name" value={formData.firstName} onChange={handleInputChange} required />
                </div>

                {/* Last Name */}
                <div>
                  <Label>Last Name</Label>
                  <Input type="text" name="lastName" placeholder="Enter last name" value={formData.lastName} onChange={handleInputChange} />
                </div>

                {/* Birthdate */}
                <div>
                  <Label>Birthdate</Label>
                  <Input type="date" name="birthDate" placeholder="YYYY-MM-DD" value={formData.birthDate} onChange={handleInputChange} />
                </div>

                {/* ⭐ Gender Select Field (Styled) */}
                <div>
                  <Label>Gender</Label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    // 🎨 Applied Tailwind classes for consistent styling
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-700 text-theme-sm transition duration-300 placeholder:text-gray-400 focus:border-brand-500 focus:ring-brand-500 dark:border-white/[0.05] dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-gray-500 dark:focus:border-brand-500 dark:focus:ring-brand-500"
                  >
                    <option value="" disabled>Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                {/* Password  */}
                <div className="col-span-2">
                  <Label>Password</Label>
                  <Input type="password" name="password" placeholder="Set password" value={formData.password} onChange={handleInputChange} required />
                </div>
              </div>
            </div>

            {/* --- Email and Phone --- */}
            <div className="component-card">
              <h2 className="mb-4 font-semibold text-gray-800 dark:text-white/90">Email and Phone</h2>
              <div className="space-y-4">
                {/* Email */}
                <div>
                  <Label>Email</Label>
                  <Input type="email" name="email" placeholder="info@example.com" value={formData.email} onChange={handleInputChange} required />
                </div>

                {/* Phone */}
                <div>
                  <Label>Phone</Label>
                  <Input type="tel" name="phone" placeholder="+64 923 456 7890" value={formData.phone} onChange={handleInputChange} />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">

            {/* --- Address Info --- */}
            <div className="component-card">
              <h2 className="mb-4 font-semibold text-gray-800 dark:text-white/90">Address Information</h2>
              <div className="space-y-4">

                {/* Street */}
                <div>
                  <Label>Street</Label>
                  <Input type="text" name="street" placeholder="Street Address" value={formData.street} onChange={handleInputChange} />
                </div>

                {/* City */}
                <div>
                  <Label>City</Label>
                  <Input type="text" name="city" placeholder="City" value={formData.city} onChange={handleInputChange} />
                </div>

                {/* Zip */}
                <div>
                  <Label>Zip</Label>
                  <Input type="text" name="zip" placeholder="Zip Code" value={formData.zip} onChange={handleInputChange} />
                </div>

                {/* Country */}
                <div>
                  <Label>Country</Label>
                  <Input type="text" name="country" placeholder="Country" value={formData.country} onChange={handleInputChange} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-5 justify-end">
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Account"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}