-- 02_stored_procedures.sql
-- Import after 01_database.sql and Django migrations.
-- Run with a MySQL client that understands DELIMITER (mysql CLI or Workbench).
-- These procedures mirror the summary endpoints used by the admin dashboard.

DROP PROCEDURE IF EXISTS sp_log_swipe$$
DROP PROCEDURE IF EXISTS sp_log_tracker$$
DROP PROCEDURE IF EXISTS sp_dashboard_totals$$
DROP PROCEDURE IF EXISTS sp_course_metrics$$
DROP PROCEDURE IF EXISTS sp_report_counts$$

CREATE PROCEDURE sp_log_swipe(
    IN p_userID BIGINT,
    IN p_courseID BIGINT,
    IN p_direction VARCHAR(10)
)
BEGIN
    IF p_direction NOT IN ('left', 'right') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'direction must be left or right';
    END IF;

    INSERT INTO tracker_swipelog (userID, courseID, direction, created_at)
    VALUES (p_userID, p_courseID, p_direction, NOW());
END$$

CREATE PROCEDURE sp_log_tracker(
    IN p_userID BIGINT,
    IN p_courseID BIGINT,
    IN p_status VARCHAR(20),
    IN p_notes TEXT
)
BEGIN
    INSERT INTO tracker_trackerentry (userID, courseID, status, notes, updated_at)
    VALUES (p_userID, p_courseID, p_status, p_notes, NOW())
    ON DUPLICATE KEY UPDATE
        status = VALUES(status),
        notes = VALUES(notes),
        updated_at = NOW();
END$$

CREATE PROCEDURE sp_dashboard_totals()
BEGIN
    SELECT
        (SELECT COUNT(*) FROM accounts_user) AS total_users,
        (SELECT COUNT(*) FROM accounts_user WHERE last_login >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS active_users_30d,
        (SELECT COUNT(*) FROM tracker_swipelog) AS total_swipes,
        (SELECT IFNULL(ROUND(COUNT(*) / NULLIF(COUNT(DISTINCT userID), 0), 2), 0)
         FROM tracker_swipelog) AS avg_swipes_per_user;
END$$

CREATE PROCEDURE sp_course_metrics()
BEGIN
    SELECT
        c.courseID AS course_id,
        c.title AS title,
        SUM(CASE WHEN s.direction = 'right' THEN 1 ELSE 0 END) AS interested,
        SUM(CASE WHEN e.status = 'Ongoing' THEN 1 ELSE 0 END) AS in_progress,
        SUM(CASE WHEN e.status = 'Completed' THEN 1 ELSE 0 END) AS completed,
        IFNULL(ROUND(
            SUM(CASE WHEN e.status = 'Completed' THEN 1 ELSE 0 END) /
            NULLIF(COUNT(DISTINCT e.userID), 0) * 100, 1
        ), 0) AS completion_rate
    FROM courses_course c
    LEFT JOIN tracker_swipelog s ON s.courseID = c.courseID
    LEFT JOIN tracker_trackerentry e ON e.courseID = c.courseID
    GROUP BY c.courseID, c.title
    ORDER BY interested DESC, completed DESC, c.title;
END$$

CREATE PROCEDURE sp_report_counts()
BEGIN
    SELECT
        c.courseID AS course_id,
        c.title AS title,
        COUNT(r.reportNUM) AS total,
        SUM(CASE WHEN r.issue_type = 'No longer free' THEN 1 ELSE 0 END) AS no_longer_free,
        SUM(CASE WHEN r.issue_type = 'Link broken' THEN 1 ELSE 0 END) AS link_broken,
        SUM(CASE WHEN r.issue_type = 'Certificate requires payment' THEN 1 ELSE 0 END) AS cert_requires_payment,
        SUM(CASE WHEN r.issue_type = 'Other' THEN 1 ELSE 0 END) AS other_reports
    FROM courses_course c
    LEFT JOIN reports_report r ON r.courseID = c.courseID
    GROUP BY c.courseID, c.title
    HAVING total > 0
    ORDER BY total DESC, c.title;
END$$

DELIMITER ;
