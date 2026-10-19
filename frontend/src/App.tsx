import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ToastProvider } from '@/components/ui/Toast'
import { ProtectedRoute, AdminRoute } from '@/components/layout/ProtectedRoute'

import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import DiscoverPage from '@/pages/DiscoverPage'
import TrackerPage from '@/pages/TrackerPage'
import CourseDetailPage from '@/pages/CourseDetailPage'
import LearningPathDetailPage from '@/pages/LearningPathDetailPage'
import AccountPage from '@/pages/AccountPage'
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import AdminCoursesPage from '@/pages/admin/AdminCoursesPage'
import AdminCourseFormPage from '@/pages/admin/AdminCourseFormPage'
import AdminPathsPage from '@/pages/admin/AdminPathsPage'
import AdminPathFormPage from '@/pages/admin/AdminPathFormPage'
import AdminReportsPage from '@/pages/admin/AdminReportsPage'
import NotFoundPage from '@/pages/NotFoundPage'

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/discover" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route path="/discover" element={<ProtectedRoute><DiscoverPage /></ProtectedRoute>} />
            <Route path="/tracker" element={<ProtectedRoute><TrackerPage /></ProtectedRoute>} />
            <Route path="/courses/:id" element={<ProtectedRoute><CourseDetailPage /></ProtectedRoute>} />
            <Route path="/paths/:id" element={<ProtectedRoute><LearningPathDetailPage /></ProtectedRoute>} />
            <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />

            <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
            <Route path="/admin/courses" element={<AdminRoute><AdminCoursesPage /></AdminRoute>} />
            <Route path="/admin/courses/new" element={<AdminRoute><AdminCourseFormPage /></AdminRoute>} />
            <Route path="/admin/courses/:id" element={<AdminRoute><AdminCourseFormPage /></AdminRoute>} />
            <Route path="/admin/paths" element={<AdminRoute><AdminPathsPage /></AdminRoute>} />
            <Route path="/admin/paths/new" element={<AdminRoute><AdminPathFormPage /></AdminRoute>} />
            <Route path="/admin/paths/:id" element={<AdminRoute><AdminPathFormPage /></AdminRoute>} />
            <Route path="/admin/reports" element={<AdminRoute><AdminReportsPage /></AdminRoute>} />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ToastProvider>
  )
}
