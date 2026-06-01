import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';

const ClientesPage = () => {
    const [clientes, setClientes] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ id: null, nombre: '', direccion: '', telefono: '', dni: '', ruc: '', correo: '' });

    useEffect(() => { fetchClientes(); }, []);

    const fetchClientes = async () => {
        const { data } = await api.get('/clientes?size=100');
        setClientes(data.content);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (formData.id) await api.put(`/clientes/${formData.id}`, formData);
            else await api.post('/clientes', formData);
            toast.success("Cliente guardado");
            setIsModalOpen(false); fetchClientes();
        } catch { toast.error("Error al guardar"); }
    };

    const columns = [
        { header: 'ID', accessor: 'id' },
        { header: 'Nombre', accessor: 'nombre' },
        { header: 'Teléfono', accessor: 'telefono' },
        { header: 'DNI', accessor: 'dni' },
        { header: 'Correo', accessor: 'correo' },
    ];

    return (
        <div>
            <div className="d-flex justify-content-between mb-4">
                <h2>Directorio de Clientes</h2>
                <button className="btn btn-dark" onClick={() => { setFormData({id:null, nombre:'', direccion:'', telefono:'', dni:'', ruc:'', correo:''}); setIsModalOpen(true); }}>+ Nuevo Cliente</button>
            </div>
            <div className="card shadow-sm border-0"><div className="card-body"><DataTable columns={columns} data={clientes} onEdit={r => { setFormData(r); setIsModalOpen(true); }} /></div></div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Cliente">
                <form onSubmit={handleSave}>
                    <div className="mb-3"><label>Nombre</label><input type="text" className="form-control" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required /></div>
                    <div className="mb-3"><label>Teléfono</label><input type="text" className="form-control" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} /></div>
                    <div className="mb-3"><label>Dirección</label><input type="text" className="form-control" value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} /></div>
                    <div className="mb-3"><label>DNI</label><input type="text" className="form-control" value={formData.dni} onChange={e => setFormData({...formData, dni: e.target.value})} /></div>
                    <div className="mb-3"><label>RUC</label><input type="text" className="form-control" value={formData.ruc} onChange={e => setFormData({...formData, ruc: e.target.value})} /></div>
                    <div className="mb-3"><label>Correo</label><input type="email" className="form-control" value={formData.correo} onChange={e => setFormData({...formData, correo: e.target.value})} /></div>
                    <div className="text-end"><button className="btn btn-dark">Guardar</button></div>
                </form>
            </Modal>
        </div>
    );
};
export default ClientesPage;
