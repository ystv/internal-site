-- Clean up duplicates beforehand
CREATE PROCEDURE __cleanup_dup_positions() AS $$
DECLARE dup RECORD;
DECLARE min_id INTEGER;
BEGIN FOR dup IN
SELECT name
FROM positions
GROUP BY name
HAVING count(*) > 1 LOOP
SELECT min(position_id) INTO min_id
FROM positions
WHERE name = dup.name;
UPDATE crews
SET position_id = min_id
WHERE (
    SELECT name
    FROM positions
    WHERE crews.position_id = positions.position_id
  ) = dup.name;
DELETE FROM POSITIONS
WHERE name = dup.name
  AND position_id <> min_id;
END LOOP;
END;
$$ LANGUAGE plpgsql;
--
CALL __cleanup_dup_positions();
DROP PROCEDURE __cleanup_dup_positions;
-- CreateIndex
CREATE UNIQUE INDEX "positions_name_key" ON "positions"("name");