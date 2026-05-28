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
            toast.error("Error al registrar movimiento");
        }
    };

    const columns = [
        { header: 'ID', accessor: 'id' },
        { header: 'Fecha', accessor: 'fecha' },
        { header: 'Tipo', render: (row) => (
            <span className={`badge bg-${row.tipo === 'INGRESO' ? 'success' : 'danger'}`}>
                {row.tipo}
            </span>
        )},
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
                    <button className="btn btn-dark" onClick={() => setIsModalOpen(true)}>+ Registrar Movimiento</button>
                </div>
            </div>

            <div className="dash-card p-0" style={{ overflow: 'hidden' }}>
                <DataTable columns={columns} data={movimientos} />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Movimiento Manual">
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Tipo de Movimiento</label>
                        <select className="form-select" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                            <option value="INGRESO">INGRESO</option>
                            <option value="EGRESO">EGRESO</option>
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Monto (S/)</label>
                        <input type="number" step="0.01" className="form-control" value={monto} onChange={(e) => setMonto(e.target.value)} required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Método de Pago</label>
                        <select className="form-select" value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
                            <option value="EFECTIVO">Efectivo</option>
                            <option value="YAPE">Yape / Plin / Transferencia</option>
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Descripción</label>
                        <textarea className="form-control" rows="3" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required></textarea>
                    </div>
                    <div className="text-end mt-4">
                        <button type="submit" className="btn btn-dark">Guardar</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default MovimientosPage;
