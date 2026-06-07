import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';
import { Plus, Trash2, CreditCard, Eye, Search, FileDown } from 'lucide-react';
import { exportVentasExcel } from '../utils/exportExcel';

/* ─── MODAL DE PAGOS ─────────────────────────────────────────── */
const ModalPagos = ({ venta, onClose }) => {
  const [pagos, setPagos]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [monto, setMonto]           = useState('');
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [deudaGlobal, setDeudaGlobal] = useState(null);

  const totalVenta  = venta?.detalles?.reduce((s, d) => s + Number(d.subtotal ?? 0), 0) ?? 0;
  const totalPagado = pagos.reduce((s, p) => s + Number(p.monto ?? 0), 0);
  const deuda       = Math.max(0, totalVenta - totalPagado);
  const progreso    = totalVenta > 0 ? Math.min(100, (totalPagado / totalVenta) * 100) : 0;

  useEffect(() => {
    if (venta?.id) {
      fetchPagos();
      fetchDeudaGlobal();
    }
  }, [venta]);

  const fetchDeudaGlobal = async () => {
    if (!venta?.cliente?.id) return;
    try {
      const { data } = await api.get(`/clientes/${venta.cliente.id}/deuda`);
      setDeudaGlobal(data.deudaPendiente);
    } catch {
      // Ignorar si no tiene deuda o da 404
      setDeudaGlobal(0);
    }
  };

  const fetchPagos = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/pagos/venta/${venta.id}`);
      setPagos(data);
    } catch {
      toast.error('Error al cargar pagos');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrarPago = async (e) => {
    e.preventDefault();
    if (!monto || Number(monto) <= 0) { toast.warn('Ingrese un monto válido'); return; }
    if (Number(monto) > deuda)         { toast.warn(`El monto no puede superar la deuda de S/ ${deuda.toFixed(2)}`); return; }
    try {
      await api.post('/pagos', {
        ventaId: venta.id,
        fecha: new Date().toISOString().split('T')[0],
        monto: Number(monto),
        metodoPago,
      });
      toast.success(deuda - Number(monto) <= 0 ? '✅ Venta CANCELADA — pago completo' : 'Pago registrado');
      setMonto('');
      fetchPagos();
      fetchDeudaGlobal();
    } catch {
      toast.error('Error al registrar pago');
    }
  };

  const fmt = (v) => `S/ ${Number(v).toFixed(2)}`;

  return (
    <div>
      {deudaGlobal > 0 && (
        <div className="alert alert-danger py-2 mb-3 d-flex align-items-center fw-bold shadow-sm" style={{ borderLeft: '4px solid #dc3545' }}>
          Deuda Global Acumulada del Cliente: S/ {Number(deudaGlobal).toFixed(2)}
        </div>
      )}

      <div className="p-3 mb-3 rounded-3" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
        <div className="d-flex justify-content-between mb-1">
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Venta #{venta?.id} · {venta?.cliente?.nombre}</span>
          <span className={`badge bg-${venta?.estado === 'CANCELADO' ? 'success' : 'warning text-dark'}`}>{venta?.estado}</span>
        </div>
        <div className="d-flex justify-content-between">
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Total venta</span>
          <strong style={{ color: 'var(--text-primary)' }}>{fmt(totalVenta)}</strong>
        </div>
      </div>

      <div className="mb-4">
        <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.82rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Progreso de cobro</span>
          <span style={{ fontWeight: 700, color: progreso >= 100 ? '#198754' : 'var(--text-primary)' }}>{progreso.toFixed(1)}%</span>
        </div>
        <div className="progress" style={{ height: 10, borderRadius: 8 }}>
          <div
            className={`progress-bar ${progreso >= 100 ? 'bg-success' : progreso >= 50 ? 'bg-warning' : 'bg-danger'}`}
            style={{ width: `${progreso}%`, transition: 'width 0.5s ease' }}
          ></div>
        </div>
        <div className="d-flex justify-content-between mt-2" style={{ fontSize: '0.82rem' }}>
          <span style={{ color: '#198754' }}>Pagado: <strong>{fmt(totalPagado)}</strong></span>
          <span style={{ color: '#dc3545' }}>Deuda: <strong>{fmt(deuda)}</strong></span>
        </div>
      </div>

      <h6 className="fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>Historial de Abonos</h6>
      {loading ? (
        <div className="text-center py-3" style={{ color: 'var(--text-secondary)' }}>Cargando...</div>
      ) : pagos.length === 0 ? (
        <div className="text-center py-3" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Sin pagos registrados aún</div>
      ) : (
        <div className="table-responsive mb-3">
          <table className="table table-sm align-middle mb-0">
            <thead>
              <tr>
                <th style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Fecha</th>
                <th style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Método</th>
                <th style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }} className="text-end">Monto</th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((p, i) => (
                <tr key={i}>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{p.fecha}</td>
                  <td><span className="badge bg-secondary" style={{ fontSize: '0.72rem' }}>{p.metodoPago}</span></td>
                  <td className="text-end fw-bold" style={{ color: '#198754', fontSize: '0.9rem' }}>{fmt(p.monto)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {venta?.estado !== 'CANCELADO' && (
        <>
          <hr style={{ borderColor: 'var(--border-color)' }} />
          <h6 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>Registrar Nuevo Abono</h6>
          <form onSubmit={handleRegistrarPago}>
            <div className="row g-2 align-items-end">
              <div className="col-5">
                <label className="form-label mb-1" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Monto (S/)</label>
                <input type="number" step="0.01" min="0.01" max={deuda} className="form-control form-control-sm"
                  placeholder={`Máx: ${fmt(deuda)}`} value={monto} onChange={e => setMonto(e.target.value)} required />
              </div>
              <div className="col-4">
                <label className="form-label mb-1" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Método</label>
                <select className="form-select form-select-sm" value={metodoPago} onChange={e => setMetodoPago(e.target.value)}>
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="YAPE">Yape / Plin</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                </select>
              </div>
              <div className="col-3">
                <button type="submit" className="btn btn-dark btn-sm w-100">
                  <CreditCard size={14} className="me-1" />Abonar
                </button>
              </div>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

/* ─── MODAL DETALLES VENTA ────────────────────────────────────── */
const ModalDetallesVenta = ({ venta }) => {
  if (!venta) return null;
  const total = venta.detalles?.reduce((s, d) => s + Number(d.subtotal ?? 0), 0) ?? 0;
  return (
    <div>
      {/* Info cabecera */}
      <div className="row g-2 mb-3" style={{ fontSize: '0.85rem' }}>
        {[
          ['Cliente',      venta.cliente?.nombre ?? '—'],
          ['Fecha',        venta.fecha ?? '—'],
          ['Tipo Venta',   venta.tipoVenta ?? '—'],
          ['Comprobante',  `${venta.tipoComprobante ?? ''} ${venta.numeroComprobante ?? ''}`.trim() || '—'],
          ['Estado',       venta.estado ?? '—'],
        ].map(([label, val]) => (
          <div className="col-6" key={label}>
            <span style={{ color: 'var(--text-secondary)' }}>{label}: </span>
            <strong style={{ color: 'var(--text-primary)' }}>{val}</strong>
          </div>
        ))}
      </div>
      <hr style={{ borderColor: 'var(--border-color)' }} />
      <h6 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>Detalle de Productos</h6>
      {(!venta.detalles || venta.detalles.length === 0) ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Sin detalles disponibles.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-sm align-middle mb-2">
            <thead>
              <tr>
                <th style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Modelo</th>
                <th style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }} className="text-center">Cant.</th>
                <th style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }} className="text-end">P. Unit.</th>
                <th style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }} className="text-end">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {venta.detalles.map((d, i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>{d.modelo?.nombre ?? `Modelo #${d.modelo?.id}`}</td>
                  <td className="text-center" style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>{d.cantidad}</td>
                  <td className="text-end" style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>S/ {Number(d.precioUnitario).toFixed(2)}</td>
                  <td className="text-end fw-bold" style={{ color: '#198754', fontSize: '0.9rem' }}>S/ {Number(d.subtotal).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-end">
            <span className="fw-bold fs-6" style={{ color: 'var(--text-primary)' }}>
              Total: <span style={{ color: '#198754' }}>S/ {total.toFixed(2)}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── VENTAS PAGE ─────────────────────────────────────────────── */
const VentasPage = () => {
  const [ventas, setVentas]                   = useState([]);
  const [clientes, setClientes]               = useState([]);
  const [modelos, setModelos]                 = useState([]);
  const [isModalOpen, setIsModalOpen]         = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [isPagosOpen, setIsPagosOpen]         = useState(false);
  const [isDetallesOpen, setIsDetallesOpen]   = useState(false);
  const [ventaDetalles, setVentaDetalles]     = useState(null);

  // Filtros
  const [searchCliente, setSearchCliente]   = useState('');
  const [filterEstado, setFilterEstado]     = useState('');

  // Form state
  const [clienteId, setClienteId]               = useState('');
  const [tipoVenta, setTipoVenta]               = useState('MAYOR');
  const [tipoComprobante, setTipoComprobante]   = useState('BOLETA');
  const [numeroComprobante, setNumeroComprobante] = useState('');
  const [detalles, setDetalles]                 = useState([]);

  // Detalle temp
  const [modeloId, setModeloId]             = useState('');
  const [cantidad, setCantidad]             = useState(1);
  const [precioUnitario, setPrecioUnitario] = useState('');

  useEffect(() => {
    fetchVentas();
    fetchCatalogos();
  }, []);

  const fetchVentas = async () => {
    try {
      const { data } = await api.get('/ventas?size=200&sort=id,desc');
      setVentas(data.content ?? []);
    } catch { toast.error('Error al cargar ventas'); }
  };

  const fetchCatalogos = async () => {
    try {
      const [rc, rm] = await Promise.all([
        api.get('/clientes?size=200'),
        api.get('/modelos?size=200'),
      ]);
      setClientes(rc.data.content ?? []);
      setModelos(rm.data.content ?? []);
    } catch { /* silencioso */ }
  };

  const handleAddDetalle = () => {
    if (!modeloId || !cantidad || !precioUnitario) { toast.warn('Complete todos los campos del producto'); return; }
    const modelo = modelos.find(m => m.id === parseInt(modeloId));
    if (!modelo) return;
    setDetalles(prev => [...prev, {
      modeloId: parseInt(modeloId),
      modeloNombre: modelo.nombre,
      cantidad: parseInt(cantidad),
      precioUnitario: parseFloat(precioUnitario),
    }]);
    setModeloId(''); setCantidad(1); setPrecioUnitario('');
  };

  const handleRemoveDetalle = (i) => setDetalles(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clienteId || detalles.length === 0) { toast.warn('Seleccione cliente y al menos un producto'); return; }
    try {
      await api.post('/ventas', {
        clienteId: parseInt(clienteId),
        fecha: new Date().toISOString().split('T')[0],
        tipoVenta, tipoComprobante, numeroComprobante,
        detalles: detalles.map(d => ({ modeloId: d.modeloId, cantidad: d.cantidad, precioUnitario: d.precioUnitario })),
      });
      toast.success('Venta registrada exitosamente');
      setIsModalOpen(false);
      resetForm();
      fetchVentas();
    } catch { toast.error('Error al registrar venta'); }
  };

  const resetForm = () => {
    setClienteId(''); setTipoVenta('MAYOR'); setTipoComprobante('BOLETA');
    setNumeroComprobante(''); setDetalles([]);
  };

  const abrirPagos = async (venta) => {
    try {
      const { data } = await api.get(`/ventas/${venta.id}`);
      setVentaSeleccionada(data);
    } catch {
      setVentaSeleccionada(venta);
    }
    setIsPagosOpen(true);
  };

  const abrirDetalles = async (venta) => {
    try {
      const { data } = await api.get(`/ventas/${venta.id}`);
      setVentaDetalles(data);
    } catch {
      setVentaDetalles(venta);
    }
    setIsDetallesOpen(true);
  };

  // Filtrado en el cliente
  const ventasFiltradas = ventas.filter(v => {
    const matchCliente = searchCliente === '' || (v.cliente?.nombre ?? '').toLowerCase().includes(searchCliente.toLowerCase());
    const matchEstado  = filterEstado === '' || v.estado === filterEstado;
    return matchCliente && matchEstado;
  });

  const totalDetalles = detalles.reduce((s, d) => s + d.cantidad * d.precioUnitario, 0);

  const columns = [
    { header: '#',           accessor: 'id' },
    { header: 'Fecha',       accessor: 'fecha' },
    { header: 'Cliente',     render: r => r.cliente?.nombre ?? '—' },
    { header: 'Tipo',        render: r => <span className="badge bg-secondary">{r.tipoVenta}</span> },
    { header: 'Comprobante', render: r => `${r.tipoComprobante ?? ''} ${r.numeroComprobante ?? ''}`.trim() || '—' },
    { header: 'Estado',      render: r => <span className={`badge bg-${r.estado === 'CANCELADO' ? 'success' : 'warning text-dark'}`}>{r.estado}</span> },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h2 className="fw-bold m-0" style={{ color: 'var(--text-primary)' }}>Gestión de Ventas</h2>
        <div className="d-flex gap-2 flex-wrap">
          <button
            className="btn btn-sm btn-outline-success"
            onClick={() => exportVentasExcel(ventas)}
            disabled={ventas.length === 0}
          >
            <FileDown size={15} className="me-1" />Exportar Excel
          </button>
          <button className="btn btn-dark" onClick={() => { resetForm(); setIsModalOpen(true); }}>+ Nueva Venta</button>
        </div>
      </div>

      {/* ── Barra de Filtros ─────────────────── */}
      <div className="d-flex gap-2 mb-3 flex-wrap">
        <div className="input-group" style={{ maxWidth: 260 }}>
          <span className="input-group-text" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
            <Search size={15} />
          </span>
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Buscar por cliente..."
            value={searchCliente}
            onChange={e => setSearchCliente(e.target.value)}
          />
        </div>
        <select
          className="form-select form-select-sm"
          style={{ maxWidth: 180 }}
          value={filterEstado}
          onChange={e => setFilterEstado(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">PENDIENTE</option>
          <option value="EN_PROCESO">EN PROCESO</option>
          <option value="ENTREGADO">ENTREGADO</option>
          <option value="CANCELADO">CANCELADO</option>
        </select>
        {(searchCliente || filterEstado) && (
          <button className="btn btn-sm btn-outline-secondary" onClick={() => { setSearchCliente(''); setFilterEstado(''); }}>
            Limpiar
          </button>
        )}
        <span className="ms-auto align-self-center" style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
          {ventasFiltradas.length} resultado{ventasFiltradas.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Tabla */}
      <div className="dash-card p-0" style={{ overflow: 'hidden' }}>
        <DataTable
          columns={columns}
          data={ventasFiltradas}
          onCustomAction={abrirDetalles}
          customActionLabel={<><Eye size={13} className="me-1" />Detalles</>}
          onSecondaryAction={abrirPagos}
          secondaryActionLabel={<><CreditCard size={13} className="me-1" />Pagos</>}
        />
      </div>

      {/* ── Modal Nueva Venta ─────────────────── */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Nueva Venta" maxWidth="700px">
        <form onSubmit={handleSubmit}>
          <div className="row mb-3 g-3">
            <div className="col-md-6">
              <label>Cliente</label>
              <select className="form-select" value={clienteId} onChange={e => setClienteId(e.target.value)} required>
                <option value="">Seleccione cliente...</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div className="col-md-6">
              <label>Tipo de Venta</label>
              <select className="form-select" value={tipoVenta} onChange={e => setTipoVenta(e.target.value)}>
                <option value="MAYOR">Mayorista</option>
                <option value="MENOR">Minorista</option>
              </select>
            </div>
            <div className="col-md-6">
              <label>Tipo Comprobante</label>
              <select className="form-select" value={tipoComprobante} onChange={e => setTipoComprobante(e.target.value)}>
                <option value="BOLETA">Boleta</option>
                <option value="FACTURA">Factura</option>
                <option value="NOTA_VENTA">Nota de Venta</option>
              </select>
            </div>
            <div className="col-md-6">
              <label>Nº Comprobante</label>
              <input type="text" className="form-control" value={numeroComprobante} onChange={e => setNumeroComprobante(e.target.value)} placeholder="Ej: B001-000123" />
            </div>
          </div>

          <hr />
          <p className="fw-bold mb-3 text-dark">Detalle de Productos</p>
          <div className="row g-2 align-items-end mb-3">
            <div className="col-md-5">
              <label className="form-label form-label-sm text-dark">Modelo</label>
              <select className="form-select form-select-sm" value={modeloId} onChange={e => setModeloId(e.target.value)}>
                <option value="">Seleccione...</option>
                {modelos.map(m => <option key={m.id} value={m.id}>{m.nombre} (Stock: {m.stock ?? 0})</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label form-label-sm text-dark">Cantidad</label>
              <input type="number" className="form-control form-control-sm" min="1" value={cantidad} onChange={e => setCantidad(e.target.value)} />
            </div>
            <div className="col-md-3">
              <label className="form-label form-label-sm text-dark">P. Unitario</label>
              <input type="number" className="form-control form-control-sm" step="0.01" value={precioUnitario} onChange={e => setPrecioUnitario(e.target.value)} placeholder="S/" />
            </div>
            <div className="col-md-1">
              <button type="button" className="btn btn-success btn-sm w-100" onClick={handleAddDetalle}><Plus size={16} /></button>
            </div>
          </div>

          {detalles.length > 0 && (
            <div className="table-responsive">
              <table className="table table-sm align-middle">
                <thead className="table-light">
                  <tr><th>Producto</th><th>Cant.</th><th>P.U.</th><th>Subtotal</th><th></th></tr>
                </thead>
                <tbody>
                  {detalles.map((d, i) => (
                    <tr key={i}>
                      <td>{d.modeloNombre}</td>
                      <td>{d.cantidad}</td>
                      <td>S/ {d.precioUnitario.toFixed(2)}</td>
                      <td className="fw-bold">S/ {(d.cantidad * d.precioUnitario).toFixed(2)}</td>
                      <td>
                        <button type="button" className="btn btn-sm btn-outline-danger py-0" onClick={() => handleRemoveDetalle(i)}>
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="text-end mt-3">
            <p className="fw-bold fs-5 mb-2 text-dark">Total: S/ {totalDetalles.toFixed(2)}</p>
            <button type="button" className="btn btn-outline-secondary me-2" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-dark">Guardar Venta</button>
          </div>
        </form>
      </Modal>

      {/* ── Modal Detalles ─────────────────────── */}
      <Modal
        isOpen={isDetallesOpen}
        onClose={() => setIsDetallesOpen(false)}
        title={`Detalle de Venta #${ventaDetalles?.id ?? ''}`}
        maxWidth="580px"
      >
        <ModalDetallesVenta venta={ventaDetalles} />
      </Modal>

      {/* ── Modal Pagos ─────────────────────────── */}
      <Modal
        isOpen={isPagosOpen}
        onClose={() => { setIsPagosOpen(false); fetchVentas(); }}
        title={`Pagos — Venta #${ventaSeleccionada?.id ?? ''}`}
        maxWidth="520px"
      >
        {ventaSeleccionada && (
          <ModalPagos
            venta={ventaSeleccionada}
            onClose={() => { setIsPagosOpen(false); fetchVentas(); }}
          />
        )}
      </Modal>
    </div>
  );
};

export default VentasPage;
