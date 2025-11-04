/*
  # Create coaching management tables

  1. New Tables
    - `student_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - student user reference
      - `date_of_birth` (date)
      - `guardian_name` (text)
      - `guardian_contact` (text)
      - `address` (text)
      - `emergency_contact` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `coaching_sessions`
      - `id` (uuid, primary key)
      - `coach_id` (uuid) - coach user reference
      - `title` (text)
      - `description` (text)
      - `scheduled_date` (timestamptz)
      - `duration_minutes` (integer)
      - `location` (text)
      - `max_attendees` (integer)
      - `status` (text) - scheduled, in_progress, completed, cancelled
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `session_attendance`
      - `id` (uuid, primary key)
      - `session_id` (uuid) - coaching session
      - `student_id` (uuid) - student
      - `attended` (boolean)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `home_visits`
      - `id` (uuid, primary key)
      - `coach_id` (uuid)
      - `student_id` (uuid)
      - `visit_date` (timestamptz)
      - `duration_minutes` (integer)
      - `notes` (text)
      - `progress_update` (text)
      - `created_at` (timestamptz)

    - `lsas_assessments`
      - `id` (uuid, primary key)
      - `student_id` (uuid)
      - `coach_id` (uuid)
      - `assessment_date` (timestamptz)
      - `score` (integer)
      - `comments` (text)
      - `created_at` (timestamptz)

    - `progress_reports`
      - `id` (uuid, primary key)
      - `student_id` (uuid)
      - `coach_id` (uuid)
      - `report_date` (timestamptz)
      - `attendance_rate` (decimal)
      - `progress_notes` (text)
      - `recommendations` (text)
      - `file_url` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add appropriate access policies
*/

CREATE TABLE IF NOT EXISTS student_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date_of_birth date,
  guardian_name text,
  guardian_contact text,
  address text,
  emergency_contact text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS coaching_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES users(id),
  title text NOT NULL,
  description text,
  scheduled_date timestamptz NOT NULL,
  duration_minutes integer DEFAULT 60,
  location text,
  max_attendees integer,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS session_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES coaching_sessions(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attended boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS home_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES users(id),
  student_id uuid NOT NULL REFERENCES users(id),
  visit_date timestamptz NOT NULL,
  duration_minutes integer,
  notes text,
  progress_update text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lsas_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  coach_id uuid NOT NULL REFERENCES users(id),
  assessment_date timestamptz NOT NULL,
  score integer,
  comments text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS progress_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  coach_id uuid NOT NULL REFERENCES users(id),
  report_date timestamptz NOT NULL,
  attendance_rate decimal(5,2),
  progress_notes text,
  recommendations text,
  file_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE lsas_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own profile"
  ON student_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Coaches and admins can view student profiles"
  ON student_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role IN ('coach', 'admin')
    )
  );

CREATE POLICY "Coaches can create and manage sessions"
  ON coaching_sessions FOR ALL
  TO authenticated
  USING (
    coach_id = auth.uid() OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  )
  WITH CHECK (
    coach_id = auth.uid() OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Everyone can view sessions"
  ON coaching_sessions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Coaches can manage attendance"
  ON session_attendance FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM coaching_sessions
      WHERE coaching_sessions.id = session_attendance.session_id
      AND (coaching_sessions.coach_id = auth.uid() OR EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid() AND users.role = 'admin'
      ))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM coaching_sessions
      WHERE coaching_sessions.id = session_attendance.session_id
      AND (coaching_sessions.coach_id = auth.uid() OR EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid() AND users.role = 'admin'
      ))
    )
  );

CREATE POLICY "Students can view their attendance"
  ON session_attendance FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Coaches can log home visits"
  ON home_visits FOR INSERT
  TO authenticated
  WITH CHECK (coach_id = auth.uid());

CREATE POLICY "Students and coaches can view home visits"
  ON home_visits FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid() OR coach_id = auth.uid() OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Coaches can create assessments"
  ON lsas_assessments FOR INSERT
  TO authenticated
  WITH CHECK (coach_id = auth.uid());

CREATE POLICY "Students and coaches can view assessments"
  ON lsas_assessments FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid() OR coach_id = auth.uid() OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Coaches can create reports"
  ON progress_reports FOR INSERT
  TO authenticated
  WITH CHECK (coach_id = auth.uid());

CREATE POLICY "Students and coaches can view reports"
  ON progress_reports FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid() OR coach_id = auth.uid() OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );
