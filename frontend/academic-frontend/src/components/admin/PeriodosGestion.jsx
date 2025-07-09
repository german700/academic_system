//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\admin\PeriodosGestion.jsx
// 📍 Versión actualizada con validación de fechas y edit_deadline editable

import React, { useState, useEffect } from "react";
import {
    obtenerPeriodos,
    crearPeriodo,
    actualizarPeriodo,
    eliminarPeriodo,
    obtenerPeriodoPorId,
    reentrenarModeloIA,
} from "../services/periodosService";

const PeriodosGestion = () => {
    const [periodos, setPeriodos] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        number: 1,
        start_date: "",
        end_date: "",
        edit_deadline: "",
        academic_year: new Date().getFullYear(),
    });
    const [editId, setEditId] = useState(null);
    const [mensaje, setMensaje] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPeriodos();
    }, []);

    const fetchPeriodos = async () => {
        try {
            const data = await obtenerPeriodos();
            setPeriodos(data);
        } catch (error) {
            setMensaje("❌ Error al cargar los períodos.");
        }
    };

    const validarFechasEnAño = () => {
        const { start_date, end_date, edit_deadline, academic_year } = formData;
        const año = parseInt(academic_year);
        const fechas = [start_date, end_date, edit_deadline];
        
        // Verificar que todas las fechas existen y pertenecen al año académico
        return fechas.every((fecha) => {
            if (!fecha) return false; // Si la fecha está vacía, no es válida
            return new Date(fecha).getFullYear() === año;
        });
    };

    const handleInputChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje("");
        setLoading(true);
        
        try {
            // Validar que todas las fechas estén dentro del año académico
            if (!validarFechasEnAño()) {
                setMensaje("❌ Las fechas deben estar dentro del año académico seleccionado.");
                setLoading(false);
                return;
            }

            // Enviar datos con edit_deadline incluido
            const payload = {
                ...formData,
            };

            let result;
            if (editId) {
                result = await actualizarPeriodo(editId, payload);
                setMensaje("✅ Período actualizado correctamente.");
            } else {
                result = await crearPeriodo(payload);
                if (result.message?.includes("reentrenado")) {
                    setMensaje("✅ " + result.message);
                } else {
                    setMensaje("✅ Período creado correctamente.");
                }
            }

            setFormData({
                name: "",
                number: 1,
                start_date: "",
                end_date: "",
                edit_deadline: "",
                academic_year: new Date().getFullYear(),
            });
            setEditId(null);
            await fetchPeriodos();
        } catch (error) {
            setMensaje("❌ " + error.message);
        }
        setLoading(false);
    };

    const handleEdit = async (id) => {
        try {
            const periodo = await obtenerPeriodoPorId(id);
            setFormData({
                name: periodo.name,
                number: periodo.number,
                start_date: periodo.start_date,
                end_date: periodo.end_date,
                edit_deadline: periodo.edit_deadline || "",
                academic_year: periodo.academic_year,
            });
            setEditId(id);
            setMensaje("");
        } catch (error) {
            setMensaje("❌ Error al cargar período para edición.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Estás seguro de eliminar este período?")) return;
        try {
            await eliminarPeriodo(id);
            setMensaje("🗑️ Período eliminado.");
            await fetchPeriodos();
        } catch (error) {
            setMensaje("❌ " + error.message);
        }
    };

    const handleReentrenarIA = async () => {
        const year = prompt("Escribe el año para reentrenar el modelo (ej. 2024):");
        if (!year) return;

        setMensaje("🔄 Reentrenando modelo...");
        try {
            const result = await reentrenarModeloIA(parseInt(year));
            setMensaje("✅ " + result.message);
        } catch (error) {
            setMensaje("❌ " + error.message);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4 text-blue-700">Gestión de Períodos Académicos</h1>

            {mensaje && (
                <div className="mb-4 p-3 rounded bg-blue-100 text-blue-800 border border-blue-300">
                    {mensaje}
                </div>
            )}

            <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                    type="text"
                    name="name"
                    placeholder="Nombre del período (ej. Período 1)"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="p-2 border rounded"
                />
                <select
                    name="number"
                    value={formData.number}
                    onChange={handleInputChange}
                    required
                    className="p-2 border rounded"
                >
                    <option value={1}>Periodo 1</option>
                    <option value={2}>Periodo 2</option>
                    <option value={3}>Periodo 3</option>
                    <option value={4}>Periodo 4</option>
                </select>
                <input
                    type="number"
                    name="academic_year"
                    placeholder="Año académico"
                    value={formData.academic_year}
                    onChange={handleInputChange}
                    required
                    className="p-2 border rounded"
                />
                <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de inicio
                    </label>
                    <input
                        type="date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleInputChange}
                        required
                        className="p-2 border rounded w-full"
                    />
                </div>
                <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de fin
                    </label>
                    <input
                        type="date"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleInputChange}
                        required
                        className="p-2 border rounded w-full"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha límite para ediciones
                    </label>
                    <input
                        type="date"
                        name="edit_deadline"
                        value={formData.edit_deadline}
                        onChange={handleInputChange}
                        required
                        className="p-2 border rounded w-full"
                    />
                </div>
                <button
                    type="submit"
                    className="col-span-1 md:col-span-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                    {loading ? "Guardando..." : editId ? "Actualizar Período" : "Crear Período"}
                </button>
            </form>

            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">📋 Lista de Períodos</h2>
                <div className="overflow-x-auto">
                    <table className="w-full table-auto border">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border px-3 py-2">Nombre</th>
                                <th className="border px-3 py-2">#</th>
                                <th className="border px-3 py-2">Año</th>
                                <th className="border px-3 py-2">Inicio</th>
                                <th className="border px-3 py-2">Fin</th>
                                <th className="border px-3 py-2">Límite Edición</th>
                                <th className="border px-3 py-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {periodos.map((p) => (
                                <tr key={p.id}>
                                    <td className="border px-3 py-2">{p.name}</td>
                                    <td className="border px-3 py-2">{p.number}</td>
                                    <td className="border px-3 py-2">{p.academic_year}</td>
                                    <td className="border px-3 py-2">{p.start_date}</td>
                                    <td className="border px-3 py-2">{p.end_date}</td>
                                    <td className="border px-3 py-2">{p.edit_deadline || "No definido"}</td>
                                    <td className="border px-3 py-2 space-x-2">
                                        <button
                                            onClick={() => handleEdit(p.id)}
                                            className="bg-yellow-400 px-2 py-1 rounded hover:bg-yellow-500"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(p.id)}
                                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {periodos.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="text-center py-4 text-gray-500">
                                        No hay períodos registrados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-yellow-100 border border-yellow-300 p-4 rounded mb-6 text-yellow-800">
                <strong>⚠️ Nota:</strong> Cuando crees el último período del año, el sistema
                reentrenará automáticamente el modelo de IA. También puedes forzar el
                reentrenamiento manualmente:
                <div className="mt-3">
                    <button
                        onClick={handleReentrenarIA}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        Finalizar año y reentrenar modelo IA
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PeriodosGestion;