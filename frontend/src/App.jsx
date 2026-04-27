import { Navigate, Route, Routes } from 'react-router-dom'

import { ProtectedRoute } from './components/ProtectedRoute'
import { AppShell } from './components/layout/AppShell'
import { AssignmentsPage } from './pages/AssignmentsPage'
import { CoursesPage } from './pages/CoursesPage'
import { CreateUnitTestPage } from './pages/CreateUnitTestPage'
import { DashboardPage } from './pages/DashboardPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PracticalsPage } from './pages/PracticalsPage'
import { QuestionPapersPage } from './pages/QuestionPapersPage'
import { SyllabusPage } from './pages/SyllabusPage'
import { UnitTestsPage } from './pages/UnitTestsPage'
import { UploadAssignmentPage } from './pages/UploadAssignmentPage'
import { UploadNewsLinksPage } from './pages/UploadNewsLinksPage'
import { UploadQuestionPaperPage } from './pages/UploadQuestionPaperPage'
import { UploadSyllabusPage } from './pages/UploadSyllabusPage'
import { UploadUnitTestPage } from './pages/UploadUnitTestPage'

function AdminRoute({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/course" element={<CoursesPage />} />
        <Route path="/syllabus" element={<SyllabusPage />} />
        <Route path="/home_assignments" element={<AssignmentsPage />} />
        <Route path="/unit_tests" element={<UnitTestsPage />} />
        <Route path="/question_papers" element={<QuestionPapersPage />} />
        <Route path="/practicals" element={<PracticalsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <AdminRoute>
              <DashboardPage />
            </AdminRoute>
          }
        />
        <Route
          path="/upload-assignment"
          element={
            <AdminRoute>
              <UploadAssignmentPage />
            </AdminRoute>
          }
        />
        <Route
          path="/upload_news_links"
          element={
            <AdminRoute>
              <UploadNewsLinksPage />
            </AdminRoute>
          }
        />
        <Route
          path="/upload_question_paper"
          element={
            <AdminRoute>
              <UploadQuestionPaperPage />
            </AdminRoute>
          }
        />
        <Route
          path="/upload_syllabus"
          element={
            <AdminRoute>
              <UploadSyllabusPage />
            </AdminRoute>
          }
        />
        <Route
          path="/upload_unit_test"
          element={
            <AdminRoute>
              <UploadUnitTestPage />
            </AdminRoute>
          }
        />
        <Route
          path="/create_unit_test"
          element={
            <AdminRoute>
              <CreateUnitTestPage />
            </AdminRoute>
          }
        />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
