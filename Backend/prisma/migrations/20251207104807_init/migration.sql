-- CreateTable
CREATE TABLE "Course" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "class" TEXT,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);
