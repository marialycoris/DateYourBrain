-- Date Your Brain — stored procedures
-- -----------------------------------------------------------------------------
-- Run this AFTER `python manage.py migrate` has created the tables, otherwise
-- the procedures will fail because the tables don't exist yet.
--
-- How to run: open phpMyAdmin, select the `dateyourbrain` database, open the
-- SQL tab and paste this whole file. Or from a terminal:
--     mysql -u root dateyourbrain < sql/02_stored_procedures.sql
--
-- Expected tables (created by Django):
--   accounts_user, courses_course, tracker_swipelog,
--   tracker_trackerentry, reports_report
-- -----------------------------------------------------------------------------

DELIMITER $$

-- ---------------------------------------------------------------------------
-- sp_log_swipe
-- Log a swipe into tracker_swipelog. If the direction is 'right', also create
-- an 'Interested' tracker entry for that user+course (deduped — one entry per
-- user/course pair). Both writes happen in one procedure = one transaction.
-- ---------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_log_swipe$$
CREATE PROCEDURE sp_log_swipe(
  IN p_user_id INT,
  IN p_course_id INT,
  IN p_direction VARCHAR(8)
)
BEGIN
  INSERT INTO tracker_swipelog (user_id, course_id, direction, created_at)
  VALUES (p_user_id, p_course_id, p_direction, NOW());

  IF p_direction = 'right' THEN
    INSERT INTO tracker_trackerentry (user_id, course_id, status, notes, updated_at)
    SELECT p_user_id, p_course_id, 'Interested', '', NOW()
    WHERE NOT EXISTS (
      SELECT 1
      FROM tracker_trackerentry
      WHERE user_id = p_user_id AND course_id = p_course_id
    );
  END IF;
END$$

-- ---------------------------------------------------------------------------
-- sp_dashboard_totals
-- Headline numbers for the admin Analytics screen — a single row:
-- total_users, active_users_30d, total_swipes, avg_swipes_per_user.
-- ---------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_dashboard_totals$$
CREATE PROCEDURE sp_dashboard_totals()
BEGIN
  DECLARE v_total_users INT DEFAULT 0;
  DECLARE v_active_users INT DEFAULT 0;
  DECLARE v_total_swipes INT DEFAULT 0;
  DECLARE v_avg DECIMAL(10, 1) DEFAULT 0;

  SELECT COUNT(*) INTO v_total_users
  FROM accounts_user
  WHERE role = 'user';

  SELECT COUNT(*) INTO v_active_users
  FROM accounts_user
  WHERE role = 'user'
    AND last_login IS NOT NULL
    AND last_login >= DATE_SUB(NOW(), INTERVAL 30 DAY);

  SELECT COUNT(*) INTO v_total_swipes
  FROM tracker_swipelog;

  IF v_total_users > 0 THEN
    SET v_avg = ROUND(v_total_swipes / v_total_users, 1);
  END IF;

  SELECT
    v_total_users     AS total_users,
    v_active_users    AS active_users_30d,
    v_total_swipes    AS total_swipes,
    v_avg             AS avg_swipes_per_user;
END$$

-- ---------------------------------------------------------------------------
-- sp_course_metrics
-- Per-course engagement: interested / in-progress / completed counts plus
-- completion rate (completed / interested). One row per course.
-- ---------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_course_metrics$$
CREATE PROCEDURE sp_course_metrics()
BEGIN
  SELECT
    c.id            AS course_id,
    c.title         AS title,
    COUNT(e.id)     AS interested,
    IFNULL(SUM(CASE WHEN e.status = 'In Progress' THEN 1 ELSE 0 END), 0) AS in_progress,
    IFNULL(SUM(CASE WHEN e.status = 'Completed' THEN 1 ELSE 0 END), 0)   AS completed,
    CASE
      WHEN COUNT(e.id) = 0 THEN 0
      ELSE ROUND(
        SUM(CASE WHEN e.status = 'Completed' THEN 1 ELSE 0 END) / COUNT(e.id),
        2
      )
    END             AS completion_rate
  FROM courses_course c
  LEFT JOIN tracker_trackerentry e ON e.course_id = c.id
  GROUP BY c.id, c.title
  ORDER BY c.title;
END$$

-- ---------------------------------------------------------------------------
-- sp_report_counts
-- Issue reports aggregated by course, broken out by issue type. Only courses
-- with at least one report are returned.
-- ---------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_report_counts$$
CREATE PROCEDURE sp_report_counts()
BEGIN
  SELECT
    c.id                     AS course_id,
    c.title                  AS title,
    COUNT(r.id)              AS total,
    IFNULL(SUM(r.issue_type = 'No longer free'), 0)              AS no_longer_free,
    IFNULL(SUM(r.issue_type = 'Link broken'), 0)                 AS link_broken,
    IFNULL(SUM(r.issue_type = 'Certificate requires payment'), 0) AS cert_requires_payment,
    IFNULL(SUM(r.issue_type = 'Other'), 0)                       AS other_reports
  FROM courses_course c
  LEFT JOIN reports_report r ON r.course_id = c.id
  GROUP BY c.id, c.title
  HAVING COUNT(r.id) > 0
  ORDER BY c.title;
END$$

DELIMITER ;