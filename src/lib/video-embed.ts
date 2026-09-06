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
export function resolveVideoEmbed(url: string): VideoEmbed {
  const youtubeMatch = url.match(YOUTUBE_PATTERN);
  if (youtubeMatch) {
    return {
      type: "youtube",
      embedUrl: `https://www.youtube-nocookie.com/embed/${youtubeMatch[1]}?rel=0&cc_load_policy=1`,
    };
  }

  const vimeoMatch = url.match(VIMEO_PATTERN);
  if (vimeoMatch) {
    return { type: "vimeo", embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  }

  return { type: "file", url };
}
