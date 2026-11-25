// Detecta si la página se abrió dentro del navegador "de adentro" de
// Instagram, Facebook/Messenger, TikTok, Line o Twitter/X — esos
// navegadores vienen recortados (bloquean descargas, ventanas nuevas,
// etc.) y son la causa más común de que alguien no pueda descargar su PDF
// de entradas. La única solución real es que esa persona lo abra en su
// navegador normal (Safari/Chrome) — no hay forma de arreglarlo desde el
// código de la app, por eso solo avisamos y facilitamos copiar el enlace.
export function isInAppBrowser() {
  const ua = navigator.userAgent || "";
  return /Instagram|FBAN|FBAV|FB_IAB|Line\/|TikTok|BytedanceWebview|Twitter/i.test(ua);
}
