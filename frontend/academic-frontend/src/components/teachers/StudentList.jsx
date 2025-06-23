import React, { useState } from "react";
import { Input } from "../shared/ui/input";
import StudentCard from "./StudentCard";

export default function StudentList({ students, courseId, subjectId, period, courseName, subjectName }) {
    const [q, setQ] = useState("");

    const filtered = students.filter(s => {
        // Buscar por nombre completo
        const searchTerm = `${s.first_name} ${s.last_name}`.toLowerCase();
        return searchTerm.includes(q.toLowerCase());
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <Input
                    placeholder="Buscar estudiante..."
                    value={q}
                    onChange={e => setQ(e.target.value)}
                    className="w-1/3"
                />
                <span className="text-sm text-gray-500">
                    {filtered.length} de {students.length} estudiantes
                </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(s => (
                    <div key={s.student_id} className="relative">
                        <StudentCard
                            student={s}
                            courseId={courseId}
                            subjectId={subjectId}
                            period={period}
                            courseName={courseName}
                            subjectName={subjectName}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}