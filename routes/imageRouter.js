const express = require('express');
const router = express.Router();
const multer = require('multer');
const { cloudinary } = require('../config/cloudinary');
const streamifier = require('streamifier');

// Configuración de multer para usar memoria
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Función para subir una imagen con Cloudinary desde un buffer
const streamUpload = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { 
        folder: 'matesfar-productos',
        quality: 'auto',
        transformation: [
          { width: 600, crop: 'limit' } // opcional: redimensiona si es muy grande
        ]
      },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// ✅ SUBIR UNA imagen
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const result = await streamUpload(req.file.buffer);
    res.json({ ok: true, url: result.secure_url, public_id: result.public_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error al subir imagen' });
  }
});

// ✅ SUBIR VARIAS imágenes
router.post('/upload-multiple', upload.array('images', 10), async (req, res) => {
  try {
    const results = await Promise.all(
      req.files.map((file) => streamUpload(file.buffer))
    );
    const response = results.map((r) => ({
      url: r.secure_url,
      public_id: r.public_id,
    }));
    res.json({ ok: true, images: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error al subir imágenes' });
  }
});

// ✅ ELIMINAR UNA imagen
router.delete('/:publicId', async (req, res) => {
  const { publicId } = req.params;
  console.log(publicId)
  try {
    await cloudinary.uploader.destroy(`matesfar-productos/${publicId}`);
    res.json({ ok: true, msg: 'Imagen eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error al eliminar imagen' });
  }
});

// ✅ ELIMINAR VARIAS imágenes
router.post('/delete-multiple', async (req, res) => {
  const { publicIds } = req.body; // array de public IDs
  if (!Array.isArray(publicIds) || publicIds.length === 0) {
        return res.status(400).json({ ok: false, msg: 'Debe enviar un array de public_ids' });
    }
  try {
    const results = await Promise.all(
      publicIds.map((id) => cloudinary.uploader.destroy(id))
    );
    res.json({ ok: true, msg: 'Imágenes eliminadas', results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error al eliminar imágenes' });
  }
});

module.exports = router;
