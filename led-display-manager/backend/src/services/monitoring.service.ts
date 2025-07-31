import { vnnoxService } from './vnnox.service';
import { supabase } from '../index';
import { logger } from '../utils/logger';

export class MonitoringService {
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();

  async startMonitoring(displayId: string) {
    // Clear existing interval if any
    this.stopMonitoring(displayId);

    // Poll every 30 seconds
    const interval = setInterval(async () => {
      try {
        await this.checkDisplayStatus(displayId);
      } catch (error) {
        logger.error(`Failed to check status for display ${displayId}:`, error);
      }
    }, 30000);

    this.pollingIntervals.set(displayId, interval);
    
    // Check immediately
    this.checkDisplayStatus(displayId);
  }

  stopMonitoring(displayId: string) {
    const interval = this.pollingIntervals.get(displayId);
    if (interval) {
      clearInterval(interval);
      this.pollingIntervals.delete(displayId);
    }
  }

  async checkDisplayStatus(displayId: string) {
    try {
      // Get display from database
      const { data: display, error } = await supabase
        .from('displays')
        .select('vnnox_terminal_id')
        .eq('id', displayId)
        .single();

      if (error || !display) {
        throw new Error('Display not found');
      }

      // Get status from VNNOX
      const statusResponse = await vnnoxService.getTerminalStatus(display.vnnox_terminal_id);
      
      const status = statusResponse.code === 0 && statusResponse.data?.online 
        ? 'online' 
        : 'offline';

      // Update database
      await supabase
        .from('displays')
        .update({
          status,
          last_seen: status === 'online' ? new Date().toISOString() : undefined
        })
        .eq('id', displayId);

      // If display has schedules, check if content needs to be updated
      if (status === 'online') {
        await this.checkScheduledContent(displayId);
      }

    } catch (error) {
      logger.error(`Failed to update display status for ${displayId}:`, error);
      
      // Mark as error in database
      await supabase
        .from('displays')
        .update({ status: 'error' })
        .eq('id', displayId);
    }
  }

  private async checkScheduledContent(displayId: string) {
    try {
      const now = new Date();
      
      // Get active schedules for this display
      const { data: schedules, error } = await supabase
        .from('content_schedules')
        .select('*')
        .eq('display_id', displayId)
        .eq('is_active', true)
        .lte('start_time', now.toISOString())
        .or(`end_time.is.null,end_time.gte.${now.toISOString()}`);

      if (error || !schedules || schedules.length === 0) {
        return;
      }

      // Check if today matches repeat days
      const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const activeSchedule = schedules.find(schedule => {
        if (!schedule.repeat_days || schedule.repeat_days.length === 0) {
          return true; // No repeat days means always active
        }
        return schedule.repeat_days.includes(dayOfWeek);
      });

      if (activeSchedule) {
        // Get display info
        const { data: display } = await supabase
          .from('displays')
          .select('vnnox_terminal_id')
          .eq('id', displayId)
          .single();

        if (display) {
          // Check what's currently playing
          const currentContent = await vnnoxService.getPlayingContent(display.vnnox_terminal_id);
          
          // If different from scheduled content, update it
          if (currentContent.data?.contentId !== activeSchedule.content_id) {
            await vnnoxService.publishContent(display.vnnox_terminal_id, activeSchedule.content_id);
            logger.info(`Updated content on display ${displayId} to scheduled content ${activeSchedule.content_id}`);
          }
        }
      }
    } catch (error) {
      logger.error(`Failed to check scheduled content for display ${displayId}:`, error);
    }
  }

  // Start monitoring all displays for a user
  async startUserDisplayMonitoring(userId: string) {
    try {
      const { data: displays, error } = await supabase
        .from('displays')
        .select('id')
        .eq('user_id', userId);

      if (error || !displays) {
        return;
      }

      displays.forEach(display => {
        this.startMonitoring(display.id);
      });
    } catch (error) {
      logger.error(`Failed to start monitoring for user ${userId}:`, error);
    }
  }

  // Stop all monitoring
  stopAllMonitoring() {
    this.pollingIntervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.pollingIntervals.clear();
  }
}

export const monitoringService = new MonitoringService();