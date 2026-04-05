import { Router } from 'express';
import { authMiddleware } from '../middleware/index.js';
import { checkPermission } from '../middleware/checkPermission.js';
import cloudinary from '../config/cloudinary.js';

const router = Router();

/**
 * GET /utils/resolve-maps?url=<google-maps-url>
 *
 * Follows redirects server-side (no CORS) and extracts lat/lng/zoom
 * from the final Google Maps URL. Accepts:
 *   - Short links:  maps.app.goo.gl/...
 *   - Full links:   google.com/maps/place/...!3d{lat}!4d{lng}
 *   - Direct @:     google.com/maps/@{lat},{lng},{zoom}z
 */
router.get('/resolve-maps', authMiddleware, async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'url query param required' });

  // Only allow Google Maps domains
  if (!/maps\.app\.goo\.gl|google\.com\/maps|goo\.gl\/maps/i.test(url)) {
    return res.status(400).json({ error: 'URL must be a Google Maps link' });
  }

  // Try extracting directly from the URL first (works for full links with coords)
  const direct = extractCoords(url);
  if (direct) return res.json({ ...direct, resolvedUrl: url });

  // Short links need server-side redirect following — use GET (HEAD doesn't resolve correctly)
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9',
      },
      signal: AbortSignal.timeout(10000),
    });

    const finalUrl = response.url;
    const coords = extractCoords(finalUrl);

    if (!coords) {
      return res.status(422).json({ error: 'Could not extract coordinates from resolved URL', resolvedUrl: finalUrl });
    }

    return res.json({ ...coords, resolvedUrl: finalUrl });
  } catch (err) {
    return res.status(502).json({ error: 'Failed to resolve URL', detail: err.message });
  }
});

router.get('/media', authMiddleware, checkPermission('gallery', 'read'), async (req, res) => {
  const folder = String(req.query.folder || '').trim().replace(/^\/+|\/+$/g, '');
  const maxResults = Math.min(Math.max(parseInt(req.query.max_results, 10) || 30, 1), 100);
  const nextCursor = req.query.next_cursor ? String(req.query.next_cursor) : undefined;

  try {
    const prefix = folder ? `instituto-milhomem/${folder}` : 'instituto-milhomem/';
    const response = await cloudinary.api.resources({
      type: 'upload',
      resource_type: 'image',
      prefix,
      max_results: maxResults,
      next_cursor: nextCursor,
    });

    const resources = Array.isArray(response.resources)
      ? response.resources.map((item) => ({
          asset_id: item.asset_id,
          public_id: item.public_id,
          format: item.format,
          width: item.width,
          height: item.height,
          bytes: item.bytes,
          created_at: item.created_at,
          folder: item.folder,
          secure_url: item.secure_url,
          thumbnail_url: cloudinary.url(item.public_id, {
            secure: true,
            width: 320,
            height: 240,
            crop: 'fill',
            quality: 'auto',
            fetch_format: 'auto',
          }),
        }))
      : [];

    res.json({
      resources,
      next_cursor: response.next_cursor || null,
      total_count: resources.length,
      source: 'cloudinary',
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar arquivos do Cloudinary', detail: error.message });
  }
});

router.delete('/media', authMiddleware, checkPermission('gallery', 'delete'), async (req, res) => {
  const publicId = String(req.query.public_id || req.body?.public_id || '').trim();
  if (!publicId) return res.status(400).json({ error: 'public_id is required' });

  // Security: only allow deleting from our own Cloudinary folder
  if (!publicId.startsWith('instituto-milhomem/')) {
    return res.status(403).json({ error: 'Cannot delete assets outside of instituto-milhomem folder' });
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    if (result.result === 'ok' || result.result === 'not found') {
      return res.json({ success: true, result: result.result });
    }
    return res.status(500).json({ error: 'Cloudinary returned unexpected result', detail: result.result });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao deletar arquivo do Cloudinary', detail: error.message });
  }
});

function extractCoords(url = '') {
  // Format: /maps/@lat,lng,{zoom}z
  const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+),(\d+(?:\.\d+)?)z/);
  if (atMatch) return { lat: atMatch[1], lng: atMatch[2], zoom: Math.round(parseFloat(atMatch[3])).toString() };

  // Format: !3d{lat}!4d{lng} (place URLs)
  const dMatch = url.match(/!3d(-?\d+\.\d+).*?!4d(-?\d+\.\d+)/);
  if (dMatch) return { lat: dMatch[1], lng: dMatch[2], zoom: null };

  // Format: ?q=lat,lng
  const qMatch = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (qMatch) return { lat: qMatch[1], lng: qMatch[2], zoom: null };

  return null;
}

export default router;
