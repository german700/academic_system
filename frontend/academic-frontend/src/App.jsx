//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { Toaster } from 'react-hot-toast';

import Login from './components/auth/Login.jsx';
import ConfirmarCorreo from './components/auth/ConfirmarCorreo.jsx';

import PrivateRoute from './components/shared/PrivateRoute.jsx';

// Componentes de admin/directivo
import AdminLayout from './components/layout/AdminLayout.jsx';
import DirectivoDashboard from './components/admin/DirectivoDashboard.jsx';
import EstudiantesGestion from "./components/admin/EstudiantesGestion.jsx";
import DocentesGestion from "./components/admin/DocentesGestion.jsx";
import AdministrativosGestion from "./components/admin/AdministrativosGestion.jsx";
import CursosGestion from "./components/admin/CursosGestion.jsx";
import MateriasGestion from "./components/admin/MateriasGestion.jsx";
import PeriodosGestion from "./components/admin/PeriodosGestion.jsx";
import CursosPorGrado from "./components/admin/CursosPorGrado.jsx";
import CursoDetalle from "./components/admin/CursoDetalle.jsx";
import StudentsPerGrade from './components/students/StudentsPerGrade.jsx';
import StudentDetail from './components/admin/StudentDetail.jsx';
import EditarEstudiante from "./components/admin/EditarEstudiante";
import TeacherDetail from "./components/admin/TeacherDetail.jsx";

// Componentes de estudiantes
import StudentLayout from './components/layout/StudentLayout.jsx';
import StudentMateria from './components/students/StudentMateria.jsx';
import StudentProfile from './components/teachers/StudentProfile';
import StudentAnalisis from './components/students/StudentAnalysis.jsx';
import MyGrades from './components/students/MyGrades.jsx';
import StudentSubjectView from './components/students/StudentSubjectView.jsx';

// Componentes de profesores
import TeachersLayout from './components/layout/TeachersLayout.jsx';
import TeacherDashboard from './components/teachers/TeacherDashboard.jsx';
import TeacherCourses from './components/teachers/TeacherCourses.jsx';
import CourseStudents from './components/teachers/CourseStudents.jsx';
import StudentSubjectAnalysis from './components/teachers/StudentSubjectAnalysis.jsx';
import CourseGradesView from './components/teachers/CourseGradesView.jsx';
import CourseAnalysis from './components/teachers/CourseAnalysis.jsx';
import CourseGradesEdit from './components/teachers/CourseGradesEdit.jsx';
import CourseAttendance from './components/teachers/CourseAttendance.jsx';
import TeacherProfile from './components/teachers/TeacherProfile.jsx';
import PublicTeacherProfile from "./components/shared/ui/PublicTeacherProfile.jsx";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          {/* Redirección inicial */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Login y confirmación de contraseña */}
          <Route path="/login" element={<Login />} />
          <Route path="/cambiar-contraseña/:uid/:token" element={<ConfirmarCorreo />} />

          {/* ✅ RUTAS AGRUPADAS PARA ADMINISTRADOR CON LAYOUT */}
          <Route path="/" element={
            <PrivateRoute allowedRoles={["director"]}>
              <AdminLayout />
            </PrivateRoute>
          }>
            {/* Dashboard principal */}
            <Route path="directivo-dashboard" element={<DirectivoDashboard />} />
            
            {/* Gestión de usuarios */}
            <Route path="admin/estudiantes" element={<EstudiantesGestion />} />
            <Route path="admin/docentes" element={<DocentesGestion />} />
            <Route path="admin/administrativos" element={<AdministrativosGestion />} />
            
            {/* Gestión académica */}
            <Route path="admin/cursos" element={<CursosGestion />} />
            <Route path="admin/materias" element={<MateriasGestion />} />
            <Route path="admin/periodos" element={<PeriodosGestion />} />
            
            {/* Vistas de cursos y grados */}
            <Route path="admin/cursos-por-grado" element={<CursosPorGrado />} />
            <Route path="admin/cursos/:id" element={<CursoDetalle />} />
            <Route path="admin/students-per-grade" element={<StudentsPerGrade />} />
            
            {/* Detalles de usuarios */}
            <Route path="admin/estudiantes/:id" element={<StudentDetail />} />
            <Route path="admin/docentes/:teacherId" element={<TeacherDetail />} />
            
            {/* Rutas de compatibilidad/fallback */}
            <Route path="students/:id" element={<StudentDetail />} />
            <Route path="students/:id/edit" element={<EditarEstudiante />} />
            <Route path="teacher/:teacherId" element={<TeacherDetail />} />
          </Route>

          {/* Layout y rutas de profesores - CORREGIDO */}
          <Route path="/teachers" element={
            <PrivateRoute allowedRoles={["teacher"]}>
              <TeachersLayout />
            </PrivateRoute>
          }>
            {/* Ruta por defecto */}
            <Route index element={<TeacherDashboard />} />
            <Route path="dashboard" element={<TeacherDashboard />} />

            {/* Rutas de cursos */}
            <Route path="courses/:courseId" element={<TeacherCourses />} />
            <Route path="courses/:courseId/students" element={<CourseStudents />} />
            <Route path="courses/:courseId/subject/:subjectId/grades" element={<CourseGradesView />} />
            <Route path="courses/:courseId/subject/:subjectId/edit" element={<CourseGradesEdit />} />
            <Route path="courses/:courseId/subject/:subjectId/attendance" element={<CourseAttendance />} />

            {/* Análisis de IA */}
            <Route
              path="courses/:courseId/subject/:subjectId/analysis"
              element={<CourseAnalysis />}
            />

            {/* Análisis por estudiante - RUTA CORREGIDA */}
            <Route
              path="courses/:courseId/subject/:subjectId/students/:studentId/analysis"
              element={<StudentSubjectAnalysis />}
            />

            {/* Perfil de estudiante para profesores */}
            <Route
              path="students/:studentId/profile"
              element={<StudentProfile />}
            />

            {/* Mantener la ruta original como fallback */}
            <Route path="students/:studentId/analysis" element={<StudentSubjectAnalysis />} />
          </Route>

          {/* Layout y rutas del estudiante */}
          <Route path="/student" element={
            <PrivateRoute allowedRoles={["student"]}>
              <StudentLayout />
            </PrivateRoute>
          }>
            <Route index element={<StudentProfile />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="materias" element={<StudentMateria />} />
            <Route path="materia/:studentId/:materiaId" element={<StudentMateria />} />
            <Route path="calificaciones" element={<MyGrades />} />
            <Route path="analisis" element={<StudentAnalisis />} />
            <Route path="estudiante-materias" element={<StudentSubjectView />} />
          </Route>

          {/* ✅ RUTA UNIVERSAL PARA PERFIL DE ESTUDIANTE */}
          <Route path="/perfil-estudiante/:studentId" element={
            <PrivateRoute allowedRoles={["director", "teacher", "student"]}>
              <StudentProfile />
            </PrivateRoute>
          } />

          {/* ✅ RUTA PARA ESTUDIANTE ESPECÍFICO (DOCENTES Y DIRECTORES) */}
          <Route path="/estudiante/:studentId/perfil" element={
            <PrivateRoute allowedRoles={["director", "teacher"]}>
              <StudentProfile />
            </PrivateRoute>
          } />

          {/* ✅ RUTA PARA ESTUDIANTE VIENDO SU PROPIO PERFIL */}
          <Route path="/perfil" element={
            <PrivateRoute allowedRoles={["student"]}>
              <StudentProfile />
            </PrivateRoute>
          } />

          {/* Rutas públicas para perfiles de docentes */}
          <Route path="/perfil-docente/:teacherId" element={<PublicTeacherProfile />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;