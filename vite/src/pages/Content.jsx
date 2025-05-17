import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/utils/AuthProvider";

const Content = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if (isAuthenticated) {
            navigate("/dashboard");
        }
    }, [isAuthenticated, navigate]);
    
    return (
        <div>Content</div>
    );
};

export default Content;