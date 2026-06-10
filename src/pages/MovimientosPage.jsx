import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';
import { FileDown } from 'lucide-react';
import { exportMovimientosExcel } from '../utils/exportExcel';

const MovimientosPage = () => {
    const [movimientos, setMovimientos] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [tipo, setTipo] = useState('INGRESO');
    const [monto, setMonto] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [metodoPago, setMetodoPago] = useState('EFECTIVO');

    // Transferencia Interna state
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [transferMonto, setTransferMonto] = useState('');
    const [transferOrigen, setTransferOrigen] = useState('YAPE');
    const [transferDestino, setTransferDestino] = useState('EFECTIVO');
    const [transferDesc, setTransferDesc] = useState('');

    useEffect(() => {
        fetchMovimientos();
    }, []);

    const fetchMovimientos = async () => {
        try {
            const { data } = await api.get('/movimientos?size=500&sort=id,desc');
            const arr = data?.content || data;
            setMovimientos(Array.isArray(arr) ? arr : []);
        } catch (error) {
            toast.error("Error al cargar movimientos");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/movimientos', {
                tipo,
                monto: parseFloat(monto),
                descripcion,
                fecha: new Date().toISOString().split('T')[0],
                cuenta: metodoPago
            });
            toast.success("Movimiento registrado con éxito");
            setIsModalOpen(false);
            setMonto(''); setDescripcion('');
            fetchMovimientos();
        } catch (error) {
            toast.error(error.response?.data?.message || "Error al registrar movimiento");
        }
    };

    const handleTransferSubmit = async (e) => {
        e.preventDefault();
        if (transferOrigen === transferDestino) {
            toast.error("La cuenta de origen y destino deben ser diferentes");
            return;
        }
        try {
            await api.post('/movimientos/transferencia', {
                monto: parseFloat(transferMonto),
                cuentaOrigen: transferOrigen,
                cuentaDestino: transferDestino,
                descripcion: transferDesc || 'Transferencia interna',
                fecha: new Date().toISOString().split('T')[0],
            });
            toast.success("Transferencia registrada con éxito");
            setIsTransferModalOpen(false);
            setTransferMonto(''); setTransferDesc('');
            fetchMovimientos();
        } catch (error) {
            toast.error(error.response?.data?.message || "Error al registrar transferencia");
        }
    };

    const columns = [
        { header: 'ID', accessor: 'id' },
        { header: 'Fecha', accessor: 'fecha' },
        { header: 'Tipo', render: (row) => {
            let badgeClass = 'secondary';
            if (row.tipo === 'INGRESO') badgeClass = 'success';
            else if (row.tipo === 'EGRESO') badgeClass = 'danger';
            else if (row.tipo?.includes('TRANSF')) badgeClass = 'info text-dark';
            return (
                <span className={`badge bg-${badgeClass}`}>
                    {row.tipo}
                </span>
            );
        }},
        { header: 'Descripción', accessor: 'descripcion' },
        { header: 'Monto', render: (row) => `S/ ${row.monto}` },
        { header: 'Método', accessor: 'cuenta' },
    ];

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <h2 className="fw-bold m-0" style={{ color: 'var(--text-primary)' }}>Caja y Movimientos</h2>
                <div className="d-flex gap-2 flex-wrap">
                    <button
                        className="btn btn-sm btn-outline-success"
                        onClick={() => exportMovimientosExcel(movimientos)}
                        disabled={movimientos.length === 0}
                    >
                        <FileDown size={15} className="me-1" />Exportar Excel
                    </button>
                    <button className="btn btn-secondary" onClick={() => setIsTransferModalOpen(true)}>+ Transferencia Interna</button>
                    <button className="btn btn-dark" onClick={() => setIsModalOpen(true)}>+ Registrar Movimiento</button>
                </div>
            </div>

            <div className="dash-card p-0" style={{ overflow: 'hidden' }}>
                <DataTable columns={columns} data={movimientos} />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Movimiento Manual">
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label>Tipo de Movimiento</label>
                        <select className="form-select" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                            <option value="INGRESO">INGRESO</option>
                            <option value="EGRESO">EGRESO</option>
                        </select>
                    </div>
                    <div className="mb-3">
                        <label>Monto (S/)</label>
                        <input type="number" step="0.01" className="form-control" value={monto} onChange={(e) => setMonto(e.target.value)} required />
                    </div>
                    <div className="mb-3">
                        <label>Método de Pago</label>
                        <select className="form-select" value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
                            <option value="EFECTIVO">Efectivo</option>
                            <option value="YAPE">Yape / Plin / Transferencia</option>
                        </select>
                    </div>
                    <div className="mb-3">
                        <label>Descripción</label>
                        <textarea className="form-control" rows="3" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required></textarea>
                    </div>
                    <div className="text-end mt-4">
                        <button type="submit" className="btn btn-dark">Guardar</button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isTransferModalOpen} onClose={() => setIsTransferModalOpen(false)} title="Transferencia Interna">
                <form onSubmit={handleTransferSubmit}>
                    <div className="row mb-3">
                        <div className="col-6">
                            <label>Cuenta Origen (Retiro)</label>
                            <select className="form-select" value={transferOrigen} onChange={(e) => setTransferOrigen(e.target.value)}>
                                <option value="YAPE">Yape / Plin / Transferencia</option>
                                <option value="EFECTIVO">Efectivo</option>
                            </select>
                        </div>
                        <div className="col-6">
                            <label>Cuenta Destino (Depósito)</label>
                            <select className="form-select" value={transferDestino} onChange={(e) => setTransferDestino(e.target.value)}>
                                <option value="EFECTIVO">Efectivo</option>
                                <option value="YAPE">Yape / Plin / Transferencia</option>
                            </select>
                        </div>
                    </div>
                    <div className="mb-3">
                        <label>Monto a Transferir (S/)</label>
                        <input type="number" step="0.01" className="form-control" value={transferMonto} onChange={(e) => setTransferMonto(e.target.value)} required />
                    </div>
                    <div className="mb-3">
                        <label>Descripción (Opcional)</label>
                        <textarea className="form-control" rows="2" placeholder="Ej: Retiro de efectivo desde Yape" value={transferDesc} onChange={(e) => setTransferDesc(e.target.value)}></textarea>
                    </div>
                    <div className="text-end mt-4">
                        <button type="submit" className="btn btn-primary">Realizar Transferencia</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default MovimientosPage;
