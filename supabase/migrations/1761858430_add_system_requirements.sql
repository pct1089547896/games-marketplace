-- Migration: add_system_requirements
-- Created at: 1761858430

-- Add system requirements fields to games and programs tables
ALTER TABLE games ADD COLUMN IF NOT EXISTS os_requirements TEXT;
ALTER TABLE games ADD COLUMN IF NOT EXISTS ram_requirements TEXT;
ALTER TABLE games ADD COLUMN IF NOT EXISTS storage_requirements TEXT;
ALTER TABLE games ADD COLUMN IF NOT EXISTS processor_requirements TEXT;
ALTER TABLE games ADD COLUMN IF NOT EXISTS graphics_requirements TEXT;

ALTER TABLE programs ADD COLUMN IF NOT EXISTS os_requirements TEXT;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS ram_requirements TEXT;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS storage_requirements TEXT;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS processor_requirements TEXT;

-- Add reputation management functions
CREATE OR REPLACE FUNCTION add_reputation_points(
  p_user_id UUID,
  p_points INTEGER,
  p_reason TEXT
) RETURNS VOID AS $$
DECLARE
  v_current_points INTEGER;
  v_new_level TEXT;
BEGIN
  -- Get current points
  SELECT points INTO v_current_points
  FROM user_reputation
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    -- Create new reputation record
    INSERT INTO user_reputation (user_id, points, level)
    VALUES (p_user_id, p_points, 'Bronze');
  ELSE
    -- Update existing points
    UPDATE user_reputation
    SET points = points + p_points,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Calculate new level
    v_current_points := v_current_points + p_points;
    
    IF v_current_points >= 10000 THEN
      v_new_level := 'Diamond';
    ELSIF v_current_points >= 5000 THEN
      v_new_level := 'Platinum';
    ELSIF v_current_points >= 2000 THEN
      v_new_level := 'Gold';
    ELSIF v_current_points >= 500 THEN
      v_new_level := 'Silver';
    ELSE
      v_new_level := 'Bronze';
    END IF;
    
    UPDATE user_reputation
    SET level = v_new_level
    WHERE user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create notification trigger function
CREATE OR REPLACE FUNCTION notify_followers_on_new_content()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notifications for all followers
  INSERT INTO notifications (user_id, type, title, message, link)
  SELECT 
    f.follower_id,
    'new_content',
    'New ' || NEW.content_type || ' published',
    'Check out the new ' || NEW.content_type || ' from ' || (SELECT username FROM auth.users WHERE id = NEW.user_id),
    CASE 
      WHEN NEW.content_type = 'game' THEN '/games/' || NEW.content_id
      WHEN NEW.content_type = 'program' THEN '/programs/' || NEW.content_id
      ELSE '/'
    END
  FROM follows f
  WHERE f.followed_id = NEW.user_id
  AND f.followed_type = 'user';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for new content notifications
CREATE OR REPLACE FUNCTION notify_on_new_game()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, link)
  SELECT 
    f.follower_id,
    'new_content',
    'New game published',
    NEW.title || ' is now available',
    '/games/' || NEW.id
  FROM follows f
  WHERE f.followed_id = NEW.created_by
  AND f.followed_type = 'user';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION notify_on_new_program()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, link)
  SELECT 
    f.follower_id,
    'new_content',
    'New program published',
    NEW.title || ' is now available',
    '/programs/' || NEW.id
  FROM follows f
  WHERE f.followed_id = NEW.created_by
  AND f.followed_type = 'user';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_new_game_notify_followers ON games;
DROP TRIGGER IF EXISTS on_new_program_notify_followers ON programs;

-- Create triggers
CREATE TRIGGER on_new_game_notify_followers
  AFTER INSERT ON games
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_new_game();

CREATE TRIGGER on_new_program_notify_followers
  AFTER INSERT ON programs
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_new_program();;