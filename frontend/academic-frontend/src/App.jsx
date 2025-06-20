//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { Toaster } from 'react-hot-toast';

import Login from './components/auth/Login.jsx';
import ConfirmarCorreo from './components/auth/ConfirmarCorreo.jsx';

import PrivateRoute from './components/shared/PrivateRoute.jsx';

// Componentes de admin/directivo
import DirectivoDashboard from './components/admin/DirectivoDashboard.jsx';
import EstudiantesGestion from "./components/admin/EstudiantesGestion.jsx";
import DocentesGestion from "./components/admin/DocentesGestion.jsx";
import AdministrativosGestion from "./components/admin/AdministrativosGestion.jsx";
import CursosGestion from "./components/admin/CursosGestion.jsx";
import MateriasGestion from "./components/admin/MateriasGestion.jsx";
import CursosPorGrado from "./components/admin/CursosPorGrado.jsx";
import CursoDetalle from "./components/admin/CursoDetalle.jsx";
import StudentsPerGrade from './components/students/StudentsPerGrade.jsx';

// Componentes de estudiantes
import StudentLayout from './components/layout/StudentLayout.jsx';
import StudentMateria from './components/students/StudentMateria.jsx';
import StudentProfile from './components/students/StudentProfile';
import StudentAnalisis from './components/students/StudentAnalysis.jsx';
import MyGrades from './components/students/MyGrades.jsx';

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

          {/* Rutas para directores/admin */}
          <Route path="/directivo-dashboard" element={
            <PrivateRoute allowedRoles={["director"]}>
              <DirectivoDashboard />
            </PrivateRoute>
          } />

          <Route path="/admin/estudiantes" element={
            <PrivateRoute allowedRoles={["director"]}>
              <EstudiantesGestion />
            </PrivateRoute>
          } />
          <Route path="/admin/docentes" element={
            <PrivateRoute allowedRoles={["director"]}>
              <DocentesGestion />
            </PrivateRoute>
          } />
          <Route path="/admin/administrativos" element={
            <PrivateRoute allowedRoles={["director"]}>
              <AdministrativosGestion />
            </PrivateRoute>
          } />
          <Route path="/admin/cursos" element={
            <PrivateRoute allowedRoles={["director"]}>
              <CursosGestion />
            </PrivateRoute>
          } />
          <Route path="/admin/materias" element={
            <PrivateRoute allowedRoles={["director"]}>
              <MateriasGestion />
            </PrivateRoute>
          } />
          <Route path="/admin/cursos-por-grado" element={
            <PrivateRoute allowedRoles={["director"]}>
              <CursosPorGrado />
            </PrivateRoute>
          } />
          <Route path="/admin/cursos/:id" element={
            <PrivateRoute allowedRoles={["director"]}>
              <CursoDetalle />
            </PrivateRoute>
          } />
          <Route path="/admin/students-per-grade" element={
            <PrivateRoute allowedRoles={["director"]}>
              <StudentsPerGrade />
            </PrivateRoute>
          } />

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
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;