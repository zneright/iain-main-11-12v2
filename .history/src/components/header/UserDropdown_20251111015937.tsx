import { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Link } from "react-router";
// -------------------------------------------------------------------------
// FIREBASE IMPORTS
// -------------------------------------------------------------------------
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";
// -------------------------------------------------------------------------

// Interface for the Company Data we expect to fetch
interface CompanyProfile {
  companyName: string;
  email: string;
  image: string; // Placeholder for company logo URL
}

const COMPANY_DOC_ID = 'enzalada-main';
const COMPANY_COLLECTION = 'company_settings';


export default function CompanyDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [company, setCompany] = useState<CompanyProfile>({
    companyName: 'Loading...',
    email: 'Loading...',
    image: '/images/admin/default-company.jpg', // Placeholder logo
  });
  const [loading, setLoading] = useState(true);

  // =================================================================
  // 🎯 FIREBASE FETCH LOGIC
  // =================================================================
  useEffect(() => {
    const fetchCompanyProfile = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, COMPANY_COLLECTION, COMPANY_DOC_ID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          setCompany({
            companyName: data.companyName || 'Enzalada Co.',
            email: data.email || 'contact@enzalada.com',
            image: data.logoUrl || '/images/admin/default-company.jpg',
          });
        } else {
          setCompany({
            companyName: 'Profile Missing',
            email: 'Check DB settings',
            image: '/images/admin/default-company.jpg',
          });
        }
      } catch (err) {
        console.error("Error fetching company profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyProfile();
  }, []);
  // =================================================================

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  // Determine displayed name
  const displayedName = loading ? 'Loading...' : company.companyName.split(' ')[0] || 'Admin';


  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dropdown-toggle dark:text-gray-400"
        disabled={loading}
      >
        <span className="mr-3 overflow-hidden rounded-full h-11 w-11">
          {/* Use company image */}
          <img
            src={company.image}
            alt={company.companyName}
            onError={(e) => { e.currentTarget.src = '/images/admin/default-company.jpg'; }}
          />
        </span>

        {/* Display company name (first word) or loading state */}
        <span className="block mr-1 font-medium text-theme-sm">{displayedName}</span>
        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
            }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div>
          {/* Full Name / Company Name */}
          <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
            {company.companyName}
          </span>
          {/* Email */}
          <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
            {company.email}
          </span>
        </div>

        <ul className="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag={Link}
              to="/company-profile" {/* Directs to the company profile page */}
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              {/* SVG for Edit Profile (Standard Person Icon) */}
              <svg className="fill-gray-500 group-hover:fill-gray-700 dark:fill-gray-400 dark:group-hover:fill-gray-300" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 14.1526 4.3002 16.1184 5.61936 17.616C6.17279 15.3096 8.24852 13.5955 10.7246 13.5955H13.2746C15.7509 13.5955 17.8268 15.31 18.38 17.6167C19.6996 16.119 20.5 14.153 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5ZM17.0246 18.8566V18.8455C17.0246 16.7744 15.3457 15.0955 13.2746 15.0955H10.7246C8.65354 15.0955 6.97461 16.7744 6.97461 18.8455V18.856C8.38223 19.8895 10.1198 20.5 12 20.5C13.8798 20.5 15.6171 19.8898 17.0246 18.8566ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM11.9991 7.25C10.8847 7.25 9.98126 8.15342 9.98126 9.26784C9.98126 10.3823 10.8847 11.2857 11.9991 11.2857C13.1135 11.2857 14.0169 10.3823 14.0169 9.26784C14.0169 8.15342 13.1135 7.25 11.9991 7.25ZM8.48126 9.26784C8.48126 7.32499 10.0563 5.75 11.9991 5.75C13.9419 5.75 15.5169 7.32499 15.5169 9.26784C15.5169 11.2107 13.9419 12.7857 11.9991 12.7857C10.0563 12.7857 8.48126 11.2107 8.48126 9.26784Z" fill="currentColor" />
              </svg>
              Edit Company Profile
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag={Link}
              to="/settings"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              {/* SVG for Account settings */}
              <svg className="fill-gray-500 group-hover:fill-gray-700 dark:fill-gray-400 dark:group-hover:fill-gray-300" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M13.5182 20.5H10.4858C9.25201 20.5 8.25182 19.4998 8.25182 18.266C8.25182 17.7012 7.64013 17.3479 7.15065 17.6305C6.08213 18.2474 4.71559 17.8814 4.0986 16.8128L2.58261 14.187C1.96575 13.1186 2.33183 11.7523 3.40025 11.1355C3.88948 10.8531 3.88947 10.147 3.40026 9.86449C2.33184 9.24759 1.96578 7.88147 2.58263 6.81303L4.09863 4.18725C4.71562 3.11899 6.08215 2.75293 7.15067 3.36955C7.64015 3.65215 8.25182 3.29884 8.25182 2.73399C8.25182 1.50019 9.25201 0.5 10.4858 0.5H13.5182C14.7519 0.5 15.7518 1.50019 15.7518 2.73377C15.7518 3.29856 16.3632 3.65138 16.852 3.36917C17.9202 2.75241 19.2862 3.11842 19.9029 4.18667L21.4193 6.8131C22.0361 7.88152 21.6701 9.24771 20.6017 9.86449C20.1125 10.147 20.1125 10.8531 20.6017 11.1355C21.6701 11.7523 22.0362 13.1185 21.4193 14.1869L19.903 16.8134C19.2862 17.8816 17.9202 18.2476 16.852 17.6309C16.3632 17.3487 15.7518 17.7015 15.7518 18.2663C15.7518 19.4998 14.7519 20.5 13.5182 20.5ZM12.0009 14.3349C10.7113 14.3349 9.6659 13.2895 9.6659 11.9999C9.6659 10.7103 10.7113 9.66493 12.0009 9.66493C13.2905 9.66493 14.3359 10.7103 14.3359 11.9999C14.3359 13.2895 13.2905 14.3349 12.0009 14.3349ZM12.0009 8.16493C9.88289 8.16493 8.1659 9.88191 8.1659 11.9999C8.1659 14.1179 9.88289 15.8349 12.0009 15.8349C14.1189 15.8349 15.8359 14.1179 15.8359 11.9999C15.8359 9.88191 14.1189 8.16493 12.0009 8.16493Z" fill="currentColor" />
              </svg>
              Account settings
            </DropdownItem>
          </li>
        </ul>
        <Link
          to="/signin"
          className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
        >
          {/* SVG for Sign out */}
          <svg className="fill-gray-500 group-hover:fill-gray-700 dark:group-hover:fill-gray-300" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M15.1007 19.247C14.6865 19.247 14.3507 18.9112 14.3507 18.497L14.3507 14.245H12.8507V18.497C12.8507 19.7396 13.8581 20.747 15.1007 20.747H18.5007C19.7434 20.747 20.7507 19.7396 20.7507 18.497L20.7507 5.49609C20.7507 4.25345 19.7433 3.24609 18.5007 3.24609H15.1007C13.8581 3.24609 12.8507 4.25345 12.8507 5.49609V9.74501L14.3507 9.74501V5.49609C14.3507 5.08188 14.6865 4.74609 15.1007 4.74609L18.5007 4.74609C18.9149 4.74609 19.2507 5.08188 19.2507 5.49609L19.2507 18.497C19.2507 18.9112 18.9149 19.247 18.5007 19.247H15.1007ZM3.25073 11.9984C3.25073 12.2144 3.34204 12.4091 3.48817 12.546L8.09483 17.1556C8.38763 17.4485 8.86251 17.4487 9.15549 17.1559C9.44848 16.8631 9.44863 16.3882 9.15583 16.0952L5.81116 12.7484L16.0007 12.7484C16.4149 12.7484 16.7507 12.4127 16.7507 11.9984C16.7507 11.5842 16.4149 11.2484 16.0007 11.2484L5.81528 11.2484L9.15585 7.90554C9.44864 7.61255 9.44847 7.13767 9.15547 6.84488C8.86248 6.55209 8.3876 6.55226 8.09481 6.84525L3.52309 11.4202C3.35673 11.5577 3.25073 11.7657 3.25073 11.9984Z" fill="currentColor" />
          </svg>
          Sign out
        </Link>
      </Dropdown>
    </div>
  );
}