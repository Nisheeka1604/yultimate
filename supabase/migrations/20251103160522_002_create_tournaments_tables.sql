/*
  # Create tournament management tables

  1. New Tables
    - `tournaments`
      - `id` (uuid, primary key)
      - `title` (text) - tournament name
      - `description` (text) - tournament details
      - `rules` (text) - tournament rules
      - `banner_url` (text) - banner image URL
      - `location` (text) - tournament location
      - `status` (text) - draft, registration_open, registration_closed, in_progress, completed, cancelled
      - `start_date` (timestamptz)
      - `end_date` (timestamptz)
      - `created_by` (uuid) - admin who created it
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `teams`
      - `id` (uuid, primary key)
      - `tournament_id` (uuid) - foreign key to tournaments
      - `name` (text) - team name
      - `manager_id` (uuid) - team manager user id
      - `registration_status` (text) - pending, approved, rejected, waitlisted
      - `pool_group` (text) - assigned pool/bracket
      - `approved_by` (uuid) - admin who approved
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `players`
      - `id` (uuid, primary key)
      - `team_id` (uuid) - foreign key to teams
      - `name` (text)
      - `date_of_birth` (date)
      - `age` (integer)
      - `experience_level` (text)
      - `jersey_number` (integer)
      - `gender` (text)
      - `contact_email` (text)
      - `contact_phone` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `matches`
      - `id` (uuid, primary key)
      - `tournament_id` (uuid)
      - `pool_group` (text)
      - `team1_id` (uuid)
      - `team2_id` (uuid)
      - `match_datetime` (timestamptz)
      - `location` (text)
      - `status` (text) - scheduled, in_progress, completed, cancelled
      - `team1_score` (integer)
      - `team2_score` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `spirit_scores`
      - `id` (uuid, primary key)
      - `match_id` (uuid)
      - `team_id` (uuid) - team giving the score
      - `opponent_team_id` (uuid) - team being scored
      - `rules_knowledge` (integer, 1-5)
      - `fouls` (integer, 1-5)
      - `body_contact` (integer, 1-5)
      - `fairness` (integer, 1-5)
      - `attitude` (integer, 1-5)
      - `communication` (integer, 1-5)
      - `comments` (text)
      - `submitted_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add appropriate access policies
*/

CREATE TABLE IF NOT EXISTS tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  rules text,
  banner_url text,
  location text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'registration_open', 'registration_closed', 'in_progress', 'completed', 'cancelled')),
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  name text NOT NULL,
  manager_id uuid NOT NULL REFERENCES users(id),
  registration_status text NOT NULL DEFAULT 'pending' CHECK (registration_status IN ('pending', 'approved', 'rejected', 'waitlisted')),
  pool_group text,
  approved_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name text NOT NULL,
  date_of_birth date,
  age integer,
  experience_level text,
  jersey_number integer,
  gender text,
  contact_email text,
  contact_phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  pool_group text,
  team1_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  team2_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  match_datetime timestamptz NOT NULL,
  location text,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  team1_score integer,
  team2_score integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS spirit_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  opponent_team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  rules_knowledge integer CHECK (rules_knowledge >= 1 AND rules_knowledge <= 5),
  fouls integer CHECK (fouls >= 1 AND fouls <= 5),
  body_contact integer CHECK (body_contact >= 1 AND body_contact <= 5),
  fairness integer CHECK (fairness >= 1 AND fairness <= 5),
  attitude integer CHECK (attitude >= 1 AND attitude <= 5),
  communication integer CHECK (communication >= 1 AND communication <= 5),
  comments text,
  submitted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE spirit_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage tournaments"
  ON tournaments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Everyone can view active tournaments"
  ON tournaments FOR SELECT
  TO authenticated
  USING (status != 'draft');

CREATE POLICY "Admins can view draft tournaments"
  ON tournaments FOR SELECT
  TO authenticated
  USING (
    status = 'draft' AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Team managers can view their teams"
  ON teams FOR SELECT
  TO authenticated
  USING (manager_id = auth.uid() OR EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ));

CREATE POLICY "Team managers can update their teams"
  ON teams FOR UPDATE
  TO authenticated
  USING (manager_id = auth.uid())
  WITH CHECK (manager_id = auth.uid());

CREATE POLICY "Admins can manage teams"
  ON teams FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Team managers and admins can view players"
  ON players FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = players.team_id
      AND (teams.manager_id = auth.uid() OR EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid() AND users.role = 'admin'
      ))
    )
  );

CREATE POLICY "Everyone can view matches"
  ON matches FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage matches"
  ON matches FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Teams can submit spirit scores"
  ON spirit_scores FOR INSERT
  TO authenticated
  WITH CHECK (
    team_id IN (
      SELECT teams.id FROM teams
      WHERE teams.manager_id = auth.uid()
    )
  );

CREATE POLICY "Everyone can view spirit scores"
  ON spirit_scores FOR SELECT
  TO authenticated
  USING (true);
