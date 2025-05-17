import ReportAdminTable from "@/components/table/ReportAdminTable";
import { PageTitle } from "@/hooks/PageTitle";
const ReportA = () => {
    PageTitle("Report");
    return (
        <div>
            <ReportAdminTable />
        </div>
    );
};

export default ReportA;