import "./App.css";
import "@ant-design/v5-patch-for-react-19";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

import Login from "@/pages/Login";
import Register from "@/pages/Register";

import { AuthProvider } from "@/utils/AuthProvider";
import PrivateRoute from "@/utils/PrivateRoute";

import DashboardLayout from "@/layouts/Dashboard";
import HomeLayout from "@/layouts/Home";

import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";

import LinkU from "@/pages/user/LinkU";
import History from "@/pages/user/History";
import Withdraw from "@/pages/user/Withdraw";
import ReportU from "@/pages/user/ReportU";
import Verify from "@/pages/user/Verify";

import ManageUser from "@/pages/admin/ManageUser";
import ReportA from "@/pages/admin/ReportA";
import Transactions from "@/pages/admin/Transactions";
import VerifyRequest from "@/pages/admin/VerifyRequest";
import WithdrawRequest from "@/pages/admin/WithdrawRequest";

import Content from "@/pages/Content";
import DonateForm from "@/pages/links/donate";
import DonationPopup from "@/pages/links/popup";
import DonationLot from "@/pages/links/lot";
import TopDonators from "@/pages/links/topdonate";
import RoleBasedDashboard from "@/pages/RoleDashboard";

const router = createBrowserRouter([

  { path: "/", element: <HomeLayout><Content /></HomeLayout> },
  { path: "/login", element: <HomeLayout><Login /></HomeLayout> },
  { path: "/register", element: <HomeLayout><Register /></HomeLayout> },
  { path: "/:username", element: <DonateForm /> },
  { path: "/:userid/popup", element: <DonationPopup /> },
  { path: "/:userid/lot/start/:from/goal/:to/timestart/:timestart/timeend/:timeend", element: <DonationLot /> },
  { path: "/:userid/rank/timestart/:timestart/timeend/:timeend", element: <TopDonators /> },
  { path: "*", element: <Navigate to="/404" /> },
  { path: "/404", element: <NotFound /> },

  {
    path: "/",
    element: <PrivateRoute />,
    children: [
      { path: "/", element: <Navigate to="/dashboard" /> },

      {
        path: "/u",
        element: (
          <PrivateRoute allowedRoles={["user"]} />
        ),
        children: [
          { path: "link", element: <DashboardLayout><LinkU /></DashboardLayout> },
          { path: "history", element: <DashboardLayout><History /></DashboardLayout> },
          { path: "withdraw", element: <DashboardLayout><Withdraw /></DashboardLayout> },
          { path: "report", element: <DashboardLayout><ReportU /></DashboardLayout> }
        ]
      },

      {
        path: "/a",
        element: (
          <PrivateRoute allowedRoles={["admin"]} />
        ),
        children:

          [
            { path: "users", element: <DashboardLayout><ManageUser /></DashboardLayout> },
            { path: "reports", element: <DashboardLayout><ReportA /></DashboardLayout> },
            { path: "transactions", element: <DashboardLayout><Transactions /></DashboardLayout> },
            { path: "verifyrequest", element: <DashboardLayout><VerifyRequest /></DashboardLayout> },
            { path: "withdrawrequest", element: <DashboardLayout><WithdrawRequest /></DashboardLayout> },
          ]
      },


      { path: "/dashboard", element: <DashboardLayout><RoleBasedDashboard /></DashboardLayout> },
      { path: "/profile", element: <DashboardLayout><Profile /></DashboardLayout> },
      { path: "/verify", element: <DashboardLayout><Verify /></DashboardLayout> },


      { path: "*", element: <Navigate to="/404" /> },
    ],
  },

]);


export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}


