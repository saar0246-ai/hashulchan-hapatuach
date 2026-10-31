-- Run in Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS food_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  items text NOT NULL,
  city text NOT NULL,
  neighborhood text NOT NULL,
  full_address text NOT NULL,
  image_url text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS food_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES food_posts(id) ON DELETE CASCADE NOT NULL,
  requester_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(post_id, requester_id)
);

ALTER TABLE food_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fp_select_active" ON food_posts FOR SELECT USING (auth.uid() IS NOT NULL AND (status = 'active' OR host_id = auth.uid()));
CREATE POLICY "fp_insert" ON food_posts FOR INSERT WITH CHECK (host_id = auth.uid());
CREATE POLICY "fp_update" ON food_posts FOR UPDATE USING (host_id = auth.uid());
CREATE POLICY "fp_delete" ON food_posts FOR DELETE USING (host_id = auth.uid());

CREATE POLICY "fr_select" ON food_requests FOR SELECT USING (
  requester_id = auth.uid() OR
  post_id IN (SELECT id FROM food_posts WHERE host_id = auth.uid())
);
CREATE POLICY "fr_insert" ON food_requests FOR INSERT WITH CHECK (requester_id = auth.uid());
CREATE POLICY "fr_update" ON food_requests FOR UPDATE USING (
  post_id IN (SELECT id FROM food_posts WHERE host_id = auth.uid())
);
