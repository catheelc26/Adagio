// Botón "sin código" generado desde PayPal (Pagos del sitio web → Botones de
// pago → Botón único). Es un simple formulario HTML que abre la página de
// pago alojada por PayPal — no necesita el SDK de JavaScript de PayPal.
export function PaypalNcpButton({ buttonId }: { buttonId: string }) {
  return (
    <form
      action={`https://www.paypal.com/ncp/payment/${buttonId}`}
      method="post"
      target="_blank"
      className="grid justify-items-center gap-2"
    >
      <button
        type="submit"
        className="w-full rounded-full bg-gold px-6 py-3 text-sm font-medium text-navy-950 transition-colors hover:bg-gold-light"
      >
        Pagar ahora
      </button>
      <p className="flex items-center gap-1.5 text-[11px] text-cream-dim/45">
        <img src="https://www.paypalobjects.com/images/Debit_Credit.svg" alt="" className="h-4" />
        Con la tecnología de PayPal
      </p>
    </form>
  );
}
