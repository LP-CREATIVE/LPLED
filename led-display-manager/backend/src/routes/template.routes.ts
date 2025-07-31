import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { supabase } from '../index';
import { logger } from '../utils/logger';

const router = Router();

// Public route - get all public templates
router.get('/public', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    logger.error('Failed to fetch public templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// All routes below require authentication
router.use(authMiddleware);

// Get user's templates
router.get('/my', async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('created_by', req.user!.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    logger.error('Failed to fetch user templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Get single template
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('id', req.params.id)
      .or(`is_public.eq.true,created_by.eq.${req.user!.id}`)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(data);
  } catch (error) {
    logger.error('Failed to fetch template:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

// Create template
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { name, description, category, previewUrl, templateData, isPublic } = req.body;

    const { data, error } = await supabase
      .from('templates')
      .insert({
        name,
        description,
        category,
        preview_url: previewUrl,
        template_data: templateData,
        is_public: isPublic || false,
        created_by: req.user!.id
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json(data);
  } catch (error) {
    logger.error('Failed to create template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// Update template
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { name, description, category, previewUrl, templateData, isPublic } = req.body;

    const { data, error } = await supabase
      .from('templates')
      .update({
        name,
        description,
        category,
        preview_url: previewUrl,
        template_data: templateData,
        is_public: isPublic
      })
      .eq('id', req.params.id)
      .eq('created_by', req.user!.id)
      .select()
      .single();

    if (error) {
      return res.status(404).json({ error: 'Template not found or not authorized' });
    }

    res.json(data);
  } catch (error) {
    logger.error('Failed to update template:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// Delete template
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', req.params.id)
      .eq('created_by', req.user!.id);

    if (error) {
      return res.status(404).json({ error: 'Template not found or not authorized' });
    }

    res.status(204).send();
  } catch (error) {
    logger.error('Failed to delete template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

// Get template categories
router.get('/categories/list', async (req, res) => {
  try {
    const categories = [
      { id: 'announcement', name: 'Announcements', icon: 'megaphone' },
      { id: 'promotion', name: 'Promotions', icon: 'tag' },
      { id: 'welcome', name: 'Welcome Messages', icon: 'hand-wave' },
      { id: 'holiday', name: 'Holiday Greetings', icon: 'calendar' },
      { id: 'menu', name: 'Menu Boards', icon: 'utensils' },
      { id: 'event', name: 'Events', icon: 'calendar-star' },
      { id: 'social', name: 'Social Media', icon: 'share' },
      { id: 'custom', name: 'Custom', icon: 'palette' }
    ];

    res.json(categories);
  } catch (error) {
    logger.error('Failed to fetch categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export default router;