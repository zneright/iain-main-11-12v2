// BasicTables.tsx

import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/ApplicantsInfo";

/**
 * The container component for displaying the Applicants Information Table.
 * It sets the page title, breadcrumb, and renders the data table component.
 */
export default function BasicTables() {
  return (
    <>
      <PageMeta
        title="IAIN"
        description="IAIN Applicants Information Table"
      />
      <PageBreadcrumb pageTitle="Applicants Information" />
      <div className="space-y-6">
        {/* BasicTableOne fetches user data from Firestore and displays it */}
        <BasicTableOne />
      </div>
    </>
  );
}