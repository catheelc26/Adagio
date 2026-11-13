// Comprime una imagen (foto de estudiante o comprobante de pago) antes de subirla,
// para que ocupe poco espacio en la base de datos.
export function compressImage(file, maxWidth = 900, quality = 0.6) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        // JPEG no tiene canal de transparencia — si no se rellena primero un
        // fondo blanco, cualquier parte transparente del original (o que por
        // algún motivo no se dibuje bien, ej. algunas fotos HEIC de iPhone)
        // se exporta como NEGRO sólido en vez de blanco. Esto es lo que hacía
        // que algunos comprobantes de pago se vieran completamente negros.
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
