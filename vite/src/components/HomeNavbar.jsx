import { Link } from "react-router-dom";
import { Button } from "antd";
import Theme from "@/hooks/Theme";
import ThemeSwitcher from "@/hooks/ThemeSwitcher";

const HomeNavbar = () => {
    const { theme, toggleTheme } = Theme();

    return (
        <nav className="fixed top-0 left-0 w-full z-50 h-20 bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
                
            </div>
            <div className="flex items-center gap-4">

                <Link to="/login">
                    <Button type="default" color="default"
                        variant="outlined">Login</Button>
                </Link>
                <Link to="/register">
                    <Button type="primary" color="default"
                        variant="outlined">Register</Button>
                </Link>
                <ThemeSwitcher isDarkMode={theme === "dark"} onToggle={toggleTheme} />
            </div>
        </nav>
    );
};

export default HomeNavbar;
