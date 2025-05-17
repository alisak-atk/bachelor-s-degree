import HistoryTable from "@/components/table/HistoryTable";
import { PageTitle } from "@/hooks/PageTitle";

const History = () => {
  PageTitle("History");
  return (
    <div>
      <HistoryTable />
    </div>
  );
};

export default History;