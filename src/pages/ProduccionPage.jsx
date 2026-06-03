import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';
import { Plus, Trash2, Eye, Factory } from 'lucide-react';

const ProduccionPage = () => {
    const [producciones, setProducciones] = useState([]);
    const [modelos, setModelos] = useState([]);
    const [materiales, setMateriales] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetallesOpen, setIsDetallesOpen] = useState(false);
    const [produccionDetalles, setProduccionDetalles] = useState(null);

    const [modeloId, setModeloId] = useState('');
    const [cantidadProducida, setCantidadProducida] = useState(1);
    const [detalles, setDetalles] = useState([]);
    const [materialId, setMaterialId] = useState('');
    const [cantidadConsumida, setCantidadConsumida] = useState(1);

    useEffect(() => {
        fetchProducciones();
        fetchCatalogos();
    }, []);

    const fetchProducciones = async () => {
        try {
            const { data } = await api.get('/produccion?size=200&sort=id,desc');
            setProducciones(data.content || []);
        } catch (error) {
            toast.error("Error al cargar historial de producción");
        }
    };

    const fetchCatalogos = async () => {
        try {
            const [resModelos, resMateriales] = await Promise.all([
                api.get('/modelos?size=100'),
                api.get('/materiales?size=100')
            ]);
            setModelos(resModelos.data.content || []);
            setMateriales(resMateriales.data.content || []);
        } catch (error) {
            console.error("Error al cargar catalogos", error);
        }
    };

    const handleAddDetalle = () => {
        if (!materialId || cantidadConsumida <= 0) {
            toast.warn("Seleccione un material y una cantidad válida");
            return;
        }
        const material = materiales.find(m => m.id === parseInt(materialId));
        if (cantidadConsumida > material.stock) {
            toast.error(`Stock insuficiente. Solo hay ${material.stock} ${material.unidad} de ${material.nombre}`);
            return;
        }

        setDetalles([...detalles, {
            materialId: parseInt(materialId),
            materialNombre: material.nombre,
            unidad: material.unidad,
            cantidadConsumida: parseFloat(cantidadConsumida)
        }]);
        setMaterialId('');
        setCantidadConsumida(1);
    };

    const handleRemoveDetalle = (index) => {
        const newDetalles = [...detalles];
        newDetalles.splice(index, 1);
        setDetalles(newDetalles);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!modeloId || cantidadProducida <= 0 || detalles.length === 0) {
            toast.warn("Seleccione un modelo, una cantidad y al menos un material consumido");
            return;
        }

        const payload = {
            modeloId: parseInt(modeloId),
            cantidadProducida: parseInt(cantidadProducida),
            detalles: detalles.map(d => ({
                materialId: d.materialId,
                cantidadConsumida: d.cantidadConsumida
            }))
        };

        try {
            await api.post('/produccion', payload);
            toast.success("Producción registrada correctamente");
            setIsModalOpen(false);
            setModeloId('');
            setCantidadProducida(1);
            setDetalles([]);
            fetchProducciones();
            fetchCatalogos(); // Refresh stock
        } catch (error) {
            const msg = error.response?.data?.message || "Error al registrar producción";
            toast.error(msg);
        }
    };

    const abrirDetalles = async (prod) => {
        try {
            const { data } = await api.get(`/produccion/${prod.id}`);
            setProduccionDetalles(data);
        } catch {
            setProduccionDetalles(prod);
        }
        setIsDetallesOpen(true);
    };

    const columns = [
        { header: 'ID', accessor: 'id' },
        { header: 'Fecha', accessor: 'fecha' },
        { header: 'Modelo Producido', render: (row) => row.modelo?.nombre || '—' },
        { header: 'Cant. Fabricada', render: (row) => <span className="badge bg-success">{row.cantidadProducida} unds</span> },
    ];

    const selectedMaterial = materiales.find(m => m.id === parseInt(materialId));

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <h2 className="fw-bold m-0" style={{ color: 'var(--text-primary)' }}>Módulo de Producción</h2>
                <button className="btn btn-dark" onClick={() => setIsModalOpen(true)}>+ Registrar Producción</button>
            </div>

            <div className="dash-card p-0" style={{ overflow: 'hidden' }}>
                <DataTable
                    columns={columns}
                    data={producciones}
                    onCustomAction={abrirDetalles}
                    customActionLabel={<><Eye size={13} className="me-1" />Detalles</>}
                />
            </div>

            {/* Modal Registrar Producción */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Producción" maxWidth="700px">
                <form onSubmit={handleSubmit}>
                    <div className="alert alert-info py-2" style={{ fontSize: '0.9rem' }}>
                        <Factory size={16} className="me-2" />
                        Al registrar, se aumentará el stock del modelo y se descontará el stock de los materiales consumidos.
                    </div>
                    
                    <div className="row mb-4 g-3">
                        <div className="col-md-8">
                            <label className="fw-bold">Modelo a Fabricar</label>
                            <select className="form-select" value={modeloId} onChange={(e) => setModeloId(e.target.value)} required>
                                <option value="">Seleccione...</option>
                                {modelos.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="fw-bold">Cantidad (unds)</label>
                            <input type="number" className="form-control" min="1" value={cantidadProducida} onChange={(e) => setCantidadProducida(e.target.value)} required />
                        </div>
                    </div>

                    <hr />
                    <h6 className="fw-bold text-dark mb-3">Materiales Consumidos en esta orden</h6>
                    <div className="row mb-3 g-2 align-items-end">
                        <div className="col-md-6">
                            <label className="form-label form-label-sm">Material del Almacén</label>
                            <select className="form-select form-select-sm" value={materialId} onChange={(e) => setMaterialId(e.target.value)}>
                                <option value="">Seleccione material...</option>
                                {materiales.map(m => (
                                    <option key={m.id} value={m.id}>
                                        {m.nombre} (Disp: {m.stock} {m.unidad})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label form-label-sm">
                                Cantidad Gastada {selectedMaterial ? `(${selectedMaterial.unidad})` : ''}
                            </label>
                            <input type="number" className="form-control form-control-sm" step="0.01" value={cantidadConsumida} onChange={(e) => setCantidadConsumida(e.target.value)} />
                        </div>
                        <div className="col-md-2">
                            <button type="button" className="btn btn-primary btn-sm w-100" onClick={handleAddDetalle}>
                                <Plus size={18}/> Agregar
                            </button>
                        </div>
                    </div>

                    {detalles.length > 0 && (
                        <div className="table-responsive">
                            <table className="table table-sm mt-2">
                                <thead className="table-light">
                                    <tr>
                                        <th>Material</th>
                                        <th className="text-center">Cant. Consumida</th>
                                        <th className="text-end">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {detalles.map((d, i) => (
                                        <tr key={i}>
                                            <td>{d.materialNombre}</td>
                                            <td className="text-center text-danger fw-bold">- {d.cantidadConsumida} {d.unidad}</td>
                                            <td className="text-end">
                                                <button type="button" className="btn btn-sm btn-outline-danger py-0 px-2" onClick={() => handleRemoveDetalle(i)}>
                                                    <Trash2 size={14}/>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="mt-4 text-end">
                        <button type="button" className="btn btn-outline-secondary me-2" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                        <button type="submit" className="btn btn-dark">Registrar Producción</button>
                    </div>
                </form>
            </Modal>

            {/* Modal Detalles */}
            <Modal isOpen={isDetallesOpen} onClose={() => setIsDetallesOpen(false)} title={`Detalle de Producción #${produccionDetalles?.id ?? ''}`} maxWidth="550px">
                {produccionDetalles && (
                    <div>
                        <div className="mb-3">
                            <strong>Modelo:</strong> <span className="ms-2">{produccionDetalles.modelo?.nombre}</span><br/>
                            <strong>Cantidad:</strong> <span className="ms-2 badge bg-success">{produccionDetalles.cantidadProducida} unidades</span><br/>
                            <strong>Fecha:</strong> <span className="ms-2">{produccionDetalles.fecha}</span>
                        </div>
                        <hr/>
                        <h6 className="fw-bold">Materiales Utilizados</h6>
                        <ul className="list-group list-group-flush mt-2">
                            {produccionDetalles.detalles?.map((d, i) => (
                                <li key={i} className="list-group-item d-flex justify-content-between align-items-center px-0">
                                    {d.material?.nombre}
                                    <span className="badge bg-danger rounded-pill">- {d.cantidadConsumida} {d.material?.unidad}</span>
                                </li>
                            ))}
                            {(!produccionDetalles.detalles || produccionDetalles.detalles.length === 0) && (
                                <li className="list-group-item text-muted px-0">No se registraron materiales</li>
                            )}
                        </ul>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ProduccionPage;
