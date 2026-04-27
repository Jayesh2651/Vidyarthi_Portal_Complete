import {
  BookOpenText,
  ClipboardList,
  FileQuestion,
  FlaskConical,
  LayoutDashboard,
  Link2,
  Newspaper,
  PenSquare,
  ScrollText,
  UploadCloud,
} from 'lucide-react'

export const publicNavigation = [
  { label: 'Home', path: '/' },
  { label: 'Courses', path: '/course' },
  { label: 'Syllabus', path: '/syllabus' },
  { label: 'Assignments', path: '/home_assignments' },
  { label: 'Unit Tests', path: '/unit_tests' },
  { label: 'Question Papers', path: '/question_papers' },
  { label: 'Practicals', path: '/practicals' },
]

export const portalHighlights = [
  {
    title: 'Courses',
    description: 'Browse the program roadmap year by year.',
    path: '/course',
    icon: BookOpenText,
  },
  {
    title: 'Syllabus',
    description: 'Open the latest uploaded syllabus PDFs.',
    path: '/syllabus',
    icon: ScrollText,
  },
  {
    title: 'Assignments',
    description: 'Filter theory and practical work by class and semester.',
    path: '/home_assignments',
    icon: ClipboardList,
  },
  {
    title: 'Unit Tests',
    description: 'Access theory and practical unit test files.',
    path: '/unit_tests',
    icon: PenSquare,
  },
  {
    title: 'Question Papers',
    description: 'Review previous university exam papers by year.',
    path: '/question_papers',
    icon: FileQuestion,
  },
  {
    title: 'Practicals',
    description: 'See the practical structure for each academic year.',
    path: '/practicals',
    icon: FlaskConical,
  },
]

export const adminActions = [
  {
    title: 'Upload Syllabus',
    description: 'Add new syllabus PDFs by class, subject, and year.',
    path: '/upload_syllabus',
    icon: ScrollText,
    countKey: 'syllabi',
  },
  {
    title: 'Upload Unit Test',
    description: 'Publish fresh theory and practical unit test PDFs.',
    path: '/upload_unit_test',
    icon: PenSquare,
    countKey: 'unit_tests',
  },
  {
    title: 'Upload Assignments',
    description: 'Share assignment PDFs for students in a couple of clicks.',
    path: '/upload-assignment',
    icon: UploadCloud,
    countKey: 'assignments',
  },
  {
    title: 'Upload News & Links',
    description: 'Post campus updates and important reference links.',
    path: '/upload_news_links',
    icon: Newspaper,
    countKey: 'news_events',
  },
  {
    title: 'Upload Question Paper',
    description: 'Add past papers mapped to class and exam session.',
    path: '/upload_question_paper',
    icon: FileQuestion,
    countKey: 'question_papers',
  },
  {
    title: 'Create Unit Test',
    description: 'Compose formatted question papers with text and equations.',
    path: '/create_unit_test',
    icon: LayoutDashboard,
  },
]

export const staffProfiles = [
  {
    name: 'Prof. Asha Deshpande',
    role: 'Head of Department, Computer Science',
  },
  {
    name: 'Mr. Rajiv Kulkarni',
    role: 'Senior Lecturer, Programming',
  },
  {
    name: 'Mrs. Priya Shinde',
    role: 'Assistant Professor, Electronics',
  },
]

export const courses = [
  {
    label: 'First Year (FY)',
    description: 'Build strong academic foundations and lab confidence.',
    subjects: ['Basic Sciences', 'Introduction to Lab Work', 'Environmental Science'],
  },
  {
    label: 'Second Year (SY)',
    description: 'Move into specialization subjects and practical depth.',
    subjects: ['Specialization Subjects Begin', 'Practical Skill Development', 'Group Assignments'],
  },
  {
    label: 'Third Year (TY)',
    description: 'Focus on advanced study, research, and project work.',
    subjects: ['Advanced Research Topics', 'Industrial Projects', 'Final Year Viva & Report'],
  },
]

export const practicals = [
  {
    label: 'First Year (FY)',
    items: ['Practical 1 - Basics of Lab', 'Practical 2 - Instrument Handling', 'Practical 3 - Safety Procedures', 'Practical 4 - Simple Experiment'],
  },
  {
    label: 'Second Year (SY)',
    items: ['Practical 1 - Chemical Reactions', 'Practical 2 - Measuring Techniques', 'Practical 3 - pH & Titration', 'Practical 4 - Thermodynamics'],
  },
  {
    label: 'Third Year (TY)',
    items: ['Practical 1 - Organic Synthesis', 'Practical 2 - Spectroscopy', 'Practical 3 - Project Work', 'Practical 4 - Final Submission'],
  },
]

export const contactBlocks = [
  {
    title: 'Contact Us',
    body: 'Vidyarthi Mitra Portal\nXYZ College Campus\nPune, Maharashtra',
  },
  {
    title: 'Email',
    body: 'support@vidyarthimitra.edu.in',
  },
  {
    title: 'Phone',
    body: '+91 98765 43210',
  },
]

export const assignmentClasses = [
  { value: 'fy', label: 'FY' },
  { value: 'sy', label: 'SY' },
  { value: 'ty', label: 'TY' },
]

export const assignmentYears = [
  { value: '2022', label: '2022-23' },
  { value: '2023', label: '2023-24' },
  { value: '2024', label: '2024-25' },
  { value: '2025', label: '2025-26' },
]

export const assignmentSemesters = [
  { value: 'sem1', label: 'Semester 1' },
  { value: 'sem2', label: 'Semester 2' },
  { value: 'sem3', label: 'Semester 3' },
  { value: 'sem4', label: 'Semester 4' },
  { value: 'sem5', label: 'Semester 5' },
  { value: 'sem6', label: 'Semester 6' },
]

export const syllabusClasses = [
  { value: 'FY', label: 'FY' },
  { value: 'SY', label: 'SY' },
  { value: 'TY', label: 'TY' },
]

export const questionPaperClasses = [
  { value: 'fy', label: 'First Year (FY)' },
  { value: 'sy', label: 'Second Year (SY)' },
  { value: 'ty', label: 'Third Year (TY)' },
]

export const questionPaperExams = [
  { value: 'Oct/Nov 2023', label: 'Oct/Nov 2023' },
  { value: 'March/April 2024', label: 'March/April 2024' },
  { value: 'Oct/Nov 2024', label: 'Oct/Nov 2024' },
  { value: 'March/April 2025', label: 'March/April 2025' },
]

export const homeInfoBlocks = [
  {
    title: 'Academic resources in one place',
    description:
      'Assignments, unit tests, syllabus files, and question papers all stay reachable from one clean student-facing experience.',
  },
  {
    title: 'Teacher tools without clutter',
    description:
      'The admin area keeps uploads simple so teachers can publish updates quickly and students see them immediately.',
  },
  {
    title: 'Built around the original portal',
    description:
      'The structure still feels like Vidyarthi Mitra, just smoother, faster, and easier to move through.',
  },
]

export const dashboardHighlights = [
  {
    title: 'Important Links',
    description: 'Keep institutional references one click away.',
    icon: Link2,
  },
]
