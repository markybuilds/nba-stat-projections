-- Add new email notification settings columns to users table
-- This migration adds more granular control over email notifications

-- Add email_notification_types column (JSON)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS email_notification_types JSONB DEFAULT '{"system": true, "alert": true, "info": true, "update": true}';

-- Add email_notification_digest column (boolean)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS email_notification_digest BOOLEAN DEFAULT false;

-- Add email_notification_schedule column (string)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS email_notification_schedule TEXT DEFAULT 'daily';

-- Add comments for documentation
COMMENT ON COLUMN public.users.email_notification_types IS 'Types of notifications to send via email (system, alert, info, update)';
COMMENT ON COLUMN public.users.email_notification_digest IS 'Whether to send notifications as a daily digest instead of immediately';
COMMENT ON COLUMN public.users.email_notification_schedule IS 'When to send notification digests: daily, weekly, or time of day';

-- Create a function that will handle sending notification digests
CREATE OR REPLACE FUNCTION public.get_users_for_notification_digest(schedule_type TEXT)
RETURNS TABLE (user_id UUID, email TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email
  FROM public.users u
  WHERE u.email_notifications = true
    AND u.email_notification_digest = true
    AND u.email_notification_schedule = schedule_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get pending digest notifications for a user
CREATE OR REPLACE FUNCTION public.get_pending_digest_notifications(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  message TEXT,
  type TEXT,
  data JSONB,
  url TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.title,
    n.message,
    n.type,
    n.data,
    n.url,
    n.created_at
  FROM public.notifications n
  WHERE n.user_id = user_uuid
    AND n.read = false
    AND n.created_at > (CURRENT_TIMESTAMP - INTERVAL '24 hours');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 