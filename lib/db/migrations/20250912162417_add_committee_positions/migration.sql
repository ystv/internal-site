-- AlterTable
ALTER TABLE "public"."check_with_techs" RENAME CONSTRAINT "CheckWithTech_pkey" TO "check_with_techs_pkey";

-- CreateTable
CREATE TABLE "public"."committee_positions" (
    "committee_position_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "seats" INTEGER NOT NULL DEFAULT 1,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "committee_positions_pkey" PRIMARY KEY ("committee_position_id")
);

-- CreateTable
CREATE TABLE "public"."committee_teams" (
    "committee_team_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "committee_teams_pkey" PRIMARY KEY ("committee_team_id")
);

-- CreateTable
CREATE TABLE "public"."committee_position_teams" (
    "committee_position_team_id" SERIAL NOT NULL,
    "committee_position_id" INTEGER NOT NULL,
    "committee_team_id" INTEGER NOT NULL,
    "ordering" INTEGER NOT NULL,

    CONSTRAINT "committee_position_teams_pkey" PRIMARY KEY ("committee_position_team_id")
);

-- CreateTable
CREATE TABLE "public"."committee_position_members" (
    "committee_position_member_id" SERIAL NOT NULL,
    "committee_position_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "start_date" TIMESTAMPTZ(6) NOT NULL,
    "end_date" TIMESTAMPTZ(6),
    "current" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "committee_position_members_pkey" PRIMARY KEY ("committee_position_member_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "committee_positions_name_key" ON "public"."committee_positions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "committee_teams_name_key" ON "public"."committee_teams"("name");

-- CreateIndex
CREATE UNIQUE INDEX "committee_position_teams_committee_position_id_committee_te_key" ON "public"."committee_position_teams"("committee_position_id", "committee_team_id");

-- CreateIndex
CREATE UNIQUE INDEX "committee_position_members_committee_position_id_user_id_st_key" ON "public"."committee_position_members"("committee_position_id", "user_id", "start_date");

-- AddForeignKey
ALTER TABLE "public"."committee_position_teams" ADD CONSTRAINT "committee_position_teams_committee_position_id_fkey" FOREIGN KEY ("committee_position_id") REFERENCES "public"."committee_positions"("committee_position_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."committee_position_teams" ADD CONSTRAINT "committee_position_teams_committee_team_id_fkey" FOREIGN KEY ("committee_team_id") REFERENCES "public"."committee_teams"("committee_team_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."committee_position_members" ADD CONSTRAINT "committee_position_members_committee_position_id_fkey" FOREIGN KEY ("committee_position_id") REFERENCES "public"."committee_positions"("committee_position_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."committee_position_members" ADD CONSTRAINT "committee_position_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
