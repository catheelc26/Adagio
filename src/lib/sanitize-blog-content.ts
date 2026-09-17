import sanitizeHtml from "sanitize-html";

// El contenido del blog lo escribe únicamente la administradora con el
// editor de texto enriquecido — igual filtramos antes de mostrarlo, para
// no depender de que el HTML que guarda el editor sea siempre perfecto.
export function sanitizeBlogContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ["p", "br", "strong", "em", "h2", "h3", "ul", "ol", "li"],
    allowedAttributes: {},
  });
}
