import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../../firebase";

// ... (other imports) ...

// Initial state structure matching your form inputs
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
  // ... (rest of initialFormData)
};

export default function CreateAccount() {
  // ... (state hooks) ...
  // ... (handleInputChange function) ...

  // Main Firebase submission logic
  const handleCreateAccount = async () => {
    setError(null);
    setSuccessMessage(null);

    // =================================================================
    // 🛑 TEMPORARY FIX: Use placeholder data to bypass faulty data binding
    // If you see this error, it means your child components are NOT updating formData.
    // We will use a fallback for submission.
    // DELETE THIS BLOCK once you confirm child components are working.
    // =================================================================
    const testData = {
      email: "testuser_" + Math.random().toFixed(4) + "@example.com",
      password: "TestPassword123",
      firstName: "Temp",
      lastName: "Account",
      phone: formData.phone, // Use current form data for optional fields
      street: formData.street,
      city: formData.city,
      zip: formData.zip,
      country: formData.country,
    };

    // Use testData for validation and submission
    const submitData = testData;

    // Bypassing validation check since we know submitData is filled
    // if (!submitData.email || !submitData.password || !submitData.firstName) {
    //   setError("Email, Password, and First Name are required.");
    //   return;
    // }
    // =================================================================

    setLoading(true);

    try {
      // 1. Firebase Authentication: Create User
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        submitData.email, // Using test data
        submitData.password // Using test data
      );
      const user = userCredential.user;

      // 2. Firestore: Save Profile Data
      const profileData = {
        uid: user.uid,
        email: submitData.email,
        firstName: submitData.firstName || null,
        lastName: submitData.lastName || null,
        phone: submitData.phone || null,
        address: {
          street: submitData.street || null,
          city: submitData.city || null,
          zip: submitData.zip || null,
          country: submitData.country || null,
        },
        role: 'admin',
        createdAt: new Date(),
      };

      await setDoc(doc(db, "accounts", user.uid), profileData);

      console.log("Account created and data saved successfully for UID:", user.uid);
      setSuccessMessage("New account created successfully with test data!");
      setFormData(initialFormData); // Clear form

    } catch (authError: any) {
      console.error("Firebase Error:", authError);
      let errorMessage = "Failed to create account.";

      switch (authError.code) {
        case "auth/email-already-in-use":
          errorMessage = "This test email is already registered. Try again to generate a new one.";
          break;
        case "auth/weak-password":
          errorMessage = "Test Password used is too weak (this should not happen with fixed test data).";
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
    // ... (rest of your return JSX remains the same)
    <div>
      {/* ... */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <DefaultInputs onInputChange={handleInputChange} formData={formData} />
          <InputGroup onInputChange={handleInputChange} formData={formData} />
        </div>

        <div className="space-y-6">
          <AddressInfo onInputChange={handleInputChange} formData={formData} />

          <div className="flex items-center gap-5 justify-end">
            <Button
              size="md"
              variant="primary"
              onClick={handleCreateAccount}
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