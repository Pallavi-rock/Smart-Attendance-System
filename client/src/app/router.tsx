import { createBrowserRouter } from "react-router-dom";
import HomePage from "../features/home/pages/HomePage";
import { AdminLayout, MainLayout, StudentLayout } from "../layouts";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import StudentRegisterPage from "../features/auth/pages/StudentRegisterPage";
import TeacherRegisterPage from "../features/auth/pages/TeacherRegisterPage";
import ForgotPasswordPage from "../features/auth/pages/ForgotPasswordPage";
import ProtectedRoute from "../shared/guards/ProtectedRoute";
import RoleProtectedRoute from "../features/auth/components/RoleProtectedRoute";
import UnauthorizedPage from "../features/auth/pages/UnauthorizedPage";
import TeacherDashboard from "../features/teacher/pages/TeacherDashboard";
import StudentDashboard from "../features/student/pages/StudentDashboard";
import StudentAttendancePage from "../features/student/pages/StudentAttendancePage";
import StudentHistoryPage from "../features/student/pages/StudentHistoryPage";
import StudentAnalyticsPage from "../features/student/pages/StudentAnalyticsPage";
import StudentProfilePage from "../features/student/pages/StudentProfilePage";
import StudentSettingsPage from "../features/student/pages/StudentSettingsPage";
import AdminDashboard from "../features/admin/pages/AdminDashboard";
import AdminManagementPage from "../features/admin/pages/AdminManagementPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
      {
        path: "/register/student",
        element: <StudentRegisterPage />,
      },
      {
        path: "/register/teacher",
        element: <TeacherRegisterPage />,
      },
      {
        path: "/forgot-password",
        element: <ForgotPasswordPage />,
      },
      {
        path: "/unauthorized",
        element: <UnauthorizedPage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <RoleProtectedRoute allowedRole="teacher" />,
            children: [
              {
                path: "/teacher/dashboard",
                element: <TeacherDashboard />,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleProtectedRoute allowedRole="student" />,
        children: [
          {
            element: <StudentLayout />,
            children: [
              { path: "/student/dashboard", element: <StudentDashboard /> },
              { path: "/student/attendance", element: <StudentAttendancePage /> },
              { path: "/student/history", element: <StudentHistoryPage /> },
              { path: "/student/analytics", element: <StudentAnalyticsPage /> },
              { path: "/student/profile", element: <StudentProfilePage /> },
              { path: "/student/settings", element: <StudentSettingsPage /> },
            ],
          },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleProtectedRoute allowedRole="admin" />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { path: "/admin/dashboard", element: <AdminDashboard /> },
              { path: "/admin/users/admins", element: <AdminManagementPage /> },
            ],
          },
        ],
      },
    ],
  },
]);
