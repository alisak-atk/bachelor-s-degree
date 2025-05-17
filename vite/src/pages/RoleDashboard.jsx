import { useAuth } from "@/utils/AuthProvider"; 
import DashboardU from "@/pages/DashboardU"; 
import Dashboard from "@/pages/Dashboard"; 

const RoleBasedDashboard = () => {
  const { user } = useAuth(); 

  if (!user) return null;

  if (user.role === "admin") {
    return <Dashboard />;
  }

  if (user.role === "user") {
    return <DashboardU />;
  }

  return <div>Unauthorized</div>; 
};

export default RoleBasedDashboard;
