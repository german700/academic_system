//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\teachers\StudentProfile.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchStudentProfileByTeacher } from "../services/docentesService";
import { Card, CardContent, CardHeader, CardTitle } from "../shared/ui/card";
import { Button } from "../shared/ui/button";

export default function StudentProfile() {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStudentProfileByTeacher(studentId)
            .then(setStudent)
            .catch((err) => {
                console.error("Error al cargar perfil del estudiante:", err);
                setError("No se pudo cargar la información del estudiante");
            })
            .finally(() => setLoading(false));
    }, [studentId]);

    if (loading) return <div className="p-6">Cargando...</div>;
    if (error) return <div className="p-6 text-red-500">{error}</div>;
    if (!student) return <div className="p-6">Estudiante no encontrado</div>;

    return (
        <div className="p-6 space-y-6">
            {/* Encabezado con botón volver */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Perfil del Estudiante</h1>
                <Button variant="outline" onClick={() => navigate(-1)}>
                    ← Volver
                </Button>
            </div>

            {/* Card de información del estudiante */}
            <Card>
                <CardHeader className="flex items-center space-x-4">
                    {/* Foto de perfil */}
                    <img
                        src={student.photo || "/default-avatar.png"}
                        alt="Foto de perfil"
                        className="w-20 h-20 rounded-full object-cover border"
                    />


                    <div>
                        <CardTitle className="text-xl">
                            {student.first_name} {student.last_name}
                        </CardTitle>
                        <p className="text-sm text-gray-600">Código: {student.codigo}</p>
                    </div>
                </CardHeader>
                <CardContent>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-2 text-sm">
                        <li><strong>Email:</strong> {student.email}</li>
                        <li><strong>Teléfono:</strong> {student.telefono || "No registrado"}</li>
                        <li><strong>Dirección:</strong> {student.direccion || "No registrada"}</li>
                        <li><strong>Estrato:</strong> {student.estrato}</li>
                        <li><strong>Grado:</strong> {student.grado?.numero}</li>
                        <li><strong>Curso:</strong> {student.course?.name || "Sin curso"}</li>
                        <li><strong>Fecha de nacimiento:</strong> {student.fecha_nacimiento || "No registrada"}</li>
                        {/* Puedes agregar más campos si están disponibles */}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
