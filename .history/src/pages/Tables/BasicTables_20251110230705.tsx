import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/ApplicantsInfo";

export default function BasicTables() {
  return (
    <>
      <PageMeta title="IAIN" description="IAIN Applicants Information Table" />
      <PageBreadcrumb pageTitle="Applicants Information" />
      <div className="space-y-6">
        <BasicTableOne />
      </div>
    </>
  );
}
