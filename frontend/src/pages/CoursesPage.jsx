import { SectionIntro } from '../components/ui/SectionIntro'
import { courses } from '../data/portalContent'
import { usePageTitle } from '../hooks/usePageTitle'

export function CoursesPage() {
  usePageTitle('Courses')

  return (
    <div className="page-container page-stack">
      <section className="panel">
        <SectionIntro
          badge="Courses"
          centered
          title="B.Sc. academic structure"
          description="Explore the curriculum shape for each year of the program."
        />
        <div className="cards-grid cards-grid--three">
          {courses.map((course) => (
            <article className="resource-card" key={course.label}>
              <span className="resource-card__eyebrow">Academic Year</span>
              <h3>{course.label}</h3>
              <p className="resource-card__description">{course.description}</p>
              <ul className="detail-list">
                {course.subjects.map((subject) => (
                  <li key={subject}>{subject}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
