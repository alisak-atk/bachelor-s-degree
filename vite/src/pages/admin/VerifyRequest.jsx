
import VerifyRequestTable from "@/components/table/VerifyRequestTable";
import { PageTitle } from "@/hooks/PageTitle";

const VerifyRequest = () => {
  PageTitle("VerifyRequest");
  return (
    <div>
      <VerifyRequestTable/>
    </div>
  );
};

export default VerifyRequest;