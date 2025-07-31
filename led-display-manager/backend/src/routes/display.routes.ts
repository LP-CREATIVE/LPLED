import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { supabase } from '../index';
import { vnnoxService } from '../services/vnnox.service';
import { logger } from '../utils/logger';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get all displays for authenticated user
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabase
      .from('displays')
      .select('*')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    logger.error('Failed to fetch displays:', error);
    res.status(500).json({ error: 'Failed to fetch displays' });
  }
});

// Get single display
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabase
      .from('displays')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Display not found' });
    }

    // Get real-time status from VNNOX
    try {
      const status = await vnnoxService.getTerminalStatus(data.vnnox_terminal_id);
      data.realTimeStatus = status.data;
    } catch (vnnoxError) {
      logger.error('Failed to fetch VNNOX status:', vnnoxError);
    }

    res.json(data);
  } catch (error) {
    logger.error('Failed to fetch display:', error);
    res.status(500).json({ error: 'Failed to fetch display' });
  }
});

// Create new display
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { displayName, vnnoxTerminalId, vnnoxSecret, location } = req.body;

    // Verify terminal exists in VNNOX
    try {
      await vnnoxService.getTerminalInfo(vnnoxTerminalId);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid VNNOX terminal ID' });
    }

    const { data, error } = await supabase
      .from('displays')
      .insert({
        user_id: req.user!.id,
        display_name: displayName,
        vnnox_terminal_id: vnnoxTerminalId,
        vnnox_secret: vnnoxSecret,
        location
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json(data);
  } catch (error) {
    logger.error('Failed to create display:', error);
    res.status(500).json({ error: 'Failed to create display' });
  }
});

// Update display
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { displayName, location } = req.body;

    const { data, error } = await supabase
      .from('displays')
      .update({
        display_name: displayName,
        location,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id)
      .select()
      .single();

    if (error) {
      return res.status(404).json({ error: 'Display not found' });
    }

    res.json(data);
  } catch (error) {
    logger.error('Failed to update display:', error);
    res.status(500).json({ error: 'Failed to update display' });
  }
});

// Delete display
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { error } = await supabase
      .from('displays')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id);

    if (error) {
      return res.status(404).json({ error: 'Display not found' });
    }

    res.status(204).send();
  } catch (error) {
    logger.error('Failed to delete display:', error);
    res.status(500).json({ error: 'Failed to delete display' });
  }
});

// Control endpoints
router.post('/:id/brightness', async (req: AuthRequest, res) => {
  try {
    const { brightness } = req.body;

    // Get display
    const { data: display, error } = await supabase
      .from('displays')
      .select('vnnox_terminal_id')
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Display not found' });
    }

    // Set brightness via VNNOX
    const result = await vnnoxService.setScreenBrightness(display.vnnox_terminal_id, brightness);

    res.json(result);
  } catch (error) {
    logger.error('Failed to set brightness:', error);
    res.status(500).json({ error: 'Failed to set brightness' });
  }
});

router.post('/:id/volume', async (req: AuthRequest, res) => {
  try {
    const { volume } = req.body;

    // Get display
    const { data: display, error } = await supabase
      .from('displays')
      .select('vnnox_terminal_id')
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Display not found' });
    }

    // Set volume via VNNOX
    const result = await vnnoxService.setVolume(display.vnnox_terminal_id, volume);

    res.json(result);
  } catch (error) {
    logger.error('Failed to set volume:', error);
    res.status(500).json({ error: 'Failed to set volume' });
  }
});

router.post('/:id/power', async (req: AuthRequest, res) => {
  try {
    const { power } = req.body;

    // Get display
    const { data: display, error } = await supabase
      .from('displays')
      .select('vnnox_terminal_id')
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Display not found' });
    }

    // Control power via VNNOX
    const result = await vnnoxService.screenPower(display.vnnox_terminal_id, power);

    res.json(result);
  } catch (error) {
    logger.error('Failed to control power:', error);
    res.status(500).json({ error: 'Failed to control power' });
  }
});

router.post('/:id/reboot', async (req: AuthRequest, res) => {
  try {
    // Get display
    const { data: display, error } = await supabase
      .from('displays')
      .select('vnnox_terminal_id')
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Display not found' });
    }

    // Reboot via VNNOX
    const result = await vnnoxService.rebootTerminal(display.vnnox_terminal_id);

    res.json(result);
  } catch (error) {
    logger.error('Failed to reboot display:', error);
    res.status(500).json({ error: 'Failed to reboot display' });
  }
});

export default router;