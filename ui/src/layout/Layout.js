import { Outlet, Route, Routes, useLocation } from "react-router-dom";
import { GetAuthGuard } from "./Guards";
import { SocketContextProvider } from "../services/Socket/Socket.context";
import { AuthenticationContextProvider } from "../services/Authentication/Authentication.context";

import PageNotFound from "../components/NotFound/PageNotFound";
import { AnimatePresence } from "framer-motion";
import Home from "../components/Home/Home";
import Signin from "../components/Auth/Signin/Signin";
import Signup from "../components/Auth/Signup/Signup";
import Verify from "../components/Auth/Signup/Verify";
import ResetPassword from "../components/Auth/ResetPassword/ResetPassword";
import Dashboard from "../components/Admin/Dashboard";
import { BatchesContextProvider } from "../services/Batches/Batches.context";
import Batches from "../components/Admin/Batches/Batches";
import { UsersContextProvider } from "../services/users/users.context";
import Users from "../components/Admin/Users/Users";
import { QuizContextProvider } from "../services/Quiz/Quiz.context";
import Quiz from "../components/Admin/Quiz/Quiz";
import StudentQuiz from "../components/Student/StudentQuiz/StudentQuiz";
import Student from "../components/Student/Student";
import StudentQuizStart from "../components/Student/StudentQuiz/StudentQuizStart";
import { ReportsContextProvider } from "../services/Reports/Reports.context";
import StudentReports from "../components/Student/StudentReports/StudentReports";
import StudentReportView from "../components/Student/StudentReports/StudentReportView";
import Reports from "../components/Admin/Reports/Reports";
import ReportView from "../components/Admin/Reports/ReportView";

const Layout = (props) => {
  const location = useLocation();

  const BatchesElement = ({ title }) => {
    return (
      <UsersContextProvider>
        <BatchesContextProvider>
          <Batches title={title} />
        </BatchesContextProvider>
      </UsersContextProvider>
    );
  };

  const UsersElement = ({ title }) => {
    return (
      <UsersContextProvider>
        <Users title={title} />
      </UsersContextProvider>
    );
  };

  const QuizElement = ({ title }) => {
    return (
      <BatchesContextProvider>
        <QuizContextProvider>
          <Quiz title={title} />
        </QuizContextProvider>
      </BatchesContextProvider>
    );
  };

  const StudentQuizElement = ({ title }) => {
    return (
      <QuizContextProvider>
        <StudentQuiz title={title} />
      </QuizContextProvider>
    );
  };

  const StudentQuizStartElement = ({ title }) => {
    return (
      <QuizContextProvider>
        <StudentQuizStart title={title} />
      </QuizContextProvider>
    );
  };

  const StudentReportsElement = ({ title }) => {
    return (
      <ReportsContextProvider>
        <StudentReports title={title} />
      </ReportsContextProvider>
    );
  };

  const StudentReportViewElement = ({ title }) => {
    return (
      <ReportsContextProvider>
        <StudentReportView title={title} />
      </ReportsContextProvider>
    );
  };

  const ReportsElement = ({ title }) => {
    return (
      <ReportsContextProvider>
        <Reports title={title} />
      </ReportsContextProvider>
    );
  };

  const ReportViewElement = ({ title }) => {
    return (
      <ReportsContextProvider>
        <ReportView title={title} />
      </ReportsContextProvider>
    );
  };

  return (
    <SocketContextProvider>
      <AuthenticationContextProvider>
        <AnimatePresence mode="wait">
          <Routes key={location.pathname} location={location}>
            <Route path="/" element={<Signin title="Sign In" />} />

            <Route path="/auth">
              <Route path="signin" element={<Signin title="Sign In" />} />
              <Route path="signup" element={<Signup title="Sign Up" />} />
              <Route
                path="verify/:verificationToken"
                element={<Verify title="Verification" />}
              />
              <Route
                path="reset-password/:resetPasswordToken"
                element={<ResetPassword title="Reset Password" />}
              />
            </Route>

            <Route
              path="/student"
              element={
                <GetAuthGuard
                  component={<Student title="Student" />}
                  to={"/auth/signin"}
                />
              }
            >
              <Route
                path="quiz"
                element={<StudentQuizElement title="Available Quizes" />}
              />
              <Route
                path="quiz/start"
                element={<StudentQuizStartElement title="Start Quiz" />}
              />
              <Route
                path="reports"
                element={<StudentReportsElement title="Reports" />}
              />
              <Route
                path="reports/view"
                element={<StudentReportViewElement title="View Report" />}
              />
            </Route>

            <Route
              path="/dashboard"
              element={
                <GetAuthGuard
                  component={<Dashboard title="Dashboard" />}
                  to={"/auth/signin"}
                />
              }
            >
              <Route
                path="batches"
                element={<BatchesElement title="Batches" />}
              />
              <Route path="users" element={<UsersElement title="Users" />} />
              <Route path="quiz" element={<QuizElement title="Quiz" />} />
              <Route
                path="reports"
                element={<ReportsElement title="Reports" />}
              />
              <Route
                path="reports/view"
                element={<ReportViewElement title="View Report" />}
              />
            </Route>
            <Route path="*" element={<PageNotFound title="Page Not Found" />} />
          </Routes>

          {/* <main>
            <Outlet />
          </main> */}
        </AnimatePresence>
      </AuthenticationContextProvider>
    </SocketContextProvider>
  );
};

export default Layout;
