
export async function up(knex) {
  // Hàm trigger
  await knex.raw(`
    CREATE OR REPLACE FUNCTION enforce_timekeeping_sequence()
    RETURNS TRIGGER AS $$
    BEGIN
      -- Nếu log mới là checkin mà đã có checkin trong ngày → reject
      IF NEW.check_type = 'checkin' THEN
        IF EXISTS (
          SELECT 1 FROM timekeeping
          WHERE employee_id = NEW.employee_id
            AND DATE(created_at) = DATE(NEW.created_at)
            AND check_type = 'checkin'
        ) THEN
          RAISE EXCEPTION 'Already checked in today';
        END IF;
      END IF;

      -- Nếu log mới là checkout mà chưa có checkin trong ngày → reject
      IF NEW.check_type = 'checkout' THEN
        IF NOT EXISTS (
          SELECT 1 FROM timekeeping
          WHERE employee_id = NEW.employee_id
            AND DATE(created_at) = DATE(NEW.created_at)
            AND check_type = 'checkin'
        ) THEN
          RAISE EXCEPTION 'Cannot checkout without checkin first';
        END IF;
      END IF;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Trigger
  await knex.raw(`
    CREATE TRIGGER trg_timekeeping_sequence
    BEFORE INSERT ON timekeeping
    FOR EACH ROW
    EXECUTE FUNCTION enforce_timekeeping_sequence();
  `);
}

export async function down(knex) {
  await knex.raw(`DROP TRIGGER IF EXISTS trg_timekeeping_sequence ON timekeeping;`);
  await knex.raw(`DROP FUNCTION IF EXISTS enforce_timekeeping_sequence();`);
}
