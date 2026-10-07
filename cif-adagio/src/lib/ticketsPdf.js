import QRCode from "qrcode";
import { paymentMethodInfo } from "./constants";
import { usd } from "./format";
import { seatSection, ticketQrPayload } from "./tickets";

// jsPDF es pesado y solo lo necesita quien descarga sus entradas — se carga
// recién en ese momento, no en el bundle principal.
async function loadJsPDF() {
  const { jsPDF } = await import("jspdf");
  return jsPDF;
}

const showDateLabel = (show) => {
  if (!show?.date) return "";
  const d = new Date(`${show.date}T00:00:00`);
  const str = d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  return show.time ? `${str} · ${show.time}` : str;
};

const slugify = (str) =>
  (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * Genera un PDF real (no depende del diálogo de impresión del navegador,
 * que en varios celulares no deja nada descargado) con — si hay más de un
 * asiento — una página de recibo con todos los asientos juntos, seguida de
 * una página por cada entrada con su código QR. Lo descarga directo.
 */
export async function downloadTicketsPdf(tickets, show) {
  if (!tickets || tickets.length === 0) return;

  const JsPDF = await loadJsPDF();
  const doc = new JsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 56;
  let usedFirstPage = false;
  const nextPage = () => {
    if (usedFirstPage) doc.addPage();
    usedFirstPage = true;
  };

  if (tickets.length > 1) {
    nextPage();
    const first = tickets[0];
    const sorted = tickets.slice().sort((a, b) => (a.row === b.row ? a.seat - b.seat : a.row.localeCompare(b.row)));
    const total = tickets.reduce((s, t) => s + (t.price || 0), 0);

    let y = 72;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("CIF Adagio", pageWidth / 2, y, { align: "center" });
    y += 22;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(show?.title || "Función", pageWidth / 2, y, { align: "center" });
    y += 36;

    doc.setFontSize(11);
    doc.text(`Comprador: ${first.buyerName || ""}`, marginX, y); y += 16;
    doc.text(`Fecha: ${first.date || ""}`, marginX, y); y += 16;
    doc.text(`Método: ${paymentMethodInfo(first.method).label}`, marginX, y); y += 16;
    if (first.reference) { doc.text(`Referencia: ${first.reference}`, marginX, y); y += 16; }
    y += 12;

    doc.setDrawColor(210);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 20;

    doc.setFontSize(11);
    sorted.forEach((t) => {
      doc.text(`Fila ${t.row} · Asiento ${t.seat} (${seatSection(t.seat)})`, marginX, y);
      doc.text(usd(t.price), pageWidth - marginX, y, { align: "right" });
      y += 20;
    });

    y += 6;
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 22;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(`Total · ${tickets.length} asientos`, marginX, y);
    doc.text(usd(total), pageWidth - marginX, y, { align: "right" });
  }

  for (const t of tickets) {
    nextPage();
    const qr = await QRCode.toDataURL(ticketQrPayload(t.id), { width: 480, margin: 1, color: { dark: "#2B3238", light: "#FFFFFF" } });

    let y = 90;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("CIF Adagio", pageWidth / 2, y, { align: "center" });
    y += 28;
    doc.setFontSize(14);
    doc.text(show?.title || "Función", pageWidth / 2, y, { align: "center" });
    y += 20;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(showDateLabel(show), pageWidth / 2, y, { align: "center" });
    y += 50;

    const qrSize = 220;
    doc.addImage(qr, "PNG", (pageWidth - qrSize) / 2, y, qrSize, qrSize);
    y += qrSize + 44;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`Fila ${t.row} · Asiento ${t.seat}`, pageWidth / 2, y, { align: "center" });
    y += 20;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`${seatSection(t.seat)} · ${usd(t.price)}`, pageWidth / 2, y, { align: "center" });

    if (t.confirmed === false) {
      y += 26;
      doc.setTextColor(170, 110, 20);
      doc.text("Pago por confirmar", pageWidth / 2, y, { align: "center" });
      doc.setTextColor(0, 0, 0);
    }
  }

  const name = slugify(show?.title) || "cif-adagio";
  doc.save(`entradas-${name}.pdf`);
}
