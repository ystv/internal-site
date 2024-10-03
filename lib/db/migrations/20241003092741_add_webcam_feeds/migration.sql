-- CreateTable
CREATE TABLE "webcam_feeds" (
    "webcam_id" SERIAL NOT NULL,
    "full_name" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "stream_url" TEXT NOT NULL,

    CONSTRAINT "webcam_feeds_pkey" PRIMARY KEY ("webcam_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "webcam_feeds_identifier_key" ON "webcam_feeds"("identifier");
