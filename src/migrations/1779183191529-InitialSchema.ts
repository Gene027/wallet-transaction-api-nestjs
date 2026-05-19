import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1779183191529 implements MigrationInterface {
  name = 'InitialSchema1779183191529';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."transactions_type_enum" AS ENUM('CREDIT', 'DEBIT')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."transactions_status_enum" AS ENUM('SUCCESS', 'FAILED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "customer_id" uuid NOT NULL, "amount" bigint NOT NULL, "type" "public"."transactions_type_enum" NOT NULL, "status" "public"."transactions_status_enum" NOT NULL, "idempotency_key" character varying(255), "failure_reason" text, CONSTRAINT "UQ_11a02d187c87d3dc5b0b4949f20" UNIQUE ("idempotency_key"), CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id")); COMMENT ON COLUMN "transactions"."amount" IS 'Amount in cents (positive for credit, negative for debit)'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6f09843c214f21a462b54b11e8" ON "transactions" ("customer_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_11a02d187c87d3dc5b0b4949f2" ON "transactions" ("idempotency_key") `,
    );
    await queryRunner.query(
      `CREATE TABLE "customers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "wallet_balance" bigint NOT NULL DEFAULT '0', "merchant_id" uuid NOT NULL, CONSTRAINT "UQ_8536b8b85c06969f84f0c098b03" UNIQUE ("email"), CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY ("id")); COMMENT ON COLUMN "customers"."wallet_balance" IS 'Wallet balance in cents'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8536b8b85c06969f84f0c098b0" ON "customers" ("email") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c73a42116fe791faa952b71e9d" ON "customers" ("merchant_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_6f09843c214f21a462b54b11e8d" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_6f09843c214f21a462b54b11e8d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c73a42116fe791faa952b71e9d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8536b8b85c06969f84f0c098b0"`,
    );
    await queryRunner.query(`DROP TABLE "customers"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_11a02d187c87d3dc5b0b4949f2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6f09843c214f21a462b54b11e8"`,
    );
    await queryRunner.query(`DROP TABLE "transactions"`);
    await queryRunner.query(`DROP TYPE "public"."transactions_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."transactions_type_enum"`);
  }
}
