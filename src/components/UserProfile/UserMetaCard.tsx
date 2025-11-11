import { useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";

export default function UserMetaCard() {
  const { isOpen, openModal, closeModal } = useModal();

  const [userData, setUserData] = useState({
    firstName: "Nishia",
    lastName: "Pinlac",
    email: "nishia@pimjo.com",
    phone: "09999999999",
    role: "Team Manager",
    google: "https://www.google.com/",
    linkedin: "https://www.linkedin.com/company/pimjo",
    image: "/images/admin/admin-1.jpg",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUserData((prev) => ({ ...prev, image: imageUrl }));
    }
  };

  const handleSave = () => {
    console.log("Updated user:", userData);
    closeModal();
  };

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          {/* Profile section */}
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="relative w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              <img
                src={userData.image}
                alt="user"
                className="object-cover w-full h-full"
              />
            </div>

            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {userData.firstName} {userData.lastName}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {userData.role}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Arizona, B B is for Budots
                </p>
              </div>
            </div>

            {/* Social Buttons */}
            <div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end">
              {/* Google */}
              <a
                href={userData.google}
                target="_blank"
                rel="noopener"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 bg-white shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 48 48"
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.03 1.54 7.41 2.83l5.46-5.46C33.64 3.63 29.18 1.5 24 1.5 14.82 1.5 7.01 7.29 3.69 15.17l6.84 5.31C12.09 13.83 17.58 9.5 24 9.5z"
                  />
                  <path
                    fill="#34A853"
                    d="M46.5 24.5c0-1.62-.15-3.18-.43-4.68H24v9.14h12.7c-.55 2.97-2.22 5.48-4.73 7.18l7.34 5.7C43.8 38.16 46.5 31.86 46.5 24.5z"
                  />
                  <path
                    fill="#4A90E2"
                    d="M9.53 28.48A14.47 14.47 0 0 1 8.5 24c0-1.56.26-3.06.73-4.48l-6.84-5.31A22.43 22.43 0 0 0 1.5 24c0 3.54.83 6.88 2.39 9.84l6.84-5.36z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M24 46.5c6.18 0 11.36-2.04 15.14-5.55l-7.34-5.7c-2.02 1.36-4.6 2.16-7.8 2.16-6.42 0-11.91-4.33-13.47-10.18l-6.84 5.36C7.01 40.71 14.82 46.5 24 46.5z"
                  />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href={userData.linkedin}
                target="_blank"
                rel="noopener"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 bg-white shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
              >
                <svg
                  className="fill-current"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M5.78381 4.16645C5.78351 4.84504 5.37181 5.45569 4.74286 5.71045C4.11391 5.96521 3.39331 5.81321 2.92083 5.32613C2.44836 4.83904 2.31837 4.11413 2.59216 3.49323C2.86596 2.87233 3.48886 2.47942 4.16715 2.49978C5.06804 2.52682 5.78422 3.26515 5.78381 4.16645ZM5.83381 7.06645H2.50048V17.4998H5.83381V7.06645ZM11.1005 7.06645H7.78381V17.4998H11.0672V12.0248C11.0672 8.97475 15.0422 8.69142 15.0422 12.0248V17.4998H18.3338V10.8914C18.3338 5.74978 12.4505 5.94145 11.0672 8.46642L11.1005 7.06645Z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Edit button */}
          <Button
            onClick={openModal}
            size="sm"
            variant="outline"
            className="w-full lg:w-auto"
          >
            Edit
          </Button>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Edit Personal Information
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Update your details and profile photo below.
          </p>

          <form className="flex flex-col gap-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center gap-3">
              <img
                src={userData.image}
                alt="Profile"
                className="w-24 h-24 rounded-full border border-gray-300 object-cover"
              />
              <label className="cursor-pointer text-blue-600 hover:underline">
                Change Profile Picture
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>

            {/* Social Links */}
            <div>
              <h5 className="mb-3 text-lg font-medium text-gray-800 dark:text-white/90">
                Social Links
              </h5>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Google</Label>
                  <Input
                    name="google"
                    value={userData.google}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label>LinkedIn</Label>
                  <Input
                    name="linkedin"
                    value={userData.linkedin}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Personal Info */}
            <div>
              <h5 className="mb-3 text-lg font-medium text-gray-800 dark:text-white/90">
                Personal Information
              </h5>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>First Name</Label>
                  <Input
                    name="firstName"
                    value={userData.firstName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input
                    name="lastName"
                    value={userData.lastName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label>Email Address</Label>
                  <Input
                    name="email"
                    value={userData.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    name="phone"
                    value={userData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Role</Label>
                  <Input
                    name="role"
                    value={userData.role}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
