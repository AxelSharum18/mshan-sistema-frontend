import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';

const CategoriasPage = () => {
    const [categorias, setCategorias] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ id: null, nombre: '' });

    useEffect(() => { fetchCategorias(); }, []);

    const fetchCategorias = async () => {
        const { data } = await api.get('/categorias?size=100');
        setCategorias(data.content);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (formData.id) await api.put(`/categorias/${formData.id}`, formData);
            else await api.post('/categorias', formData);
            toast.success("Categoría guardada");
            setIsModalOpen(false); fetchCategorias();
        } catch { toast.error("Error al guardar"); }
    };

    const columns = [
        { header: 'ID', accessor: 'id' },
        { header: 'Nombre', accessor: 'nombre' },
    ];

    return (
        <div>
            <div className="d-flex justify-content-between mb-4">
                <h2>Categorías de Modelos</h2>
                <button className="btn btn-dark" onClick={() => { setFormData({id:null, nombre:''}); setIsModalOpen(true); }}>+ Nueva Categoría</button>
            </div>
            <div className="card shadow-sm border-0"><div className="card-body"><DataTable columns={columns} data={categorias} onEdit={r => { setFormData(r); setIsModalOpen(true); }} /></div></div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Categoría">
                <form onSubmit={handleSave}>
                    <div className="mb-3"><label>Nombre</label><input type="text" className="form-control" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required /></div>
                    <div className="text-end"><button className="btn btn-dark">Guardar</button></div>
                </form>
            </Modal>
        </div>
    );
};
export default CategoriasPage;
