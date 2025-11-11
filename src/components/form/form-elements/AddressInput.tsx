import ComponentCard from "../../common/ComponentCard";
import Label from "../Label";
import Input from "../input/InputField";

export default function DefaultInputs() {
  return (
    <ComponentCard title="Address Information">
      <div className="space-y-6">
        <div>
          <Label htmlFor="input">Address</Label>
          <Input type="text" id="input" />
        </div>
        <div>
          <Label htmlFor="inputTwo">City</Label>
          <Input type="text" id="inputTwo" />
        </div>
        <div>
          <Label htmlFor="inputTwo">Province</Label>
          <Input type="text" id="inputTwo" />
        </div>
      </div>
      <div>
        <Label htmlFor="inputTwo">ZIP Code</Label>
        <Input type="text" id="inputTwo" />
      </div>
      <div>
        <Label htmlFor="inputTwo">House No. / Street</Label>
        <Input type="text" id="inputTwo" />
      </div>
      <div>
        <Label htmlFor="inputTwo">Barangay / District</Label>
        <Input type="text" id="inputTwo" />
      </div>
    </ComponentCard>
  );
}
