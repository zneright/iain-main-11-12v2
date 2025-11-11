// EnzaladaCompanyProfile.tsx (Container Page)

import PageBreadcrumb from "../components/common/PageBreadCrumb";
// Imports for Company-specific components (renamed from UserProfile)
import CompanyMetaCard from "../components/CompanyProfile/CompanyMetaCard";
import CompanyInfoCard from "../components/CompanyProfile/CompanyInfoCard";
import CompanyAddressCard from "../components/CompanyProfile/CompanyAddressCard";
import PageMeta from "../components/common/PageMeta";

export default function EnzaladaCompanyProfile() {
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
        <div className="space-y-6">
          {/* These components must be renamed and implemented in your project structure */}
          <CompanyMetaCard />
          <CompanyInfoCard />
          <CompanyAddressCard />
        </div>
      </div>
    </>
  );
}