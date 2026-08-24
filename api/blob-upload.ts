import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const body = req.body as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      // VercelRequest exposes the same `.headers` shape handleUpload needs;
      // it doesn't read the body stream directly since `body` is passed separately.
      request: req as any,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'],
        maximumSizeInBytes: 25 * 1024 * 1024,
      }),
      onUploadCompleted: async () => {},
    });
    res.status(200).json(jsonResponse);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}
