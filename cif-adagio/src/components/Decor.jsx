// Elemento decorativo: la línea de barra (usada en recibos y en el asistente
// de clase de prueba).

export const Barre = ({ className = "" }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <div className="barre-line" />
    <span className="absolute h-1.5 w-1.5 rotate-45" style={{ backgroundColor: "var(--color-bronze)" }} />
  </div>
);
