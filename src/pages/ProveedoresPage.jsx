import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';

const ProveedoresPage = () => {
    const [proveedores, setProveedores] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ id: null, nombre: '', direccion: '', telefono: '' });

    useEffect(() => { fetchProveedores(); }, []);

    const fetchProveedores = async () => {
        const { data } = await api.get('/proveedores?size=100');
        setProveedores(data.content);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (formData.id) await api.put(`/proveedores/${formData.id}`, formData);
            else await api.post('/proveedores', formData);
            toast.success("Proveedor guardado");
            setIsModalOpen(false); fetchProveedores();
        } catch { toast.error("Error al guardar"); }
    };

    const columns = [
        { header: 'ID', accessor: 'id' },
        { header: 'Nombre Empresa', accessor: 'nombre' },
        { header: 'Teléfono', accessor: 'telefono' },
    ];

    return (
        <div>
            <div className="d-flex justify-content-between mb-4">
                <h2>Proveedores de Materiales</h2>
                <button className="btn btn-dark" onClick={() => { setFormData({id:null, nombre:'', direccion:'', telefono:''}); setIsModalOpen(true); }}>+ Nuevo Proveedor</button>
            </div>
            <div className="card shadow-sm border-0"><div className="card-body"><DataTable columns={columns} data={proveedores} onEdit={r => { setFormData(r); setIsModalOpen(true); }} /></div></div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Proveedor">
                <form onSubmit={handleSave}>
                    <div className="mb-3"><label>Razón Social</label><input type="text" className="form-control" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required /></div>
                    <div className="mb-3"><label>Teléfono</label><input type="text" className="form-control" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} /></div>
                    <div className="mb-3"><label>Dirección</label><input type="text" className="form-control" value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} /></div>
                    <div className="text-end"><button className="btn btn-dark">Guardar</button></div>
                </form>
            </Modal>
        </div>
    );
};
export default ProveedoresPage;
