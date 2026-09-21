// Mapa de butacas del teatro: 16 filas (A a la Ñ, y luego la O — la más
// alejada del escenario) de 21 asientos cada una. Los asientos se numeran de
// forma continua a lo ancho de la sala (no reinician por sección); las
// columnas 8 a 14 son la sección central ($12), el resto son laterales
// ($10) — el precio depende solo del número de asiento, sin importar la
// fila. La fila O tiene los pasillos corridos un puesto hacia cada lado
// (asientos 1–8 / 9–13 / 14–21 en vez de 1–7 / 8–14 / 15–21): el mismo total
// de 21 asientos, solo cambia dónde caen los pasillos visualmente.
export const THEATER_ROW_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "Ñ", "O"];
export const THEATER_SEATS = Array.from({ length: 21 }, (_, i) => i + 1);
export const BACK_ROW = "O";

export const CENTER_SEAT_MIN = 8;
export const CENTER_SEAT_MAX = 14;
export const CENTER_PRICE = 12;
export const SIDE_PRICE = 10;

export const isCenterSeat = (seat) => seat >= CENTER_SEAT_MIN && seat <= CENTER_SEAT_MAX;
export const seatPrice = (seat) => (isCenterSeat(seat) ? CENTER_PRICE : SIDE_PRICE);
export const seatSection = (seat) => (isCenterSeat(seat) ? "Centro" : "Lateral");
export const seatKey = (row, seat) => `${row}${seat}`;
export const seatLabel = (row, seat) => `Fila ${row} · Asiento ${seat}`;

// Agrupación visual (pasillos entre bloques) por fila — distinta solo para
// la fila O, que está corrida un puesto hacia cada lado respecto al resto.
export const seatGroupsForRow = (row) => (row === BACK_ROW ? [[1, 8], [9, 13], [14, 21]] : [[1, 7], [8, 14], [15, 21]]);

export const isSeatTaken = (tickets, showId, row, seat) =>
  tickets.some((t) => t.showId === showId && t.row === row && t.seat === seat);

export const ticketsForShow = (tickets, showId) => tickets.filter((t) => t.showId === showId);

export const showLabel = (show) => {
  if (!show) return "";
  const d = new Date(`${show.date}T00:00:00`);
  const dateStr = d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return `${show.title} — ${dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}${show.time ? `, ${show.time}` : ""}`;
};
