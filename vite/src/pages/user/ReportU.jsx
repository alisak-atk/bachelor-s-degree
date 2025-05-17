import ReportUserTable from "@/components/table/ReportUserTable";
import { PageTitle } from "@/hooks/PageTitle";

const ReportU = () => {
  PageTitle("Report");
  return (
    <div>
      <ReportUserTable />
    </div>
  );
};

export default ReportU;