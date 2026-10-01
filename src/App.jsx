import { useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import { Spinner } from "./components/ui";
import AuthPage from "./pages/AuthPage";
import { AdminClasses, AdminOverview, AdminUsers } from "./pages/AdminDashboard";
import ProfilePage from "./pages/ProfilePage";
import NotificationsPage from "./pages/NotificationsPage";
import StudentHome from "./pages/StudentHome";
import StudentAssignments from "./pages/StudentAssignments";
import StudentAssignment from "./pages/StudentAssignment";
import TeacherHome from "./pages/TeacherHome";
import TeacherAssignments from "./pages/TeacherAssignments";
import TeacherAssignment from "./pages/TeacherAssignment";
import Onboarding from "./pages/Onboarding";
import CalendarPage from "./pages/CalendarPage";
import AchievementsPage from "./pages/AchievementsPage";
import ClassPage from "./pages/ClassPage";

function AdminOverviewRoute() {
  const navigate = useNavigate();
  const goTo = (tab) => {
    if (tab === "classes") navigate("/sinflar");
    else if (tab === "teachers") navigate("/oqituvchilar");
    else if (tab === "students") navigate("/oquvchilar");
  };
  return <AdminOverview goTo={goTo} />;
}

export default function App() {
  const { user, loading } = useAuth();
  const [seen, setSeen] = useState(() => localStorage.getItem("onboarded") === "1");
  const finishOnboarding = () => {
    try { localStorage.setItem("onboarded", "1"); } catch { /* ignore */ }
    setSeen(true);
  };

  if (loading) return <Spinner />;
  if (!user) return seen ? <AuthPage /> : <Onboarding onDone={finishOnboarding} />;

  if (user.role === "admin") {
    return (
      <Layout>
        <Routes>
          <Route path="/" element={<AdminOverviewRoute />} />
          <Route path="/sinflar" element={<AdminClasses />} />
          <Route path="/oqituvchilar" element={<AdminUsers role="teacher" />} />
          <Route path="/oquvchilar" element={<AdminUsers role="student" />} />
          <Route path="/profil" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    );
  }

  const teacher = user.role === "teacher";
  return (
    <Layout>
      <Routes>
        <Route path="/" element={teacher ? <TeacherHome /> : <StudentHome />} />
        <Route path="/vazifalar" element={teacher ? <TeacherAssignments /> : <StudentAssignments />} />
        <Route path="/assignment/:id" element={teacher ? <TeacherAssignment /> : <StudentAssignment />} />
        <Route path="/kalendar" element={<CalendarPage />} />
        {!teacher && <Route path="/yutuqlar" element={<AchievementsPage />} />}
        {!teacher && <Route path="/sinf" element={<ClassPage />} />}
        <Route path="/xabarnomalar" element={<NotificationsPage />} />
        <Route path="/profil" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
