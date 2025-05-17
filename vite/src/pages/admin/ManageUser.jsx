import ManageUserTable from "@/components/table/ManageUserTable";
import { PageTitle } from "@/hooks/PageTitle";

const ManageUser = () => {
    PageTitle("Users");
    return (
        <div>
            <ManageUserTable />
        </div>
    );
};

export default ManageUser;