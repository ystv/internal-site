-- CreateTable
CREATE TABLE "equipment_list_templates" (
    "equipment_list_template_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "items" TEXT NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "equipment_list_templates_pkey" PRIMARY KEY ("equipment_list_template_id")
);
