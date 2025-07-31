import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { supabase } from '../index';
import { logger } from '../utils/logger';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get schedules for a display
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { displayId } = req.query;

    if (!displayId) {
      return res.status(400).json({ error: 'Display ID is required' });
    }

    // Verify display ownership
    const { data: display, error: displayError } = await supabase
      .from('displays')
      .select('id')
      .eq('id', displayId)
      .eq('user_id', req.user!.id)
      .single();

    if (displayError || !display) {
      return res.status(404).json({ error: 'Display not found' });
    }

    // Get schedules
    const { data, error } = await supabase
      .from('content_schedules')
      .select('*')
      .eq('display_id', displayId)
      .order('start_time', { ascending: true });

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    logger.error('Failed to fetch schedules:', error);
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

// Create schedule
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { displayId, contentType, contentId, startTime, endTime, repeatDays } = req.body;

    // Verify display ownership
    const { data: display, error: displayError } = await supabase
      .from('displays')
      .select('id')
      .eq('id', displayId)
      .eq('user_id', req.user!.id)
      .single();

    if (displayError || !display) {
      return res.status(404).json({ error: 'Display not found' });
    }

    // Create schedule
    const { data, error } = await supabase
      .from('content_schedules')
      .insert({
        display_id: displayId,
        content_type: contentType,
        content_id: contentId,
        start_time: startTime,
        end_time: endTime,
        repeat_days: repeatDays,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json(data);
  } catch (error) {
    logger.error('Failed to create schedule:', error);
    res.status(500).json({ error: 'Failed to create schedule' });
  }
});

// Update schedule
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { startTime, endTime, repeatDays, isActive } = req.body;

    // Verify ownership through display
    const { data: schedule, error: fetchError } = await supabase
      .from('content_schedules')
      .select('display_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    const { data: display, error: displayError } = await supabase
      .from('displays')
      .select('id')
      .eq('id', schedule.display_id)
      .eq('user_id', req.user!.id)
      .single();

    if (displayError || !display) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Update schedule
    const { data, error } = await supabase
      .from('content_schedules')
      .update({
        start_time: startTime,
        end_time: endTime,
        repeat_days: repeatDays,
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    logger.error('Failed to update schedule:', error);
    res.status(500).json({ error: 'Failed to update schedule' });
  }
});

// Delete schedule
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Verify ownership through display
    const { data: schedule, error: fetchError } = await supabase
      .from('content_schedules')
      .select('display_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    const { data: display, error: displayError } = await supabase
      .from('displays')
      .select('id')
      .eq('id', schedule.display_id)
      .eq('user_id', req.user!.id)
      .single();

    if (displayError || !display) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Delete schedule
    const { error } = await supabase
      .from('content_schedules')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.status(204).send();
  } catch (error) {
    logger.error('Failed to delete schedule:', error);
    res.status(500).json({ error: 'Failed to delete schedule' });
  }
});

export default router;