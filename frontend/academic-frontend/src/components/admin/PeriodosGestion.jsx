//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\admin\PeriodosGestion.jsx
import React, { useState, useEffect } from "react";
import "./admin_css/PeriodosGestion.css";
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
        <div className="periodos-container">
            <h1 className="periodos-title">Gestión de Períodos Académicos</h1>

            {mensaje && (
                <div className="periodos-message">
                    {mensaje}
                </div>
            )}

            <form onSubmit={handleSubmit} className="periodos-form">
                <input
                    type="text"
                    name="name"
                    placeholder="Nombre del período (ej. Período 1)"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="periodos-input"
                />
                <select
                    name="number"
                    value={formData.number}
                    onChange={handleInputChange}
                    required
                    className="periodos-select"
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
                    className="periodos-input"
                />
                <div>
                    <label className="periodos-label">
                        Fecha de inicio
                    </label>
                    <input
                        type="date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleInputChange}
                        required
                        className="periodos-input"
                    />
                </div>
                <div>
                    <label className="periodos-label">
                        Fecha de fin
                    </label>
                    <input
                        type="date"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleInputChange}
                        required
                        className="periodos-input"
                    />
                </div>
                <div className="periodos-full-width">
                    <label className="periodos-label">
                        Fecha límite para ediciones
                    </label>
                    <input
                        type="date"
                        name="edit_deadline"
                        value={formData.edit_deadline}
                        onChange={handleInputChange}
                        required
                        className="periodos-input"
                    />
                </div>
                <button
                    type="submit"
                    className="periodos-submit"
                >
                    {loading ? "Guardando..." : editId ? "Actualizar Período" : "Crear Período"}
                </button>
            </form>

            <div>
                <h2 className="periodos-title">📋 Lista de Períodos</h2>
                <div>
                    <table className="periodos-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>#</th>
                                <th>Año</th>
                                <th>Inicio</th>
                                <th>Fin</th>
                                <th>Límite Edición</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {periodos.map((p) => (
                                <tr key={p.id}>
                                    <td>{p.name}</td>
                                    <td>{p.number}</td>
                                    <td>{p.academic_year}</td>
                                    <td>{p.start_date}</td>
                                    <td>{p.end_date}</td>
                                    <td>{p.edit_deadline || "No definido"}</td>
                                    <td className="periodos-actions">
                                        <button
                                            onClick={() => handleEdit(p.id)}
                                            className="periodos-btn-edit"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(p.id)}
                                            className="periodos-btn-delete"
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {periodos.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="periodos-empty">
                                        No hay períodos registrados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="periodos-note">
                <strong>⚠️ Nota:</strong> Cuando crees el último período del año, el sistema
                reentrenará automáticamente el modelo de IA. También puedes forzar el
                reentrenamiento manualmente:
                <div className="periodos-note-button">
                    <button onClick={handleReentrenarIA} className="periodos-btn-retrain">
                        Finalizar año y reentrenar modelo IA
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PeriodosGestion;