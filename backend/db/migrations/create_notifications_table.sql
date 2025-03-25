-- Create notifications table with RLS policies
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('system', 'alert', 'info', 'update')),
  read BOOLEAN NOT NULL DEFAULT false,
  data JSONB,
  url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes for commonly queried fields
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON public.notifications(type);
CREATE INDEX idx_notifications_user_id_read ON public.notifications(user_id, read);

-- Add comments for better documentation
COMMENT ON TABLE public.notifications IS 'Stores user notification data';
COMMENT ON COLUMN public.notifications.id IS 'Primary identifier for notifications';
COMMENT ON COLUMN public.notifications.user_id IS 'Foreign key to auth.users';
COMMENT ON COLUMN public.notifications.title IS 'Notification title';
COMMENT ON COLUMN public.notifications.message IS 'Notification message content';
COMMENT ON COLUMN public.notifications.type IS 'Type of notification: system, alert, info, update';
COMMENT ON COLUMN public.notifications.read IS 'Whether notification has been read by user';
COMMENT ON COLUMN public.notifications.data IS 'Optional JSON data related to the notification';
COMMENT ON COLUMN public.notifications.url IS 'Optional URL to navigate to when notification is clicked';
COMMENT ON COLUMN public.notifications.created_at IS 'Timestamp of notification creation';

-- Enable RLS on the notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to update only their own notifications
CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own notifications
CREATE POLICY "Users can delete their own notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Create policy to allow system to insert notifications for any user
CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (true);

-- Create function to get unread notification count
CREATE OR REPLACE FUNCTION public.get_unread_notification_count(user_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.notifications
  WHERE user_id = user_uuid AND read = false;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Create function to mark all notifications as read
CREATE OR REPLACE FUNCTION public.mark_all_notifications_as_read(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  success BOOLEAN;
BEGIN
  UPDATE public.notifications
  SET read = true
  WHERE user_id = user_uuid AND read = false;
  
  GET DIAGNOSTICS success = ROW_COUNT;
  RETURN success > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 