-- Migration: add_helper_functions_for_marketplace
-- Created at: 1761731620

-- Function to increment download count atomically
CREATE OR REPLACE FUNCTION increment_download_count(table_name text, item_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF table_name = 'games' THEN
    UPDATE games SET download_count = COALESCE(download_count, 0) + 1 WHERE id = item_id;
  ELSIF table_name = 'programs' THEN
    UPDATE programs SET download_count = COALESCE(download_count, 0) + 1 WHERE id = item_id;
  END IF;
END;
$$;

-- Function to recalculate average ratings
CREATE OR REPLACE FUNCTION recalculate_average_rating(p_content_id uuid, p_content_type text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_avg_rating numeric;
  v_total_ratings integer;
  v_table_name text;
BEGIN
  -- Calculate average from approved ratings
  SELECT AVG(rating)::numeric(3,2), COUNT(*)
  INTO v_avg_rating, v_total_ratings
  FROM content_ratings
  WHERE content_id = p_content_id 
    AND content_type = p_content_type
    AND is_approved = true;

  -- Update content table
  v_table_name := CASE 
    WHEN p_content_type = 'game' THEN 'games'
    WHEN p_content_type = 'program' THEN 'programs'
  END;

  IF v_table_name IS NOT NULL THEN
    EXECUTE format('UPDATE %I SET average_rating = $1, total_ratings = $2 WHERE id = $3', v_table_name)
    USING COALESCE(v_avg_rating, 0), COALESCE(v_total_ratings, 0), p_content_id;
  END IF;
END;
$$;

-- Trigger to recalculate ratings when a rating is approved/updated
CREATE OR REPLACE FUNCTION trigger_recalculate_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.is_approved = true THEN
    PERFORM recalculate_average_rating(NEW.content_id, NEW.content_type);
  ELSIF TG_OP = 'DELETE' AND OLD.is_approved = true THEN
    PERFORM recalculate_average_rating(OLD.content_id, OLD.content_type);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_content_rating
AFTER INSERT OR UPDATE OR DELETE ON content_ratings
FOR EACH ROW
EXECUTE FUNCTION trigger_recalculate_rating();;