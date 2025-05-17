import { Layout } from "antd";
import HomeNavbar from "@/components/HomeNavbar";

const { Content } = Layout;

const HomeLayout = ({children}) => {
    return (
        <Layout style={{ minHeight: "100vh" }} className="overflow-hidden">
            <>
                <Layout>
                    <HomeNavbar />
                    <Content style={{ minHeight: "100%" }} className="dark:text-white md:p-4" >
                        {children}
                    </Content>
                </Layout>
            </>
        </Layout>
    );
};

export default HomeLayout;
