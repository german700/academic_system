import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Login from './components/auth/Login.jsx';
import StudentProfile from './components/students/StudentProfile.jsx';
import StudentMateria from './components/students/StudentMateria.jsx';
import PrivateRoute from './components/shared/PrivateRoute.jsx';
import DirectivoDashboard from './components/admin/DirectivoDashboard';
import EstudiantesGestion from "./components/admin/EstudiantesGestion";
import DocentesGestion from "./components/admin/DocentesGestion";
import AdministrativosGestion from "./components/admin/AdministrativosGestion";
import CursosGestion from "./components/admin/CursosGestion";
import MateriasGestion from "./components/admin/MateriasGestion";
import CursosPorGrado from "./components/admin/CursosPorGrado";  
import CursoDetalle from "./components/admin/CursoDetalle";  

function App() {
 return (
   <AuthProvider>
     <Router>
       <Routes>
         {/* Ruta de inicio */}
         <Route path="/" element={<Navigate to="/login" replace />} />
         <Route path="/login" element={<Login />} />

         {/* Panel de control para directores */}
         <Route path="/directivo-dashboard" element={
           <PrivateRoute allowedRoles={["director"]}>
             <DirectivoDashboard />
           </PrivateRoute>
         } />

         {/* Administración de estudiantes, docentes, administrativos, cursos y materias */}
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

         {/* Funcionalidad para filtrar cursos según grado */}
         <Route path="/admin/cursos-por-grado" element={
           <PrivateRoute allowedRoles={["director"]}>
             <CursosPorGrado />
           </PrivateRoute>
         } />

         {/* Visualización de información detallada de un curso */}
         <Route path="/admin/cursos/:id" element={
           <PrivateRoute allowedRoles={["director"]}>
             <CursoDetalle />
           </PrivateRoute>
         } />

         {/* Información de perfil del estudiante */}
         <Route path="/student/:id/profile" element={
           <PrivateRoute allowedRoles={["director", "teacher", "student"]}>
             <StudentProfile />
           </PrivateRoute>
         } />

         {/* Funcionalidad para visualizar información de materias del estudiante */}
         <Route path="/student/:id/materia/:materiaId" element={
           <PrivateRoute allowedRoles={["director", "teacher", "student"]}>
             <StudentMateria />
           </PrivateRoute>
         } />

         {/* Redirección para rutas no definidas */}
         <Route path="*" element={<Navigate to="/login" />} />
       </Routes>
     </Router>
   </AuthProvider>
 );
}

export default App;