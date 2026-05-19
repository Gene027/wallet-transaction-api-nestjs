import { MigrationInterface, QueryRunner } from 'typeorm';

export class CustomerEmailPerMerchant1779183200000 implements MigrationInterface {
  name = 'CustomerEmailPerMerchant1779183200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_8536b8b85c06969f84f0c098b0"`);
    await queryRunner.query(
      `ALTER TABLE "customers" DROP CONSTRAINT "UQ_8536b8b85c06969f84f0c098b03"`,
    );
    await queryRunner.query(
      `ALTER TABLE "customers" ADD CONSTRAINT "UQ_customers_email_merchant_id" UNIQUE ("email", "merchant_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customers" DROP CONSTRAINT "UQ_customers_email_merchant_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "customers" ADD CONSTRAINT "UQ_8536b8b85c06969f84f0c098b03" UNIQUE ("email")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8536b8b85c06969f84f0c098b0" ON "customers" ("email")`,
    );
  }
}
