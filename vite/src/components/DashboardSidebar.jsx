import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Layout, Menu, Button } from "antd";
import Theme from "@/hooks/Theme";
import ThemeSwitcher from "@/hooks/ThemeSwitcher";
import { useAuth } from "@/utils/AuthProvider";

const { Sider } = Layout;

const Sidebar = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const { theme, toggleTheme } = Theme();
    const { user, logout } = useAuth();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const menuItems = user?.role === "admin"
        ? [
            { key: "1", label: <Link to="/dashboard">Dashboard</Link> },
            { key: "2", label: <Link to="/a/users">Manage Users</Link> },
            { key: "3", label: <Link to="/a/transactions">Transactions</Link> },
            { key: "4", label: <Link to="/a/verifyrequest">Verify Request</Link> },
            { key: "5", label: <Link to="/a/withdrawrequest">Withdraw Request</Link> },
            { key: "6", label: <Link to="/a/reports">Reports</Link> },
        ]
        : [
            { key: "1", label: <Link to="/dashboard">Dashboard</Link> },
            
            ...(user?.verified
                ? [
                    { key: "2", label: <Link to="/u/link">Link</Link> },
                    { key: "3", label: <Link to="/u/history">History</Link> },
                    { key: "4", label: <Link to="/u/withdraw">Withdraw</Link> },
                    { key: "5", label: <Link to="/u/report">Report</Link> }
                ]
                : []),  
            
            ...(user?.verified ? [] : [{ key: "7", label: <Link to="/verify">Verify Account</Link> }])
        ];
    const getSelectedKey = (pathname) => {
        switch (pathname) {
            case "/dashboard": return "1";
            case "/a/users": return "2";
            case "/a/transactions": return "3";
            case "/a/verifyrequest": return "4";
            case "/a/withdrawrequest": return "5";
            case "/a/reports": return "6";
            case "/u/link": return "2";
            case "/u/history": return "3";
            case "/u/withdraw": return "4";
            case "/u/report": return "5";
            case "/verify": return "7";
            default: return "1";
        }
    };


    if (isMobile) return null;

    return (
        <Sider width={250} theme={theme} className="hidden md:block">
            <Menu mode="inline" theme={theme} defaultSelectedKeys={[getSelectedKey(location.pathname)]} items={menuItems} />
            <div className="hidden sm:block">
                <Button type="primary" danger onClick={handleLogout} className="absolute bottom-0 w-full">
                    Logout
                </Button>
            </div>
            <div className="absolute bottom-5 w-full flex justify-center items-center">
                <ThemeSwitcher isDarkMode={theme === "dark"} onToggle={toggleTheme} />
            </div>
        </Sider>
    );
};

export default Sidebar;
