// CompanyProfile.tsx (assuming you rename the file from UserProfiles.tsx)

import PageBreadcrumb from "../components/common/PageBreadCrumb";
// ⭐ RENAMED IMPORTS for clarity
import CompanyMetaCard from "../components/CompanyProfile/CompanyMetaCard";
import CompanyInfoCard from "../components/CompanyProfile/CompanyInfoCard";
import CompanyAddressCard from "../components/CompanyProfile/CompanyAddressCard";
import PageMeta from "../components/common/PageMeta";

export default function EnzaladaCompanyProfile() { // ⭐ RENAMED FUNCTION
  return (
    <>
      <PageMeta
        title="Enzalada Company Profile" // ⭐ UPDATED TITLE
        description="IAIN Admin Dashboard Enzalada Company Profile Page"
      />
      <PageBreadcrumb pageTitle="Company Profile" /> {/* ⭐ UPDATED BREADCRUMB */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Enzalada Company Profile {/* ⭐ UPDATED HEADING */}
        </h3>
        <div className="space-y-6">
          {/* ⭐ USE RENAMED COMPONENTS */}
          <CompanyMetaCard />
          <CompanyInfoCard />
          <CompanyAddressCard />
        </div>
      </div>
    </>
  );
}