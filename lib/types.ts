export type PartOfDay = "kunduzgi" | "kechki" | "sirtqi";

export type Role = "STUDENT" | "UNIVERSITY_ADMIN" | "SUPER_ADMIN";

export type ApplicationStatus =
  | "YUBORILMAGAN"
  | "KORIB_CHIQILMOQDA"
  | "QABUL_QILINDI"
  | "RAD_ETILDI";

export type Major = {
  id: string;
  name: string;
  partsOfDay: PartOfDay[];
  tuitionFee: number;
};

export type University = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  logo: string;
  city: string;
  address: string;
  description: string;
  tuitionMin: number;
  tuitionMax: number;
  deadline: string;
  language: string[];
  offersFinancialAid: boolean;
  hasEntranceExam: boolean;
  minDtm: number | null;
  minIelts: number | null;
  minSat: number | null;
  minGpa: number | null;
  requirementsNote: string | null;
  majors: Major[];
};

export type Exam = {
  id: string;
  universityId: string;
  date: string;
  location: string;
  subjects: string[];
  capacity: number;
  price: number;
};

export type ExamRegistration = {
  id: string;
  exam: Exam;
};

export type Application = {
  id: string;
  userId: string;
  universityId: string;
  university: {
    id: string;
    slug: string;
    name: string;
    shortName: string;
    logo: string;
    address: string;
  };
  majorId: string;
  major: { id: string; name: string };
  partOfDay: PartOfDay;
  financialAid: boolean;
  status: ApplicationStatus;
  needsEntranceExam: boolean;
  examRegistration: ExamRegistration | null;
  submittedAt: string | null;
  createdAt: string;
};

export type IeltsScore = {
  overall: string;
  listening: string;
  reading: string;
  writing: string;
  speaking: string;
  certificate?: string;
};

export type SatScore = {
  total: string;
  math: string;
  readingWriting: string;
  certificate?: string;
};

export type DtmSubject = {
  name: string;
  score: string;
};

export type DtmScore = {
  total: string;
  majburiy: DtmSubject[];
  asosiy: DtmSubject[];
  certificate?: string;
};

export type MilliySubject = {
  subject: string;
  score: string;
  certificate?: string;
};

export type MilliySertifikat = {
  subjects: MilliySubject[];
};

export type Profile = {
  id?: string;
  school: string | null;
  photo: string | null;
  phone: string | null;
  country: string | null;
  citizenship: string | null;
  address: string | null;
  passportId: string | null;
  graduationYear: string | null;
  idCardFront: string | null;
  idCardBack: string | null;
  diploma: string | null;
  applyingForGrant: boolean;
  ielts: IeltsScore | null;
  sat: SatScore | null;
  dtm: DtmScore | null;
  milliySertifikat: MilliySertifikat | null;
};

export type User = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  managesUniversityId: string | null;
  profile: Profile | null;
  applications: Application[];
};
