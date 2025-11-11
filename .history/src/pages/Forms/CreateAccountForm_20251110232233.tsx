import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
// NOTE: Adjust this path as necessary
import { auth, db } from "../../../firebase";

import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import DefaultInputs from "../../components/form/form-elements/ProfileInfoForm";
import InputGroup from "../../components/form/form-elements/EmailAndPhoneInput";
import AddressInfo from "../../components/form/form-elements/AddressInput";
import Button from "../../components/ui/button/Button";
import PageMeta from "../../components/common/PageMeta";

// Initial state structure matching your form inputs
const initialFormData = {
  email: '',
  password: '', // Should be collected securely, likely in DefaultInputs or InputGroup
  firstName: '',
  lastName: '',
  phone: '',
  street: '',
  city: '',
  zip: '',
  country: '',
  // Add all fields collected by child components here
};

export default function CreateAccount() {
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Central handler to update state from any child input component
  const handleInputChange = (name, value) => {
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
        role: 'admin', // Example: set a default role
        createdAt: new Date(),
      };

      await setDoc(doc(db, "accounts", user.uid), profileData);

      console.log("Account created and data saved for UID:", user.uid);
      setSuccessMessage("New account created successfully!");
      setFormData(initialFormData); // Clear form

    } catch (authError) {
      console.error("Firebase Error:", authError);
      let errorMessage = "Failed to create account.";
      if (authError.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered.";
      } else if (authError.code === "auth/weak-password") {
        errorMessage = "Password must be at least 6 characters.";
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
              onClick={handleCreateAccount} // ⬅️ Attach the handler to the button
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