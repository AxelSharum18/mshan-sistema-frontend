import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';
import { Trash2 } from 'lucide-react';
const MaterialesPage = () => {
    const [materiales, setMateriales] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [formData, setFormData] = useState({
        id: null,
        nombre: '',
        unidad: 'Metros',
        precioUnitario: 0.0,
        stock: 0,
        proveedorId: ''
    });
    useEffect(() => {
        fetchMateriales();
        fetchProveedores();
    }, []);
    const fetchMateriales = async () => {
        try {
            const { data } = await api.get('/materiales?size=100');
            setMateriales(data.content || []);
        } catch (error) {
            toast.error("Error al cargar materiales");
        }
    };
    const fetchProveedores = async () => {
        try {
            const { data } = await api.get('/proveedores?size=100');
            setProveedores(data.content || []);
        } catch (error) {
            console.error("Error al cargar proveedores", error);
        }
    };
    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                nombre: formData.nombre,
                unidad: formData.unidad,
                precioUnitario: parseFloat(formData.precioUnitario),
                stock: parseFloat(formData.stock),
                proveedorId: parseInt(formData.proveedorId)
            };
            if (formData.id) {
                await api.put(`/materiales/${formData.id}`, payload);
                toast.success("Material actualizado exitosamente");
            } else {
                await api.post('/materiales', payload);
                toast.success("Material creado exitosamente");
            }
            setIsModalOpen(false);
            fetchMateriales();
        } catch (error) {
            toast.error("Error al guardar material");
        }
    };
    const handleDelete = async (row) => {
        if (!window.confirm("¿Seguro que deseas eliminar este material?")) return;
        try {
            await api.delete(`/materiales/${row.id}`);
            toast.success("Material eliminado");
            fetchMateriales();
        } catch (error) {
            toast.error("No se puede eliminar (tal vez esté en uso)");
        }
    };
    const openModal = (material = null) => {
        if (material) {
            setFormData({
                id: material.id,
                nombre: material.nombre,
                unidad: material.unidad,
                precioUnitario: material.precioUnitario,
                stock: material.stock,
                proveedorId: material.proveedor?.id || ''
            });
        } else {
            setFormData({
                id: null,
                nombre: '',
                unidad: 'Metros',
                precioUnitario: 0.0,
                stock: 0,
                proveedorId: ''
            });
        }
        setIsModalOpen(true);
    };
    const columns = [
        { header: 'ID', accessor: 'id' },
        { header: 'Nombre del Material', accessor: 'nombre' },
        { header: 'Unidad', accessor: 'unidad' },
        { header: 'Precio Unit.', render: (r) => `S/ ${Number(r.precioUnitario).toFixed(2)}` },
        { header: 'Stock Actual', render: (r) => <span className={`badge bg-${r.stock > 10 ? 'success' : 'danger'}`}>{r.stock} {r.unidad}</span> },
        { header: 'Proveedor', render: (r) => r.proveedor?.nombre || '—' },
    ];
    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold m-0" style={{ color: 'var(--text-primary)' }}>Inventario de Materiales</h2>
                <button className="btn btn-dark" onClick={() => openModal()}>+ Nuevo Material</button>
            </div>
            <div className="dash-card p-0" style={{ overflow: 'hidden' }}>
                <DataTable 
                    columns={columns} 
                    data={materiales} 
                    onEdit={(row) => openModal(row)}
                    onDelete={handleDelete}
                />
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={formData.id ? "Editar Material" : "Registrar Material"}>
                <form onSubmit={handleSave}>
                    <div className="mb-3">
                        <label className="form-label text-dark">Nombre del Material</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            value={formData.nombre} 
                            onChange={(e) => setFormData({...formData, nombre: e.target.value})} 
                            required 
                            placeholder="Ej: Cierre N°5, Cuero Sintético"
                        />
                    </div>
                    
                    <div className="row mb-3 g-2">
                        <div className="col-md-6">
                            <label className="form-label text-dark">Unidad de Medida</label>
                            <select className="form-select" value={formData.unidad} onChange={(e) => setFormData({...formData, unidad: e.target.value})}>
                                <option value="Metros">Metros</option>
                                <option value="Unidades">Unidades</option>
                                <option value="Rollos">Rollos</option>
                                <option value="Paquetes">Paquetes</option>
                                <option value="Kilos">Kilos</option>
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label text-dark">Precio Unitario (S/)</label>
                            <input 
                                type="number" 
                                step="0.01" 
                                className="form-control" 
                                value={formData.precioUnitario} 
                                onChange={(e) => setFormData({...formData, precioUnitario: e.target.value})} 
                                required 
                            />
                        </div>
                    </div>
                    <div className="row mb-3 g-2">
                        <div className="col-md-6">
                            <label className="form-label text-dark">Stock Inicial</label>
                            <input 
                                type="number" 
                                step="0.01" 
                                className="form-control" 
                                value={formData.stock} 
                                onChange={(e) => setFormData({...formData, stock: e.target.value})} 
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label text-dark">Proveedor Habitual</label>
                            <select 
                                className="form-select" 
                                value={formData.proveedorId} 
                                onChange={(e) => setFormData({...formData, proveedorId: e.target.value})} 
                                required
                            >
                                <option value="">Seleccione...</option>
                                {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="text-end mt-4">
                        <button type="button" className="btn btn-outline-secondary me-2" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                        <button type="submit" className="btn btn-dark">Guardar Material</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
export default MaterialesPage;
