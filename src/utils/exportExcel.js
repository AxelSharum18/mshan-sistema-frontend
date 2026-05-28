import * as XLSX from 'xlsx';

/**
 * Exporta un arreglo de datos a un archivo Excel (.xlsx).
 * @param {Array} data - Arreglo de objetos a exportar
 * @param {Array} columns - [{ header: 'Nombre Col', key: 'campo' }]
 * @param {string} filename - Nombre del archivo sin extensión
 * @param {string} sheetName - Nombre de la hoja
 */
export const exportToExcel = (data, columns, filename, sheetName = 'Datos') => {
  // Mapeamos los datos usando solo las columnas especificadas
  const rows = data.map(row => {
    const mapped = {};
    columns.forEach(col => {
      mapped[col.header] = col.getValue ? col.getValue(row) : (row[col.key] ?? '');
    });
    return mapped;
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();

  // Ajustar ancho de columnas automáticamente
  const colWidths = columns.map(col => ({
    wch: Math.max(col.header.length + 2, 15)
  }));
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Exporta ventas con sus detalles en dos hojas separadas.
 */
export const exportVentasExcel = (ventas) => {
  const wb = XLSX.utils.book_new();

  // Hoja 1: Cabeceras de ventas
  const ventasRows = ventas.map(v => ({
    'ID': v.id,
    'Fecha': v.fecha,
    'Cliente': v.cliente?.nombre ?? '—',
    'Tipo Venta': v.tipoVenta ?? '—',
    'Comprobante': `${v.tipoComprobante ?? ''} ${v.numeroComprobante ?? ''}`.trim() || '—',
    'Estado': v.estado ?? '—',
    'Total (S/)': v.detalles?.reduce((s, d) => s + Number(d.subtotal ?? 0), 0).toFixed(2) ?? '0.00'
  }));

  const ws1 = XLSX.utils.json_to_sheet(ventasRows);
  ws1['!cols'] = [
    { wch: 6 }, { wch: 12 }, { wch: 25 }, { wch: 12 },
    { wch: 22 }, { wch: 12 }, { wch: 12 }
  ];
  XLSX.utils.book_append_sheet(wb, ws1, 'Ventas');

  // Hoja 2: Detalles de ventas
  const detallesRows = [];
  ventas.forEach(v => {
    v.detalles?.forEach(d => {
      detallesRows.push({
        'Venta ID': v.id,
        'Fecha': v.fecha,
        'Cliente': v.cliente?.nombre ?? '—',
        'Modelo': d.modelo?.nombre ?? '—',
        'Cantidad': d.cantidad,
        'P. Unitario (S/)': Number(d.precioUnitario).toFixed(2),
        'Subtotal (S/)': Number(d.subtotal).toFixed(2),
      });
    });
  });

  if (detallesRows.length > 0) {
    const ws2 = XLSX.utils.json_to_sheet(detallesRows);
    ws2['!cols'] = [
      { wch: 8 }, { wch: 12 }, { wch: 22 }, { wch: 22 },
      { wch: 10 }, { wch: 16 }, { wch: 14 }
    ];
    XLSX.utils.book_append_sheet(wb, ws2, 'Detalle Ventas');
  }

  XLSX.writeFile(wb, `reporte_ventas_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Exporta compras con sus detalles en dos hojas separadas.
 */
export const exportComprasExcel = (compras) => {
  const wb = XLSX.utils.book_new();

  // Hoja 1: Cabeceras de compras
  const comprasRows = compras.map(c => ({
    'ID': c.id,
    'Fecha': c.fecha,
    'Proveedor': c.proveedor?.nombre ?? '—',
    'Comprobante': `${c.tipoComprobante ?? ''} ${c.numeroComprobante ?? ''}`.trim() || '—',
    'Total (S/)': c.detalles?.reduce((s, d) => s + Number(d.subtotal ?? 0), 0).toFixed(2) ?? '0.00'
  }));

  const ws1 = XLSX.utils.json_to_sheet(comprasRows);
  ws1['!cols'] = [{ wch: 6 }, { wch: 12 }, { wch: 25 }, { wch: 22 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws1, 'Compras');

  // Hoja 2: Detalles de compras
  const detallesRows = [];
  compras.forEach(c => {
    c.detalles?.forEach(d => {
      detallesRows.push({
        'Compra ID': c.id,
        'Fecha': c.fecha,
        'Proveedor': c.proveedor?.nombre ?? '—',
        'Material': d.material?.nombre ?? '—',
        'Unidad': d.material?.unidad ?? '—',
        'Cantidad': Number(d.cantidad).toFixed(2),
        'P. Unitario (S/)': Number(d.precioUnitario).toFixed(2),
        'Subtotal (S/)': Number(d.subtotal).toFixed(2),
      });
    });
  });

  if (detallesRows.length > 0) {
    const ws2 = XLSX.utils.json_to_sheet(detallesRows);
    ws2['!cols'] = [
      { wch: 9 }, { wch: 12 }, { wch: 22 }, { wch: 22 },
      { wch: 10 }, { wch: 10 }, { wch: 16 }, { wch: 14 }
    ];
    XLSX.utils.book_append_sheet(wb, ws2, 'Detalle Compras');
  }

  XLSX.writeFile(wb, `reporte_compras_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Exporta movimientos de caja.
 */
export const exportMovimientosExcel = (movimientos) => {
  const rows = movimientos.map(m => ({
    'ID': m.id,
    'Fecha': m.fecha,
    'Tipo': m.tipo,
    'Descripción': m.descripcion ?? '—',
    'Método': m.cuenta ?? '—',
    'Monto (S/)': Number(m.monto).toFixed(2),
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 6 }, { wch: 12 }, { wch: 10 }, { wch: 40 }, { wch: 14 }, { wch: 12 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Movimientos');
  XLSX.writeFile(wb, `reporte_movimientos_${new Date().toISOString().split('T')[0]}.xlsx`);
};
