/*
  Warnings:

  - You are about to drop the column `teacherId` on the `SubjectDays` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SubjectDays" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "subjectId" INTEGER NOT NULL,
    "day" INTEGER NOT NULL,
    CONSTRAINT "SubjectDays_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SubjectDays" ("day", "id", "subjectId") SELECT "day", "id", "subjectId" FROM "SubjectDays";
DROP TABLE "SubjectDays";
ALTER TABLE "new_SubjectDays" RENAME TO "SubjectDays";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
