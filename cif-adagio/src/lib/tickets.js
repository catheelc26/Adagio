// Mapa de asientos del teatro: 21 filas numeradas, 15 asientos por fila
// (A a la Ñ). Las filas 8 a 14 son la sección central ($12); el resto son
// laterales ($10).
export const THEATER_ROWS = Array.from({ length: 21 }, (_, i) => i + 1);
export const THEATER_SEAT_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "Ñ"];

export const CENTER_ROW_MIN = 8;
export const CENTER_ROW_MAX = 14;
export const CENTER_PRICE = 12;
export const SIDE_PRICE = 10;

export const isCenterRow = (row) => row >= CENTER_ROW_MIN && row <= CENTER_ROW_MAX;
export const seatPrice = (row) => (isCenterRow(row) ? CENTER_PRICE : SIDE_PRICE);
export const seatSection = (row) => (isCenterRow(row) ? "Centro" : "Lateral");
export const seatKey = (row, seat) => `${row}${seat}`;
export const seatLabel = (row, seat) => `Fila ${row} · Asiento ${seat}`;

export const isSeatTaken = (tickets, showId, row, seat) =>
  tickets.some((t) => t.showId === showId && t.row === row && t.seat === seat);

export const ticketsForShow = (tickets, showId) => tickets.filter((t) => t.showId === showId);

export const showLabel = (show) => {
  if (!show) return "";
  const d = new Date(`${show.date}T00:00:00`);
  const dateStr = d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return `${show.title} — ${dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}${show.time ? `, ${show.time}` : ""}`;
};
