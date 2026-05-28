import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';

const ModelosPage = () => {
    const [modelos, setModelos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [formData, setFormData] = useState({ id: null, nombre: '', descripcion: '', categoriaId: '', stock: 0 });

    useEffect(() => {
        fetchModelos();
        api.get('/categorias?size=100').then(res => setCategorias(res.data.content));
    }, []);

    const fetchModelos = async () => {
        try {
            const { data } = await api.get('/modelos?size=100');
            setModelos(data.content);
        } catch (error) { toast.error("Error al cargar modelos"); }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (formData.id) {
                await api.put(`/modelos/${formData.id}`, formData);
                toast.success("Modelo actualizado");
            } else {
                await api.post('/modelos', formData);
                toast.success("Modelo creado");
            }
            setIsModalOpen(false);
            fetchModelos();
        } catch (error) { toast.error("Error al guardar"); }
    };

    const handleDelete = async (row) => {
        if (!window.confirm("¿Eliminar modelo?")) return;
        try {
            await api.delete(`/modelos/${row.id}`);
            toast.success("Modelo eliminado");
            fetchModelos();
        } catch (error) { toast.error("No se puede eliminar"); }
    };

    const columns = [
        { header: 'ID', accessor: 'id' },
        { header: 'Nombre', accessor: 'nombre' },
        { header: 'Categoría', render: (row) => row.categoria?.nombre },
        { header: 'Stock', render: (row) => <span className={`badge bg-${row.stock > 10 ? 'success' : 'danger'}`}>{row.stock}</span> },
    ];

    return (
        <div>
            <div className="d-flex justify-content-between mb-4">
                <h2>Catálogo e Inventario de Modelos</h2>
                <button className="btn btn-dark" onClick={() => { setFormData({id: null, nombre: '', descripcion: '', categoriaId: '', stock: 0}); setIsModalOpen(true); }}>+ Nuevo Modelo</button>
            </div>
            <div className="card shadow-sm border-0"><div className="card-body"><DataTable columns={columns} data={modelos} onEdit={(r) => { setFormData({...r, categoriaId: r.categoria?.id}); setIsModalOpen(true); }} onDelete={handleDelete} /></div></div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={formData.id ? "Editar Modelo" : "Nuevo Modelo"}>
                <form onSubmit={handleSave}>
                    <div className="mb-3"><label>Nombre</label><input type="text" className="form-control" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required /></div>
                    <div className="mb-3">
                        <label>Categoría</label>
                        <select className="form-select" value={formData.categoriaId} onChange={e => setFormData({...formData, categoriaId: e.target.value})} required>
                            <option value="">Seleccione...</option>
                            {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                        </select>
                    </div>
                    <div className="mb-3"><label>Stock Inicial (Actual)</label><input type="number" className="form-control" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} /></div>
                    <div className="text-end"><button type="submit" className="btn btn-dark">Guardar</button></div>
                </form>
            </Modal>
        </div>
    );
};
export default ModelosPage;
