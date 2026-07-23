export type Role = "TEACHER" | "STUDENT";
export type LessonStatus = "IN_PROGRESS" | "MASTERED" | "REVIEW_NEEDED";
export type HomeworkStatus = "TODO" | "IN_PROGRESS" | "CHECKING" | "DONE";
export type AttendanceStatus = "SCHEDULED" | "CONDUCTED" | "MISSED" | "RESCHEDULED";
export type TariffPlan = "INDIVIDUAL_60" | "INDIVIDUAL_45" | "PAIR_60" | "PAIR_45";
export type PaymentStatus = "PAID" | "UNPAID";

export type HomeworkSummary = {
  id: string;
  title: string;
  status: HomeworkStatus;
};

export type VocabItem = {
  id: string;
  english: string;
  translation: string;
  sortOrder: number;
  learned: boolean;
};

// A batch of words assigned in one lesson, with its own "learn by" date and
// completion state — e.g. "assigned 15.07, learn by 20.07".
export type VocabBlock = {
  id: string;
  dueDate: string;
  learned: boolean;
  vocabItems: VocabItem[];
};

export type Lesson = {
  id: string;
  date: string;
  grammar: string;
  vocabulary: string;
  readingListening: string;
  speaking: string;
  writing: string;
  status: LessonStatus;
  lessonLink: string | null;
  attachmentUrl: string | null;
  attachmentName: string | null;
  recordingUrl: string | null;
  homework: HomeworkSummary[];
  vocabBlocks: VocabBlock[];
};

export type Homework = {
  id: string;
  lessonId: string;
  studentId: string;
  title: string;
  deadline: string;
  taskContent: string;
  status: HomeworkStatus;
  audioUrl: string | null;
  answerText: string | null;
  feedbackText: string | null;
  feedbackAudioUrl: string | null;
  vocabItems: VocabItem[];
  photos: { id: string; url: string }[];
  lesson?: { id: string; date: string; grammar: string };
};

export type PaymentEntry = {
  id: string;
  lessonLabel: string;
  date: string;
  attendanceStatus: AttendanceStatus;
  tariffPlan: TariffPlan;
  paymentStatus: PaymentStatus;
  amount: number | null;
};

export type Student = {
  id: string;
  name: string;
  email: string;
  teacherId?: string | null;
  zoomLink?: string | null;
};

export type TeacherProfile = {
  id: string;
  name: string;
  title: string;
  bio: string;
  photoUrl: string | null;
  credentials: string;
  philosophy: string;
  specialties: string;
  instagram: string | null;
  practicingSince: string;
  isFounder: boolean;
  sortOrder: number;
};

export const TARIFF_LABELS: Record<TariffPlan, string> = {
  INDIVIDUAL_60: "Індивідуальні 60 хв",
  INDIVIDUAL_45: "Індивідуальні 45 хв",
  PAIR_60: "У парі 60 хв",
  PAIR_45: "У парі 45 хв",
};
