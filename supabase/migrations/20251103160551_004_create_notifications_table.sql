/*
  # Create notifications table

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - recipient
      - `type` (text) - team_approved, team_rejected, session_scheduled, attendance_reminder, home_visit_scheduled, report_ready
      - `title` (text)
      - `message` (text)
      - `related_id` (uuid) - tournament_id, team_id, session_id, etc
      - `read` (boolean)
      - `created_at` (timestamptz)
      - `sent_at` (timestamptz)

  2. Security
    - Enable RLS on notifications table
*/

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text,
  related_id uuid,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  sent_at timestamptz
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
