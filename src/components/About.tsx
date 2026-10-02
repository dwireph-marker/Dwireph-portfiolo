import "./styles/About.css";
import { useCMS } from "../context/CMSContext";



const About = () => {
  const { content } = useCMS();
  const about = content.about;

  const title = about.title;
  const lead = about.leadParagraph;
  const para1 = about.subParagraph1;
  const para2 = about.subParagraph2;
  const badges = about.badges;
  const stats = about.stats;

  return (
    <div className="about-section" id="about">
      <div className="about-dashboard section-container">
        <div className="about-info-col">
          <h3 className="title">{title}</h3>
          <p className="para">{lead}</p>
          <p className="para-sub">{para1}</p>
          <p className="para-sub">{para2}</p>
          <div className="tech-badges-row">
            {badges.map((b, idx) => (
              <span key={idx} className="tech-badge">
                {b}
              </span>
            ))}
          </div>
        </div>

        <div className="about-stats-col">
          {stats.map((stat, idx) => (
            <div key={stat.id || idx} className="stats-card glass-panel">
              <div className={`stats-accent-glow glow-${stat.glow}`}></div>
              <span className="stats-number">{stat.number}</span>
              <span className="stats-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
