import { Layout } from "antd";
import Sidebar from "@/components/DashboardSidebar";
import DashboardNavbar from "@/components/DashboardNavbar";

const { Content } = Layout;

const DashboardLayout = ({ children }) => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <>
        <DashboardNavbar />
        <Layout style={{ paddingTop: "64px" }} className="w-full px-4 mt-3 max-w-full sm:px-0 sm:max-w-none sm:mt-0">
          <Sidebar />
          <Content
            className="dark:text-white md:p-4"
          >
            {children}
          </Content>
        </Layout>
      </>
    </Layout>
  );
};

export default DashboardLayout;
