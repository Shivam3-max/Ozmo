-- Store every phone number in one form (E.164, e.g. +919888877777) so that
-- "98888 77777" and "+91 98888-77777" are recognised as the same number. The
-- rules mirror lib/phone.ts; values that don't fit any rule are left as typed.

UPDATE `Lead` SET `phone` = (CASE
    WHEN REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', '') REGEXP '^[+][1-9][0-9]{7,14}$' AND (REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', '') NOT LIKE '+91%' OR CHAR_LENGTH(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', '')) = 13) THEN REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', '')
    WHEN REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', '') REGEXP '^00[1-9][0-9]{7,14}$' THEN CONCAT('+', SUBSTRING(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', ''), 3))
    WHEN REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', '') REGEXP '^[1-9][0-9]{9}$' THEN CONCAT('+91', REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', ''))
    WHEN REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', '') REGEXP '^0[1-9][0-9]{9}$' THEN CONCAT('+91', SUBSTRING(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', ''), 2))
    WHEN REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', '') REGEXP '^91[1-9][0-9]{9}$' THEN CONCAT('+', REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', ''))
    ELSE `phone`
  END);

UPDATE `ContactMessage` SET `phone` = (CASE
    WHEN REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', '') REGEXP '^[+][1-9][0-9]{7,14}$' AND (REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', '') NOT LIKE '+91%' OR CHAR_LENGTH(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', '')) = 13) THEN REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', '')
    WHEN REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', '') REGEXP '^00[1-9][0-9]{7,14}$' THEN CONCAT('+', SUBSTRING(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', ''), 3))
    WHEN REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', '') REGEXP '^[1-9][0-9]{9}$' THEN CONCAT('+91', REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', ''))
    WHEN REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', '') REGEXP '^0[1-9][0-9]{9}$' THEN CONCAT('+91', SUBSTRING(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', ''), 2))
    WHEN REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', '') REGEXP '^91[1-9][0-9]{9}$' THEN CONCAT('+', REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', ''))
    ELSE `phone`
  END);

-- User.phone is unique. Only rewrite a user's number when no other user would
-- end up with the same normalised value; collisions are left for staff to
-- resolve by hand rather than failing the deploy.
UPDATE `User` u
JOIN (
  SELECT n.id, n.normalized
  FROM (SELECT `id`, (CASE
    WHEN REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', '') REGEXP '^[+][1-9][0-9]{7,14}$' AND (REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', '') NOT LIKE '+91%' OR CHAR_LENGTH(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', '')) = 13) THEN REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', '')
    WHEN REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', '') REGEXP '^00[1-9][0-9]{7,14}$' THEN CONCAT('+', SUBSTRING(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', ''), 3))
    WHEN REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', '') REGEXP '^[1-9][0-9]{9}$' THEN CONCAT('+91', REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', ''))
    WHEN REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', '') REGEXP '^0[1-9][0-9]{9}$' THEN CONCAT('+91', SUBSTRING(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', ''), 2))
    WHEN REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', '') REGEXP '^91[1-9][0-9]{9}$' THEN CONCAT('+', REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', ''))
    ELSE `phone`
  END) AS normalized FROM `User` WHERE `phone` IS NOT NULL) n
  JOIN (
    SELECT normalized FROM (SELECT (CASE
    WHEN REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', '') REGEXP '^[+][1-9][0-9]{7,14}$' AND (REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', '') NOT LIKE '+91%' OR CHAR_LENGTH(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', '')) = 13) THEN REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', '')
    WHEN REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', '') REGEXP '^00[1-9][0-9]{7,14}$' THEN CONCAT('+', SUBSTRING(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', ''), 3))
    WHEN REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', '') REGEXP '^[1-9][0-9]{9}$' THEN CONCAT('+91', REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', ''))
    WHEN REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', '') REGEXP '^0[1-9][0-9]{9}$' THEN CONCAT('+91', SUBSTRING(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', ''), 2))
    WHEN REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', '') REGEXP '^91[1-9][0-9]{9}$' THEN CONCAT('+', REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`phone`), ' ', ''), '-', ''), '(', ''), ')', ''), '.', ''))
    ELSE `phone`
  END) AS normalized FROM `User` WHERE `phone` IS NOT NULL) all_users
    GROUP BY normalized HAVING COUNT(*) = 1
  ) singles ON singles.normalized = n.normalized
) safe ON safe.id = u.id
SET u.`phone` = safe.normalized
WHERE u.`phone` <> safe.normalized;
