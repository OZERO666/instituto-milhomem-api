import { Router } from 'express';
import { authMiddleware } from '../middleware/index.js';

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

  try {
    // Follow all redirects to get the final URL
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(8000),
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
