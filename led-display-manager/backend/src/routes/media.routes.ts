import { Router } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { supabase } from '../index';
import { vnnoxService } from '../services/vnnox.service';
import { logger } from '../utils/logger';
import path from 'path';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800') // 50MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/mpeg'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// All routes require authentication
router.use(authMiddleware);

// Get all media for user
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    logger.error('Failed to fetch media:', error);
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

// Upload media
router.post('/upload', upload.single('file'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const fileExt = path.extname(req.file.originalname);
    const fileName = `${req.user!.id}/${Date.now()}${fileExt}`;
    
    let processedBuffer = req.file.buffer;
    let metadata: any = {
      mime_type: req.file.mimetype,
      file_size: req.file.size
    };

    // Process images
    if (req.file.mimetype.startsWith('image/')) {
      const image = sharp(req.file.buffer);
      const imageMetadata = await image.metadata();
      
      metadata.width = imageMetadata.width;
      metadata.height = imageMetadata.height;

      // Optimize image if needed
      if (imageMetadata.width && imageMetadata.width > 1920) {
        processedBuffer = await image
          .resize(1920, null, { withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toBuffer();
      }

      // Generate thumbnail
      const thumbnailBuffer = await image
        .resize(300, 300, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toBuffer();

      // Upload thumbnail
      const { error: thumbError } = await supabase.storage
        .from('media')
        .upload(`${fileName}-thumb.jpg`, thumbnailBuffer, {
          contentType: 'image/jpeg'
        });

      if (!thumbError) {
        const { data: { publicUrl: thumbUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(`${fileName}-thumb.jpg`);
        
        metadata.thumbnail_url = thumbUrl;
      }
    }

    // Upload main file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('media')
      .upload(fileName, processedBuffer, {
        contentType: req.file.mimetype
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(fileName);

    // Save to database
    const { data: mediaRecord, error: dbError } = await supabase
      .from('media')
      .insert({
        user_id: req.user!.id,
        file_name: req.file.originalname,
        file_url: publicUrl,
        ...metadata
      })
      .select()
      .single();

    if (dbError) {
      throw dbError;
    }

    res.json(mediaRecord);
  } catch (error) {
    logger.error('Failed to upload media:', error);
    res.status(500).json({ error: 'Failed to upload media' });
  }
});

// Delete media
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    // Get media record
    const { data: media, error: fetchError } = await supabase
      .from('media')
      .select('file_url, thumbnail_url')
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: 'Media not found' });
    }

    // Extract file paths from URLs
    const fileUrl = new URL(media.file_url);
    const filePath = fileUrl.pathname.split('/').slice(-2).join('/');

    // Delete from storage
    await supabase.storage
      .from('media')
      .remove([filePath]);

    if (media.thumbnail_url) {
      const thumbUrl = new URL(media.thumbnail_url);
      const thumbPath = thumbUrl.pathname.split('/').slice(-2).join('/');
      await supabase.storage
        .from('media')
        .remove([thumbPath]);
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('media')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id);

    if (deleteError) {
      throw deleteError;
    }

    res.status(204).send();
  } catch (error) {
    logger.error('Failed to delete media:', error);
    res.status(500).json({ error: 'Failed to delete media' });
  }
});

// Publish media to display
router.post('/:mediaId/publish/:displayId', async (req: AuthRequest, res) => {
  try {
    // Verify media ownership
    const { data: media, error: mediaError } = await supabase
      .from('media')
      .select('*')
      .eq('id', req.params.mediaId)
      .eq('user_id', req.user!.id)
      .single();

    if (mediaError) {
      return res.status(404).json({ error: 'Media not found' });
    }

    // Verify display ownership
    const { data: display, error: displayError } = await supabase
      .from('displays')
      .select('vnnox_terminal_id')
      .eq('id', req.params.displayId)
      .eq('user_id', req.user!.id)
      .single();

    if (displayError) {
      return res.status(404).json({ error: 'Display not found' });
    }

    // Upload to VNNOX
    const result = await vnnoxService.uploadMedia(
      display.vnnox_terminal_id,
      media.file_url,
      {
        name: media.file_name,
        width: media.width,
        height: media.height,
        duration: media.duration
      }
    );

    // Publish content
    if (result.data.contentId) {
      await vnnoxService.publishContent(display.vnnox_terminal_id, result.data.contentId);
    }

    res.json({ success: true, vnnoxResponse: result });
  } catch (error) {
    logger.error('Failed to publish media:', error);
    res.status(500).json({ error: 'Failed to publish media' });
  }
});

export default router;