export type VideoEmbed =
  | { type: "youtube"; embedUrl: string }
  | { type: "vimeo"; embedUrl: string }
  | { type: "file"; url: string };

const YOUTUBE_PATTERN =
  /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
const VIMEO_PATTERN = /vimeo\.com\/(?:video\/)?(\d+)/;

// Detecta si el enlace guardado es de YouTube o Vimeo (que necesitan un
// reproductor embebido) o un archivo de video directo (mp4, HLS, etc. servido
// por Bunny Stream, Mux o un CDN propio, que sí funciona con <video>).
//
// Para YouTube reducimos al mínimo la marca visible: sin vídeos
// relacionados de otros canales, sin anotaciones, y "modestbranding" quita
// el logo de YouTube de la barra de controles. Aun así el iframe sigue
// siendo técnicamente de youtube-nocookie.com (se nota si alguien inspecciona
// la página o usa pantalla completa nativa) — YouTube no ofrece una forma de
// ocultarlo del todo en el plan gratuito.
export function resolveVideoEmbed(url: string): VideoEmbed {
  const youtubeMatch = url.match(YOUTUBE_PATTERN);
  if (youtubeMatch) {
    const params = new URLSearchParams({
      rel: "0",
      cc_load_policy: "1",
      modestbranding: "1",
      iv_load_policy: "3",
      playsinline: "1",
    });
    return {
      type: "youtube",
      embedUrl: `https://www.youtube-nocookie.com/embed/${youtubeMatch[1]}?${params}`,
    };
  }

  const vimeoMatch = url.match(VIMEO_PATTERN);
  if (vimeoMatch) {
    return { type: "vimeo", embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  }

  return { type: "file", url };
}
