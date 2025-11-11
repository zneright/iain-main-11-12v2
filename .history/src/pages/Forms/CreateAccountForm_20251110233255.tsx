import { useState } from "react";
// -------------------------------------------------------------------------
// FIREBASE IMPORTS
// -------------------------------------------------------------------------
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
// NOTE: Adjust this path as necessary
import { auth, db } from "../../../firebase";
// -------------------------------------------------------------------------

// Component Imports (We still need these utility components)
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import PageMeta from "../../components/common/PageMeta";

// Importing base form elements that the original component likely uses
import Label from "../../components/form/Label"; // Assuming path
import Input from "../../components/form/input/InputField"; // Assuming path
// You may need to import PhoneInput and EnvelopeIcon if they are not global

// Define the type for the form data
interface FormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
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

  /**
   * Central handler for all inputs within this component.
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
    setSuccessMessage(null);
  };

  // NOTE: This assumes a simple InputField and ignores the complex PhoneInput component.
  // If you need the PhoneInput's logic, it would have to be implemented here.

  // Main Firebase submission logic (This remains unchanged from your previous correct code)
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    setError(null);
    setSuccessMessage(null);

    // Basic validation check
    if (!formData.email || !formData.password || !formData.firstName) {
      setError("Email, Password, and First Name are required.");
      setLoading(false); // Stop loading if validation fails
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
        address: {
          street: formData.street || null,
          city: formData.city || null,
          zip: formData.zip || null,
          country: formData.country || null,
        },
        role: 'admin',
        createdAt: new Date(),
      };

      await setDoc(doc(db, "accounts", user.uid), profileData);

      console.log("Account created and data saved successfully for UID:", user.uid);
      setSuccessMessage("New account created successfully!");
      setFormData(initialFormData); // Clear form

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

      {/* Display Messages */}
      {error && (
        <p className="text-error-500 mb-4 p-3 bg-red-100 border border-error-500 rounded">{error}</p>
      )}
      {successMessage && (
        <p className="text-success-500 mb-4 p-3 bg-green-100 border border-success-500 rounded">{successMessage}</p>
      )}

      <form onSubmit={handleCreateAccount}>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

          {/* LEFT COLUMN: Profile and Contact Info (previously DefaultInputs and InputGroup) */}
          <div className="space-y-6">

            {/* --- Profile Info (First Name, Last Name, Password) --- */}
            <div className="component-card"> {/* Simulate DefaultInputs */}
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

                {/* Password (Assumed to be here) */}
                <div className="col-span-2">
                  <Label>Password</Label>
                  <Input type="password" name="password" placeholder="Set password" value={formData.password} onChange={handleInputChange} required />
                </div>
              </div>
            </div>

            {/* --- Email and Phone --- */}
            <div className="component-card"> {/* Simulate InputGroup */}
              <h2 className="mb-4 font-semibold text-gray-800 dark:text-white/90">Email and Phone</h2>
              <div className="space-y-4">
                {/* Email */}
                <div>
                  <Label>Email</Label>
                  {/* Simplified Email Input - Assuming no EnvelopeIcon is available */}
                  <Input type="email" name="email" placeholder="info@example.com" value={formData.email} onChange={handleInputChange} required />
                </div>

                {/* Phone */}
                <div>
                  <Label>Phone</Label>
                  {/* Simplified Phone Input - Uses a standard text input instead of complex PhoneInput */}
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