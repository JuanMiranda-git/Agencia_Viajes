'use strict';

/**
 * Generacion de comprobantes PDF (reservas y ventas) con PDFKit.
 * No se almacenan archivos: el PDF se genera al momento de la descarga.
 */

const PDFDocument = require('pdfkit');

/**
 * Formatea un monto en pesos colombianos: $1.234.567
 */
function formatearCOP(monto) {
  return `$${Number(monto).toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;
}

function construirDocumento(titulo) {
  const doc = new PDFDocument({ size: 'A5', margin: 40 });
  doc.info.Title = titulo;
  doc.info.Author = 'TourManager';
  return doc;
}

function escribirEncabezado(doc, titulo) {
  doc.fontSize(18).text('TourManager', { align: 'left' });
  doc.fontSize(10).fillColor('#555555').text('Sistema de Gestion de Operaciones Turisticas');
  doc.moveDown(0.5);
  doc.fillColor('#000000').fontSize(14).text(titulo, { underline: false });
  doc.moveDown(0.8);
}

/**
 * Envia al cliente el comprobante PDF de una reserva.
 * @param {import('express').Response} res
 * @param {{numeroReserva: string, cliente: string, documento?: string, paquete: string, fechaViaje: string,
 *          numPasajeros: number, total: number, estado: string, fechaReserva: string}} datos
 */
function enviarComprobanteReserva(res, datos) {
  const doc = construirDocumento(`Comprobante de reserva ${datos.numeroReserva || ''}`);
  doc.pipe(res);

  escribirEncabezado(doc, `Comprobante de Reserva ${datos.numeroReserva || ''}`);

  doc.fontSize(11);
  doc.text(`Cliente: ${datos.cliente}`);
  if (datos.documento) doc.text(`Documento: ${datos.documento}`);
  doc.text(`Paquete: ${datos.paquete}`);
  doc.text(`Fecha de viaje: ${datos.fechaViaje}`);
  doc.text(`Numero de pasajeros: ${datos.numPasajeros}`);
  doc.text(`Estado de la reserva: ${datos.estado}`);
  doc.text(`Fecha de registro: ${datos.fechaReserva}`);
  doc.moveDown(0.8);
  doc.fontSize(14).text(`Total: ${formatearCOP(datos.total)}`, { align: 'right' });
  doc.moveDown(1.5);
  doc.fontSize(9).fillColor('#777777').text('Documento generado por TourManager. Conserva este comprobante para tus tramites.');

  doc.end();
}

/**
 * Envia al cliente el comprobante PDF de una venta.
 */
function enviarComprobanteVenta(res, datos) {
  const doc = construirDocumento(`Comprobante de pago ${datos.idVenta}`);
  doc.pipe(res);

  escribirEncabezado(doc, `Comprobante de Pago Venta #${datos.idVenta}`);

  doc.fontSize(11);
  doc.text(`Reserva: ${datos.numeroReserva || datos.idReserva}`);
  doc.text(`Cliente: ${datos.cliente}`);
  doc.text(`Paquete: ${datos.paquete}`);
  doc.text(`Fecha de venta: ${datos.fechaVenta}`);
  doc.text(`Metodo de pago: ${datos.metodoPago}`);
  doc.text(`Estado de la venta: ${datos.estadoVenta}`);
  doc.moveDown(0.8);
  doc.fontSize(14).text(`Monto: ${formatearCOP(datos.monto)}`, { align: 'right' });
  doc.moveDown(1.5);
  doc.fontSize(9).fillColor('#777777').text('Documento generado por TourManager. Gracias por su compra.');

  doc.end();
}

module.exports = { enviarComprobanteReserva, enviarComprobanteVenta, formatearCOP };
