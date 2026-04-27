import { contactBlocks } from '../../data/portalContent'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="page-container footer-grid">
        {contactBlocks.map((block) => (
          <section className="footer-card" key={block.title}>
            <h3>{block.title}</h3>
            <p>{block.body}</p>
          </section>
        ))}
      </div>
      <div className="footer-meta">(c) 2025 Vidyarthi Mitra | Designed for Educational Excellence</div>
    </footer>
  )
}
