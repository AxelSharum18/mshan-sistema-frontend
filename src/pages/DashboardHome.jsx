import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { DollarSign, ShoppingBag, Package, TrendingUp, Loader, AlertCircle } from 'lucide-react';
import DataTable from '../components/DataTable';
import api from '../api/axiosConfig';
import './DashboardHome.css';

const COLORS = ['#d4af37', '#111111', '#198754', '#0d6efd'];

const StatCard = ({ title, value, icon, color, loading }) => (
  <div className="stat-card shadow-sm">
    <div className="stat-card-info">
      <p className="stat-card-label">{title}</p>
      {loading
        ? <div className="skeleton-line" style={{ width: '70%', height: 28 }}></div>
        : <h3 className="stat-card-value">{value}</h3>
      }
    </div>
    <div className="stat-card-icon" style={{ backgroundColor: color }}>
      {icon}
    </div>
  </div>
);

const DashboardHome = () => {
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deudas, setDeudas] = useState([]);
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [anio] = useState(new Date().getFullYear());
  const [modoGrafico, setModoGrafico] = useState('MES');

  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const años = [anio - 2, anio - 1, anio];


  useEffect(() => {
    fetchResumen();
    fetchDeudas();
  }, [mes]);

  const fetchDeudas = async () => {
    try {
      const { data } = await api.get('/clientes/deudas');
      setDeudas(data || []);
    } catch (err) {
      console.error('Error al cargar deudas', err);
    }
  };

  const fetchResumen = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/dashboard/resumen?mes=${mes}&anio=${anio}`);
      setResumen(data);
    } catch (err) {
      console.error('Error al cargar resumen del dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (val) => val != null ? `S/ ${Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : 'S/ 0.00';

  // Map evolucionAnual -> recharts format
  // Backend DTO fields: mes, ingresos, egresos
  const evolucionData =
    modoGrafico === 'MES'
      ? (resumen?.evolucionAnual ?? []).map(e => ({
        name: meses[(e.mes ?? 1) - 1],
        ingresos: Number(e.ingresos ?? 0),
        egresos: Number(e.egresos ?? 0),
      }))
      : (resumen?.evolucionDiaria ?? []).map(e => ({
        name: e.dia.toString(),
        ingresos: Number(e.ingresos ?? 0),
        egresos: Number(e.egresos ?? 0),
      }));

  // Top modelos (max 4) — Backend DTO fields: nombre, cantidadTotal
  const topModelosData = (resumen?.topModelos ?? []).slice(0, 4).map(m => ({
    name: m.nombre ?? 'N/A',
    value: Number(m.cantidadTotal ?? 0),
  })).filter(m => m.value > 0);

  return (
    <div className="dashboard-home">

      {/* Header row */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold m-0" style={{ color: 'var(--text-primary)' }}>Resumen Principal</h2>
          <p className="mb-0 mt-1" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {anio} — datos reales del sistema
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <label className="mb-0 fw-semibold" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Mes:</label>
          <select
            className="form-select form-select-sm"
            style={{ width: 120 }}
            value={mes}
            onChange={e => setMes(Number(e.target.value))}
          >
            {meses.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>

          <label
            className="mb-0 fw-semibold"
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.85rem'
            }}
          >
            Vista:
          </label>

          <select
            className="form-select form-select-sm"
            style={{ width: 140 }}
            value={modoGrafico}
            onChange={e => setModoGrafico(e.target.value)}
          >
            <option value="MES">Por Mes</option>
            <option value="DIA">Por Día</option>
          </select>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="row mb-4 g-3">
        <div className="col-6 col-md-3">
          <StatCard
            title="Deuda Total Pendiente"
            value={fmt(resumen?.deudaTotalGlobal)}
            icon={<AlertCircle size={22} color="#fff" />}
            color="#dc3545"
            loading={loading}
          />
        </div>
        <div className="col-6 col-md-3">
          <StatCard
            title="Ventas del Mes"
            value={fmt(resumen?.totalVentasMes)}
            icon={<DollarSign size={22} color="#fff" />}
            color="#198754"
            loading={loading}
          />
        </div>
        <div className="col-6 col-md-3">
          <StatCard
            title="Compras del Mes"
            value={fmt(resumen?.totalComprasMes)}
            icon={<Package size={22} color="#fff" />}
            color="#dc3545"
            loading={loading}
          />
        </div>
        <div className="col-6 col-md-3">
          <StatCard
            title="Ingresos Totales"
            value={fmt((resumen?.ingresosYapeMes ?? 0) + (resumen?.ingresosEfectivoMes ?? 0))}
            icon={<ShoppingBag size={22} color="#fff" />}
            color="#0d6efd"
            loading={loading}
          />
        </div>
        <div className="col-6 col-md-3">
          <StatCard
            title="Saldo del Mes"
            value={fmt(resumen?.saldoTotalMes)}
            icon={<TrendingUp size={22} color="#fff" />}
            color="#111111"
            loading={loading}
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="row g-4">
        {/* Area Chart — Evolución Anual */}
        <div className="col-12 col-md-8">
          <div className="dash-card h-100">
            <h5 className="dash-card-title">
              {modoGrafico === 'MES'
                ? `Evolución de Ingresos y Egresos (${anio})`
                : `Evolución Diaria - ${meses[mes - 1]} ${anio}`
              }
            </h5>
            {loading ? (
              <div className="d-flex align-items-center justify-content-center" style={{ height: 300 }}>
                <Loader size={30} className="spin" style={{ color: 'var(--text-secondary)' }} />
              </div>
            ) : evolucionData.length === 0 ? (
              <div className="d-flex align-items-center justify-content-center" style={{ height: 300, color: 'var(--text-secondary)' }}>
                Sin datos de evolución aún
              </div>
            ) : (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <AreaChart data={evolucionData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradIngresos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#198754" stopOpacity={0.7} />
                        <stop offset="95%" stopColor="#198754" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradEgresos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#dc3545" stopOpacity={0.7} />
                        <stop offset="95%" stopColor="#dc3545" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                    <XAxis dataKey="name" interval="preserveStartEnd" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                    <RechartsTooltip
                      contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-primary)' }}
                      formatter={(val) => `S/ ${val.toLocaleString('es-PE')}`}
                    />
                    <Legend wrapperStyle={{ fontSize: 13 }} />
                    <Area type="monotone" dataKey="ingresos" stroke="#198754" strokeWidth={2} fillOpacity={1} fill="url(#gradIngresos)" name="Ingresos" />
                    <Area type="monotone" dataKey="egresos" stroke="#dc3545" strokeWidth={2} fillOpacity={1} fill="url(#gradEgresos)" name="Egresos" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Donut — Top Modelos */}
        <div className="col-12 col-md-4">
          <div className="dash-card h-100">
            <h5 className="dash-card-title">Top Modelos Más Vendidos</h5>
            {loading ? (
              <div className="d-flex align-items-center justify-content-center" style={{ height: 260 }}>
                <Loader size={30} className="spin" style={{ color: 'var(--text-secondary)' }} />
              </div>
            ) : topModelosData.length === 0 ? (
              <div className="d-flex align-items-center justify-content-center" style={{ height: 260, color: 'var(--text-secondary)' }}>
                Sin ventas registradas aún
              </div>
            ) : (
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={topModelosData}
                      cx="50%" cy="45%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {topModelosData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-primary)' }}
                      formatter={(val) => `${val} unidades`}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Breakdown Ingresos */}
        <div className="col-12 col-md-6">
          <div className="dash-card">
            <h5 className="dash-card-title">Ingresos por Método de Pago</h5>
            <div className="d-flex gap-4 mt-3">
              <div className="method-stat">
                <span className="method-dot" style={{ background: '#198754' }}></span>
                <div>
                  <p className="method-label">Efectivo</p>
                  <p className="method-value">{fmt(resumen?.ingresosEfectivoMes)}</p>
                </div>
              </div>
              <div className="method-stat">
                <span className="method-dot" style={{ background: '#0d6efd' }}></span>
                <div>
                  <p className="method-label">Yape / Transfer</p>
                  <p className="method-value">{fmt(resumen?.ingresosYapeMes)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown Egresos */}
        <div className="col-12 col-md-6">
          <div className="dash-card">
            <h5 className="dash-card-title">Egresos por Método de Pago</h5>
            <div className="d-flex gap-4 mt-3">
              <div className="method-stat">
                <span className="method-dot" style={{ background: '#dc3545' }}></span>
                <div>
                  <p className="method-label">Efectivo</p>
                  <p className="method-value">{fmt(resumen?.egresosEfectivoMes)}</p>
                </div>
              </div>
              <div className="method-stat">
                <span className="method-dot" style={{ background: '#fd7e14' }}></span>
                <div>
                  <p className="method-label">Yape / Transfer</p>
                  <p className="method-value">{fmt(resumen?.egresosYapeMes)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Saldos Históricos Totales */}
        <div className="col-12 col-md-6">
          <StatCard
            title="Saldo Acumulado (Efectivo)"
            value={fmt(resumen?.saldoHistoricoEfectivo)}
            icon={<DollarSign size={22} color="#fff" />}
            color="#198754"
            loading={loading}
          />
        </div>
        <div className="col-12 col-md-6">
          <StatCard
            title="Saldo Acumulado (Yape/Transfer)"
            value={fmt(resumen?.saldoHistoricoYape)}
            icon={<TrendingUp size={22} color="#fff" />}
            color="#0d6efd"
            loading={loading}
          />
        </div>

      </div>

      {/* Cuentas por Cobrar */}
      <div className="row mt-2">
        <div className="col-12">
          <div className="dash-card">
            <h5 className="dash-card-title mb-3">Cuentas por Cobrar (Deudas Pendientes)</h5>
            {deudas.length === 0 ? (
              <div className="text-center py-4 text-muted">No hay deudas pendientes en este momento.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Cliente</th>
                      <th className="text-end">Total Comprado</th>
                      <th className="text-end">Total Pagado</th>
                      <th className="text-end text-danger">Deuda Pendiente</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deudas.map((d, i) => (
                      <tr key={i}>
                        <td className="fw-bold">{d.nombreCliente}</td>
                        <td className="text-end">{fmt(d.totalVentas)}</td>
                        <td className="text-end text-success">{fmt(d.totalPagado)}</td>
                        <td className="text-end fw-bold text-danger">{fmt(d.deudaPendiente)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
