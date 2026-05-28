import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';
import { Plus, Trash2, Eye, Search, FileDown } from 'lucide-react';
import { exportComprasExcel } from '../utils/exportExcel';

/* ─── MODAL DETALLES COMPRA ───────────────────────────────────── */
const ModalDetallesCompra = ({ compra }) => {
  if (!compra) return null;
  const total = compra.detalles?.reduce((s, d) => s + Number(d.subtotal ?? 0), 0) ?? 0;
  return (
    <div>
      <div className="row g-2 mb-3" style={{ fontSize: '0.85rem' }}>
        {[
          ['Proveedor',    compra.proveedor?.nombre ?? '—'],
          ['Fecha',        compra.fecha ?? '—'],
          ['Comprobante',  `${compra.tipoComprobante ?? ''} ${compra.numeroComprobante ?? ''}`.trim() || '—'],
        ].map(([label, val]) => (
          <div className="col-6" key={label}>
            <span style={{ color: 'var(--text-secondary)' }}>{label}: </span>
            <strong style={{ color: 'var(--text-primary)' }}>{val}</strong>
          </div>
        ))}
      </div>
      <hr style={{ borderColor: 'var(--border-color)' }} />
      <h6 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>Materiales Comprados</h6>
      {(!compra.detalles || compra.detalles.length === 0) ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Sin detalles disponibles.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-sm align-middle mb-2">
            <thead>
              <tr>
                <th style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Material</th>
                <th style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }} className="text-center">Cant.</th>
                <th style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }} className="text-end">P. Unit.</th>
                <th style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }} className="text-end">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {compra.detalles.map((d, i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>{d.material?.nombre ?? `Material #${d.material?.id}`}</td>
                  <td className="text-center" style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>{Number(d.cantidad).toFixed(2)}</td>
                  <td className="text-end" style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>S/ {Number(d.precioUnitario).toFixed(2)}</td>
                  <td className="text-end fw-bold" style={{ color: '#dc3545', fontSize: '0.9rem' }}>S/ {Number(d.subtotal).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-end">
            <span className="fw-bold fs-6" style={{ color: 'var(--text-primary)' }}>
              Total Compra: <span style={{ color: '#dc3545' }}>S/ {total.toFixed(2)}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── COMPRAS PAGE ────────────────────────────────────────────── */
const ComprasPage = () => {
    const [compras, setCompras]         = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [materiales, setMateriales]   = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetallesOpen, setIsDetallesOpen] = useState(false);
    const [compraDetalles, setCompraDetalles] = useState(null);

    // Filtro por proveedor
    const [searchProveedor, setSearchProveedor] = useState('');

    const [proveedorId, setProveedorId]         = useState('');
    const [tipoComprobante, setTipoComprobante] = useState('FACTURA');
    const [numeroComprobante, setNumeroComprobante] = useState('');
    const [metodoPago, setMetodoPago]           = useState('EFECTIVO');
    const [detalles, setDetalles]               = useState([]);

    const [materialId, setMaterialId]           = useState('');
    const [cantidad, setCantidad]               = useState(1);
    const [precioUnitario, setPrecioUnitario]   = useState(0);

    useEffect(() => {
        fetchCompras();
        fetchCatalogos();
    }, []);

    const fetchCompras = async () => {
        try {
            const { data } = await api.get('/compras?size=200&sort=id,desc');
            const arr = data?.content || data;
            setCompras(Array.isArray(arr) ? arr : []);
        } catch (error) {
            toast.error("Error al cargar compras");
        }
    };

    const fetchCatalogos = async () => {
        try {
            const [resProv, resMat] = await Promise.all([
                api.get('/proveedores?size=100'),
                api.get('/materiales?size=100')
            ]);
            setProveedores(resProv.data.content ?? []);
            setMateriales(resMat.data.content ?? []);
        } catch (error) {
            console.error("Error catalogos", error);
        }
    };

    const handleAddDetalle = () => {
        if (!materialId || cantidad <= 0 || precioUnitario <= 0) {
            toast.warn("Ingrese datos válidos");
            return;
        }
        const material = materiales.find(m => m.id === parseInt(materialId));
        setDetalles([...detalles, {
            materialId: parseInt(materialId),
            materialNombre: material.nombre,
            cantidad: parseFloat(cantidad),
            precioUnitario: parseFloat(precioUnitario)
        }]);
        setMaterialId(''); setCantidad(1); setPrecioUnitario(0);
    };

    const handleRemoveDetalle = (index) => {
        const newDetalles = [...detalles];
        newDetalles.splice(index, 1);
        setDetalles(newDetalles);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!proveedorId || detalles.length === 0) {
            toast.warn("Seleccione un proveedor y materiales");
            return;
        }
        const payload = {
            proveedorId: parseInt(proveedorId),
            fecha: new Date().toISOString().split('T')[0],
            tipoComprobante,
            numeroComprobante,
            metodoPago,
            detalles: detalles.map(d => ({
                materialId: d.materialId,
                cantidad: d.cantidad,
                precioUnitario: d.precioUnitario
            }))
        };
        try {
            await api.post('/compras', payload);
            toast.success("Compra registrada — stock actualizado y egreso registrado");
            setIsModalOpen(false);
            setDetalles([]);
            setNumeroComprobante('');
            fetchCompras();
        } catch (error) {
            toast.error("Error al registrar compra");
        }
    };

    const abrirDetalles = async (compra) => {
        try {
            const { data } = await api.get(`/compras/${compra.id}`);
            setCompraDetalles(data);
        } catch {
            setCompraDetalles(compra);
        }
        setIsDetallesOpen(true);
    };

    // Filtrado en el cliente
    const comprasFiltradas = compras.filter(c => {
        return searchProveedor === '' ||
            (c.proveedor?.nombre ?? '').toLowerCase().includes(searchProveedor.toLowerCase());
    });

    const columns = [
        { header: 'ID',          accessor: 'id' },
        { header: 'Fecha',       accessor: 'fecha' },
        { header: 'Proveedor',   render: (row) => row.proveedor?.nombre ?? '—' },
        { header: 'Comprobante', render: (row) => `${row.tipoComprobante ?? ''} ${row.numeroComprobante ?? ''}`.trim() || '—' },
    ];

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <h2 className="fw-bold m-0" style={{ color: 'var(--text-primary)' }}>Ingreso de Compras (Materiales)</h2>
                <div className="d-flex gap-2 flex-wrap">
                    <button
                        className="btn btn-sm btn-outline-success"
                        onClick={() => exportComprasExcel(compras)}
                        disabled={compras.length === 0}
                    >
                        <FileDown size={15} className="me-1" />Exportar Excel
                    </button>
                    <button className="btn btn-dark" onClick={() => setIsModalOpen(true)}>+ Nueva Compra</button>
                </div>
            </div>

            {/* ── Barra de Filtros ─────────────────── */}
            <div className="d-flex gap-2 mb-3 flex-wrap align-items-center">
                <div className="input-group" style={{ maxWidth: 260 }}>
                    <span className="input-group-text" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                        <Search size={15} />
                    </span>
                    <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Buscar por proveedor..."
                        value={searchProveedor}
                        onChange={e => setSearchProveedor(e.target.value)}
                    />
                </div>
                {searchProveedor && (
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => setSearchProveedor('')}>
                        Limpiar
                    </button>
                )}
                <span className="ms-auto align-self-center" style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                    {comprasFiltradas.length} resultado{comprasFiltradas.length !== 1 ? 's' : ''}
                </span>
            </div>

            <div className="dash-card p-0" style={{ overflow: 'hidden' }}>
                <DataTable
                    columns={columns}
                    data={comprasFiltradas}
                    onCustomAction={abrirDetalles}
                    customActionLabel={<><Eye size={13} className="me-1" />Detalles</>}
                />
            </div>

            {/* ── Modal Registrar Compra ──────────── */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Compra" maxWidth="700px">
                <form onSubmit={handleSubmit}>
                    <div className="row mb-3 g-3">
                        <div className="col-md-6">
                            <label>Proveedor</label>
                            <select className="form-select" value={proveedorId} onChange={(e) => setProveedorId(e.target.value)} required>
                                <option value="">Seleccione...</option>
                                {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label>Método Pago (Egreso)</label>
                            <select className="form-select" value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
                                <option value="EFECTIVO">Efectivo</option>
                                <option value="YAPE">Yape / Transferencia</option>
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label>Comprobante</label>
                            <select className="form-select" value={tipoComprobante} onChange={(e) => setTipoComprobante(e.target.value)}>
                                <option value="FACTURA">Factura</option>
                                <option value="BOLETA">Boleta</option>
                                <option value="RECIBO">Recibo</option>
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label>Nro Comprobante</label>
                            <input type="text" className="form-control" value={numeroComprobante} onChange={(e) => setNumeroComprobante(e.target.value)} />
                        </div>
                    </div>

                    <hr />
                    <h6 className="fw-bold text-dark">Materiales Comprados</h6>
                    <div className="row mb-3 g-2 align-items-end">
                        <div className="col-md-5">
                            <label className="form-label form-label-sm">Material</label>
                            <select className="form-select form-select-sm" value={materialId} onChange={(e) => setMaterialId(e.target.value)}>
                                <option value="">Seleccione...</option>
                                {materiales.map(m => <option key={m.id} value={m.id}>{m.nombre} ({m.unidad})</option>)}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label form-label-sm">Cant.</label>
                            <input type="number" className="form-control form-control-sm" step="0.01" value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label form-label-sm">P. Unitario</label>
                            <input type="number" className="form-control form-control-sm" step="0.01" value={precioUnitario} onChange={(e) => setPrecioUnitario(e.target.value)} />
                        </div>
                        <div className="col-md-1">
                            <button type="button" className="btn btn-success btn-sm w-100" onClick={handleAddDetalle}><Plus size={18}/></button>
                        </div>
                    </div>

                    {detalles.length > 0 && (
                        <table className="table table-sm mt-3">
                            <thead className="table-light">
                                <tr><th>Material</th><th>Cant</th><th>P.U.</th><th>Subtotal</th><th></th></tr>
                            </thead>
                            <tbody>
                                {detalles.map((d, i) => (
                                    <tr key={i}>
                                        <td>{d.materialNombre}</td>
                                        <td>{d.cantidad}</td>
                                        <td>S/ {d.precioUnitario}</td>
                                        <td>S/ {(d.cantidad * d.precioUnitario).toFixed(2)}</td>
                                        <td><button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveDetalle(i)}><Trash2 size={14}/></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    <div className="mt-4 text-end">
                        <h5 className="fw-bold text-dark">Total a Pagar: S/ {detalles.reduce((acc, d) => acc + (d.cantidad * d.precioUnitario), 0).toFixed(2)}</h5>
                        <button type="button" className="btn btn-outline-secondary me-2" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                        <button type="submit" className="btn btn-dark mt-2">Guardar Compra</button>
                    </div>
                </form>
            </Modal>

            {/* ── Modal Detalles Compra ──────────── */}
            <Modal
                isOpen={isDetallesOpen}
                onClose={() => setIsDetallesOpen(false)}
                title={`Detalle de Compra #${compraDetalles?.id ?? ''}`}
                maxWidth="580px"
            >
                <ModalDetallesCompra compra={compraDetalles} />
            </Modal>
        </div>
    );
};

export default ComprasPage;
