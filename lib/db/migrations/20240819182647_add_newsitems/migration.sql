-- CreateTable
CREATE TABLE "NewsItem" (
    "id" SERIAL NOT NULL,
    "author_id" INTEGER NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "expires" TIMESTAMP(3),
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "NewsItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NewsItem" ADD CONSTRAINT "NewsItem_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
