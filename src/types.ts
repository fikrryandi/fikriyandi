export interface Project {
  id: string;
  title: string;
  client: string;
  category: string;
  status: 'Published' | 'Draft';
  dateAdded: string;
  image: string;
  images?: string[];
  description: string;
  tags: string[];
  link?: string;
}

export interface Skill {
  id: string;
  title: string;
  proficiency: number;
  category: string;
  icon: string;
  status: 'Published' | 'Draft';
}

export interface ExperienceMedia {
  id: string;
  url: string;
  caption: string;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  years: string;
  description: string;
  tags: string[];
  location?: string;
  logo?: string;
  media?: ExperienceMedia[];
}

export interface Education {
  id: string;
  stage: string;
  stageEN?: string;
  school: string;
  schoolEN?: string;
  years: string;
  logo?: string;
  grade?: string;
  activities?: string;
  activitiesEN?: string;
  description?: string;
  descriptionEN?: string;
  skills?: string[];
  hardSkills?: string[];
  softSkills?: string[];
  fieldOfStudy?: string;
  fieldOfStudyEN?: string;
  diplomaUrl?: string;
  diplomaType?: 'pdf' | 'image';
  diplomaName?: string;
}

export interface Message {
  id: string;
  sender: string;
  senderInitials: string;
  subject: string;
  email: string;
  message: string;
  dateText: string;
  status: 'READ' | 'UNREAD';
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  image: string; // Base64 or URL
  credentialUrl?: string;
  description?: string;
}

export interface Publication {
  id: string;
  title: string;
  journal: string;
  authors?: string;
  year: string;
  link: string;
  doi?: string;
  abstract?: string;
  publisher?: string;
  tags?: string[];
  pdfUrl?: string;
}

export interface SystemSettings {
  siteTitle: string;
  metaDescription: string;
  themeMode: 'dark' | 'light';
  maintenanceMode: boolean;
  contactEmail: string;
  whatsappBusiness: string;
  linkedinUrl: string;
  resumeFileName: string;
  ownerName: string;
  profilePicUrl?: string;
  profilePicUrlHome?: string;
  homeJobTitle?: string;
  homeHeadingSubtitle?: string;
  adminUsername?: string;
  adminPassword?: string;
  instagramUrl?: string;
  githubUrl?: string;
  cvUrl?: string;
  cvFileName?: string;
  contactEmailIcon?: string;
  whatsappBusinessIcon?: string;
  instagramUrlIcon?: string;
  linkedinUrlIcon?: string;
  githubUrlIcon?: string;
  mapEmbedUrl?: string;
  mapOpenUrl?: string;
  smtpHost?: string;
  smtpPort?: string;
  smtpUser?: string;
  smtpPass?: string;
  enableEmailNotify?: boolean;
  senderName?: string;
  // Menu navigation custom texts
  menuHomeID?: string;
  menuHomeEN?: string;
  menuAboutID?: string;
  menuAboutEN?: string;
  menuPortfolioID?: string;
  menuPortfolioEN?: string;
  menuContactID?: string;
  menuContactEN?: string;
  menuHireMeID?: string;
  menuHireMeEN?: string;
  // Main headings & taglines
  aboutSectionTitleID?: string;
  aboutSectionTitleEN?: string;
  taglineID?: string;
  taglineEN?: string;
  aboutBioID?: string;
  aboutBioEN?: string;
  homeBioID?: string;
  homeBioEN?: string;
  // Section labels & buttons custom texts
  sectionAboutID?: string;
  sectionAboutEN?: string;
  btnViewWorkID?: string;
  btnViewWorkEN?: string;
  btnContactMeID?: string;
  btnContactMeEN?: string;
  sectionSkillsID?: string;
  sectionSkillsEN?: string;
  sectionEducationID?: string;
  sectionEducationEN?: string;
  sectionCareerID?: string;
  sectionCareerEN?: string;
  sectionExperienceHomeID?: string;
  sectionExperienceHomeEN?: string;
  contactHubungiID?: string;
  contactHubungiEN?: string;
  contactFormTitleID?: string;
  contactFormTitleEN?: string;
  contactFormBtnID?: string;
  contactFormBtnEN?: string;

  // New features visibility toggles & settings
  showHeroSection?: boolean;
  showAboutSection?: boolean;
  showSkillsSection?: boolean;
  showCertificatesSection?: boolean;
  showEducationSection?: boolean;
  showExperienceSection?: boolean;
  showProjectsSection?: boolean;
  showPublicationsSection?: boolean;
  sectionPublicationsID?: string;
  sectionPublicationsEN?: string;

  // Home view extra settings
  homeCardHandle?: string;
  homeCardStatusText?: string;
  homeCardStatusColor?: string;

  // About Me custom colors
  aboutNameCapsuleBg?: string;
  aboutRoleCapsuleBg?: string;

  // Skills Marquee details
  skillsMarqueeSpeed?: number;
  skillsMarqueeDirection?: 'left' | 'right' | 'alternate';

  // Creator Labels
  homeCardCreatorLabelID?: string;
  homeCardCreatorLabelEN?: string;

  // Photo bubble text management fields
  bubbleSayLabelID?: string;
  bubbleSayLabelEN?: string;
  bubbleChatTextID?: string;
  bubbleChatTextEN?: string;
  bubbleFollowerTextID?: string;
  bubbleFollowerTextEN?: string;
  bubbleFollowerCount?: string;
  bubbleCollabTitleID?: string;
  bubbleCollabTitleEN?: string;
  bubbleCollabDescID?: string;
  bubbleCollabDescEN?: string;

  // Intro Splash Animation setting
  enableIntroAnimation?: boolean;
}

export interface VisitorLog {
  id: string;
  visitorId: string;
  timestamp: string; // ISO string
  lastActive?: string;
  ip?: string;
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  deviceType?: 'Mobile' | 'Desktop' | 'Tablet';
  browser?: string;
  os?: string;
  screenResolution?: string;
  referrer?: string;
  visitedSections?: string[];
  durationSeconds?: number;
  visitCount?: number;
}