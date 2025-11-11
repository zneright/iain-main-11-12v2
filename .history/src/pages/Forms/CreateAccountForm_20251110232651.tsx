import { useState } from "react";
// -------------------------------------------------------------------------
// FIREBASE IMPORTS
// -------------------------------------------------------------------------
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
// NOTE: Adjust this path as necessary
import { auth, db } from "../../../firebase";
// -------------------------------------------------------------------------

// Component Imports
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import DefaultInputs from "../../components/form/form-elements/ProfileInfoForm";
import InputGroup from "../../components/form/form-elements/EmailAndPhoneInput";
import AddressInfo from "../../components/form/form-elements/AddressInput";
import Button from "../../components/ui/button/Button";
import PageMeta from "../../components/common/PageMeta";

// Define the type for the form data (for robust TypeScript use)
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
  [key: string]: string; // Allows dynamic property access in handleInputChange
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
  // Corrected state types for TypeScript
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /**
   * Central handler to update state from any child input component.
   * @param name The name attribute of the input field (e.g., 'email', 'firstName').
   * @param value The new value of the input field.
   */
  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
    setSuccessMessage(null);
  };

  // Main Firebase submission logic
  const handleCreateAccount = async () => {
    setError(null);
    setSuccessMessage(null);

    // Basic validation check
    if (!formData.email || !formData.password || !formData.firstName) {
      setError("Email, Password, and First Name are required.");
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

      // 2. Firestore: Save Profile Data to the 'accounts' collection
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
        role: 'admin', // Example: set a default role
        createdAt: new Date(),
      };

      // The document ID is set to the user's UID for easy lookup
      await setDoc(doc(db, "accounts", user.uid), profileData);

      console.log("Account created and data saved for UID:", user.uid);
      setSuccessMessage("New account created successfully!");
      setFormData(initialFormData); // Clear form

    } catch (authError: any) {
      console.error("Firebase Error:", authError);
      let errorMessage = "Failed to create account.";

      // Handle specific Firebase Authentication errors
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          {/* Pass the handler down to the child components */}
          <DefaultInputs onInputChange={handleInputChange} formData={formData} />
          <InputGroup onInputChange={handleInputChange} formData={formData} />
        </div>

        <div className="space-y-6">
          <AddressInfo onInputChange={handleInputChange} formData={formData} />

          <div className="flex items-center gap-5 justify-end">
            <Button
              size="md"
              variant="primary"
              onClick={handleCreateAccount} // ⬅️ The click triggers the Firebase logic
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Account"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}