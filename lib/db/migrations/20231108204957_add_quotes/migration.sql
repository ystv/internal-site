-- CreateTable
CREATE TABLE "quotes" (
    "quote_id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "context" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("quote_id")
);
