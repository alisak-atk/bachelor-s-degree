import TransactionsTable from "@/components/table/TransactionsTable";
import { PageTitle } from "@/hooks/PageTitle";

const Transactions = () => {
    PageTitle("Transactions");
    return (
        <div>
            <TransactionsTable />
        </div>
    );
};

export default Transactions;