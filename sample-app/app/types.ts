import { Subject, SubjectDays, Teacher } from "@prisma/client";

export type SubjectComplete = Subject & {
  teacher: Teacher;
  subjectDays: SubjectDays[];
};
