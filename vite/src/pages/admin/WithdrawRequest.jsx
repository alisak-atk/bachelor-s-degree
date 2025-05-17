import WithdrawRequestTable from "@/components/table/WithdrawRequestTable";
import { PageTitle } from "@/hooks/PageTitle";

const WithdrawRequest = () => {
  PageTitle("WithdrawRequest");
  return (
    <div>
      <WithdrawRequestTable/>
    </div>
  );
};

export default WithdrawRequest;