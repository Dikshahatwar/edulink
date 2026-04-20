/*
  Warnings:

  - Added the required column `assignedDate` to the `CreatedAssignment` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CreatedAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "assignedDate" DATETIME NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "filePath" TEXT,
    "facultyId" TEXT NOT NULL,
    CONSTRAINT "CreatedAssignment_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CreatedAssignment" ("createdAt", "description", "dueDate", "facultyId", "filePath", "id", "title") SELECT "createdAt", "description", "dueDate", "facultyId", "filePath", "id", "title" FROM "CreatedAssignment";
DROP TABLE "CreatedAssignment";
ALTER TABLE "new_CreatedAssignment" RENAME TO "CreatedAssignment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
