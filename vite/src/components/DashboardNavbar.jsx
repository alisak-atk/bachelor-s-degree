import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Drawer, Button } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import Theme from "@/hooks/Theme";
import ThemeSwitcher from "@/hooks/ThemeSwitcher";
import { useAuth } from "@/utils/AuthProvider";
import { apiUrl } from "@/utils/config";

const DashboardNavbar = () => {
    const { theme, toggleTheme } = Theme();
    const [visible, setVisible] = useState(false);
    const [imageUrl, setImageUrl] = useState(null);
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    const handleMenuClick = () => {
        setVisible(false);
    };
    useEffect(() => {
        if (user?.username === null) return;

        const fetchImage = async () => {
            try {
                const response = await fetch(`${apiUrl}/upload/get-image?userId=${user.id}&cacheBuster=${Date.now()}`, {
                    method: "GET",
                    credentials: "include",
                });

                if (response.ok) {
                    setImageUrl(response.url);
                } else if (response.status === 404) {
                    setImageUrl(null);
                } else {
                    setImageUrl(null);
                }
            } catch (error) {

                setImageUrl(null);
            }
        };


        fetchImage();
    }, [user?.username]);


    const menuItems = user?.role === "admin"
        ? [
            { key: "1", label: <Link to="/dashboard" onClick={handleMenuClick}>Dashboard</Link> },
            { key: "2", label: <Link to="/a/users" onClick={handleMenuClick}>Manage Users</Link> },
            { key: "3", label: <Link to="/a/transactions" onClick={handleMenuClick}>Transactions</Link> },
            { key: "4", label: <Link to="/a/verifyrequest" onClick={handleMenuClick}>Verify Request</Link> },
            { key: "5", label: <Link to="/a/withdrawrequest" onClick={handleMenuClick}>Withdraw Request</Link> },
            { key: "6", label: <Link to="/a/reports" onClick={handleMenuClick}>Reports</Link> },

        ]
        : [
            { key: "1", label: <Link to="/dashboard" onClick={handleMenuClick}>Dashboard</Link> },
            
            ...(user?.verified
                ? [
                    { key: "2", label: <Link to="/u/link" onClick={handleMenuClick}>Link</Link> },
                    { key: "3", label: <Link to="/u/history" onClick={handleMenuClick}>History</Link> },
                    { key: "4", label: <Link to="/u/withdraw" onClick={handleMenuClick}>Withdraw</Link> },
                    { key: "5", label: <Link to="/u/report" onClick={handleMenuClick}>Report</Link> }
                ]
                : []),  
            
            ...(user?.verified ? [] : [{ key: "7", label: <Link to="/verify" onClick={handleMenuClick}>Verify Account</Link> }])
        ];


    return (
        <nav className="fixed top-0 left-0 w-full z-50 h-16 bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center">
            <div className="flex items-center gap-2 relative">
                <div className="relative w-12 h-12">
                    <Link to="/profile">
                        <img
                            src={imageUrl || "https://aui.atlassian.com/aui/8.8/docs/images/avatar-person.svg"}
                            alt="User Avatar"
                            className="w-12 h-12 rounded-full border-2 border-gray-400 object-cover"
                        />
                    </Link>
                    <span
                        className={`absolute -top-1 -right-7 ${user?.role === "admin" ? "bg-red-500" : "bg-green-500"
                            } text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md`}
                    >
                        {user?.role}
                    </span>
                </div>
                <div className="text-gray-900 dark:text-white text-sm">
                    <p className="font-semibold">{user?.username === null ? user?.email : user?.username}</p>
                </div>
            </div>

            <div className="flex items-center gap-4">

                <div className="sm:hidden">
                    <Button
                        type="primary"
                        icon={<MenuOutlined />}
                        onClick={() => setVisible(true)}
                        className="absolute top-0 right-0 z-50 shadow-lg"
                        size="large"
                        shape="square"
                        style={{
                            backgroundColor: theme === "dark" ? "#fff" : "#000",
                            color: theme === "dark" ? "#000" : "#fff",
                        }}
                    />
                </div>

                <Drawer
                    title="Menu"
                    placement="top"
                    closable
                    onClose={() => setVisible(false)}
                    open={visible}
                    height="100vh"
                    styles={{
                        body: {
                            padding: 0,
                            display: "flex",
                            flexDirection: "column",
                            height: "100%",
                            backgroundColor: theme === "dark" ? "oklch(0.21 0.034 264.665)" : "#ffffff",
                        },
                    }}
                    className={theme === "dark" ? "dark" : ""}
                >
                    <Menu mode="inline" theme={theme} defaultSelectedKeys={["1"]} items={menuItems} />
                    <div className="w-full flex justify-center items-center py-3">
                        <ThemeSwitcher isDarkMode={theme === "dark"} onToggle={toggleTheme} />
                    </div>
                    <Button type="primary" danger onClick={handleLogout} className="absolute bottom-0 w-full">
                        Logout
                    </Button>
                </Drawer>
            </div>
        </nav>
    );
};

export default DashboardNavbar;
