import { useState } from "react";
// -------------------------------------------------------------------------
// FIREBASE IMPORTS
// -------------------------------------------------------------------------
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../../firebase";
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

const initialFormData: FormData = {
  email: '', password: '', firstName: '', lastName: '', phone: '',
  birthDate: '', gender: '', street: '', city: '', zip: '', country: '',
};

const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/dupjdmjha/image/upload"; // Replace YOUR_CLOUD_NAME
const CLOUDINARY_UPLOAD_PRESET = "applicantprofile"; 

export default function CreateAccount() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null); 
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
    setSuccessMessage(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // Create local URL for preview
    }
  };

  // ⭐ NEW HELPER: Function to upload the image to Cloudinary
  const uploadImageToCloudinary = async (file: File): Promise<string | null> => {
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
      setError(`Image upload error: ${uploadError.message}`);
      return null;
    }
  };


  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validation: All required fields must be filled
    if (!formData.email || !formData.password || !formData.firstName) {
      setError("Email, Password, and First Name are required.");
      setLoading(false);
      return;
    }

    setLoading(true);
    let profileImageUrl: string | null = null;

    try {
      // ⭐ STEP 1: Upload Image (if file is selected)
      if (profileImageFile) {
        profileImageUrl = await uploadImageToCloudinary(profileImageFile);
        if (!profileImageUrl) {
          // If uploadImageToCloudinary returns null, an error was already set.
          throw new Error("Image upload failed, stopping account creation.");
        }
      }

      // 2. Firebase Authentication: Create User
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // 3. Firestore: Save Profile Data
      const profileData = {
        uid: user.uid,
        email: formData.email,
        firstName: formData.firstName || null,
        lastName: formData.lastName || null,
        phone: formData.phone || null,
        birthDate: formData.birthDate || null,
        gender: formData.gender || null,
        // ⭐ ADDED: Save the secure Cloudinary URL
        profileImageUrl: profileImageUrl,
        status: 'Pending',
        address: {
          street: formData.street || null,
          city: formData.city || null,
          zip: formData.zip || null,
          country: formData.country || null,
        },
        createdAt: new Date(),
      };

      await setDoc(doc(db, "accounts", user.uid), profileData);

      console.log("Account created successfully with image URL:", profileImageUrl);
      setSuccessMessage("New account created successfully!");
      setFormData(initialFormData);
      setProfileImageFile(null); // Clear file state
      setImagePreview(null); // Clear preview

    } catch (authError: any) {
      console.error("Account Creation Error:", authError);
      let errorMessage = "Failed to create account.";
      if (authError.message === "Image upload failed, stopping account creation.") {
        // Use the error message set during the image upload step
        errorMessage = error || "Image upload failed unexpectedly.";
      } else if (authError.code === "auth/email-already-in-use") {
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

      {error && (
        <p className="text-error-500 mb-4 p-3 bg-red-100 border border-error-500 rounded">{error}</p>
      )}
      {successMessage && (
        <p className="text-success-500 mb-4 p-3 bg-green-100 border border-success-500 rounded">{successMessage}</p>
      )}

      <form onSubmit={handleCreateAccount}>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="space-y-6">

            {/* --- PROFILE IMAGE UPLOAD --- */}
            <div className="component-card p-5 border border-gray-200 rounded-lg dark:border-gray-800">
              <h2 className="mb-4 font-semibold text-gray-800 dark:text-white/90">Profile Image</h2>
              <div className="flex items-center space-x-4">
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile Preview" className="w-24 h-24 object-cover rounded-full border border-gray-300" />
                ) : (
                  <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 text-xs">No Image</div>
                )}
                <label className="cursor-pointer">
                  <span className="bg-brand-500 hover:bg-brand-600 text-white font-medium py-2 px-4 rounded-lg transition">
                    {profileImageFile ? "Change Image" : "Upload Image"}
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            </div>
            {/* --------------------------- */}

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

                {/* Gender Select Field */}
                <div>
                  <Label>Gender</Label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
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