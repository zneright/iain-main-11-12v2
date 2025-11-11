import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import DefaultInputs from "../../components/form/form-elements/ProfileInfoForm";
import InputGroup from "../../components/form/form-elements/EmailAndPhoneInput";
import AddressInfo from "../../components/form/form-elements/AddressInput";
import Button from "../../components/ui/button/Button";

import PageMeta from "../../components/common/PageMeta";

export default function CreateAccount() {
  return (
    <div>
      <PageMeta
        title="IAIN"
        description="IAIN admin dashboard create account form page"
      />
      <PageBreadcrumb pageTitle="Create Account" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <DefaultInputs />
          <InputGroup />
        </div>

        <div className="space-y-6">
          <AddressInfo />
          <div className="flex items-center gap-5 justify-end">
            <Button size="md" variant="primary">
              Create Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
