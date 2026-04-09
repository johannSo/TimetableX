-- CreateTable
CREATE TABLE "has_pro" (
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "hasPro" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "has_pro_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "has_pro" ADD CONSTRAINT "has_pro_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
