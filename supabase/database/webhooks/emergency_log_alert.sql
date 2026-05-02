CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.notify_emergency()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://nbfgochqhvnislhdrpzd.supabase.co/functions/v1/send-alert',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object('record', row_to_json(NEW))
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS emergency_log_alert ON public.emergency_logs;

CREATE TRIGGER emergency_log_alert
AFTER INSERT ON public.emergency_logs
FOR EACH ROW EXECUTE FUNCTION public.notify_emergency();
