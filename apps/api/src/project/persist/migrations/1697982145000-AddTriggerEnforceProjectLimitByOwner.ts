import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddTriggerEnforceProjectLimitByOwner1697982145000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION check_project_owner_limit()
      RETURNS TRIGGER AS $$
      DECLARE
          project_count INTEGER;
      BEGIN
          SELECT COUNT(*) INTO project_count
          FROM projects
          WHERE owner_id = NEW.owner_id;

          IF project_count >= 100 THEN
              RAISE EXCEPTION 'Owner cannot have more than 100 active projects';
          END IF;

          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER enforce_project_limit
      BEFORE INSERT ON projects
      FOR EACH ROW
      EXECUTE FUNCTION check_project_owner_limit();
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS enforce_project_limit ON projects;
      DROP FUNCTION IF EXISTS check_project_owner_limit;
    `)
  }
}
