export type PartOfDay = "kunduzgi" | "kechki" | "sirtqi";

export type Major = {
  id: string;
  name: string;
  partsOfDay: PartOfDay[];
};

export type University = {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  city: string;
  address: string;
  description: string;
  tuitionMin: number;
  tuitionMax: number;
  deadline: string;
  majors: Major[];
  requirements: {
    minDtm?: number;
    minIelts?: number;
    minSat?: number;
    minGpa?: number;
    note?: string;
  };
  offersFinancialAid: boolean;
  hasEntranceExam: boolean;
  entranceExamSubjects?: string[];
  language: string[];
};

export type ApplicationStatus =
  | "yuborilmagan"
  | "korib_chiqilmoqda"
  | "qabul_qilindi"
  | "rad_etildi";

export type Application = {
  id: string;
  universityId: string;
  majorId: string;
  partOfDay: PartOfDay;
  financialAid: boolean;
  status: ApplicationStatus;
  needsEntranceExam: boolean;
  examRegistered?: boolean;
  examDate?: string;
  createdAt: string;
};

export type IeltsScore = {
  overall: string;
  listening: string;
  reading: string;
  writing: string;
  speaking: string;
};

export type SatScore = {
  total: string;
  math: string;
  readingWriting: string;
};

export type DtmSubject = {
  name: string;
  score: string;
};

export type DtmScore = {
  total: string;
  majburiy: DtmSubject[];
  asosiy: DtmSubject[];
};

export type Profile = {
  school: string;
  photo?: string;
  phone: string;
  country: string;
  citizenship: string;
  address: string;
  passportId: string;
  graduationYear: string;
  ielts?: IeltsScore;
  sat?: SatScore;
  dtm?: DtmScore;
  applyingForGrant: boolean;
  diplomaUploaded: boolean;
  dtmUploaded: boolean;
};

export type User = {
  id: string;
  fullName: string;
  email: string;
  dateOfBirth: string;
  profile?: Profile;
  applications: Application[];
};
