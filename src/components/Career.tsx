import { useEffect, useMemo } from "react";
import { setAllTimeline } from "./utils/GsapScroll";
import "./styles/Career.css";
import { useCMS } from "../context/CMSContext";
import { MapPin, Briefcase, Award, CheckCircle2 } from "lucide-react";



const Career = () => {
  const { content } = useCMS();
  const career = content.career;

  const entries = useMemo(() => career.entries.filter((e) => e.published !== false), [career.entries]);

  useEffect(() => {
    setAllTimeline();
  }, [entries]);

  return (
    <div className="career-section section-container" id="career">
      <div className="career-container">
        <h2>
          {career.title}
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>

          {entries.map((entry, idx) => {
            const rawResponsibilities = entry.responsibilities;
            const responsibilitiesList: string[] = Array.isArray(rawResponsibilities)
              ? rawResponsibilities
              : typeof rawResponsibilities === "string" && rawResponsibilities.trim()
              ? rawResponsibilities.split("\n").map((s) => s.trim()).filter(Boolean)
              : [];

            const rawTech = entry.technologies;
            const techList: string[] = Array.isArray(rawTech)
              ? rawTech
              : typeof rawTech === "string" && rawTech.trim()
              ? rawTech.split(",").map((s) => s.trim()).filter(Boolean)
              : [];

            const rawTools = entry.tools;
            const toolsList: string[] = Array.isArray(rawTools)
              ? rawTools
              : typeof rawTools === "string" && rawTools.trim()
              ? rawTools.split(",").map((s) => s.trim()).filter(Boolean)
              : [];

            const combinedPills = [...techList, ...toolsList];
            const achievementsText = Array.isArray(entry.achievements)
              ? entry.achievements.join("; ")
              : (entry.achievements || "").trim();

            return (
              <div key={entry.id || idx} className="career-info-box">
                <div className="career-info-in">
                  <div className="career-role">
                    <h4>{entry.role}</h4>
                    <h5>{entry.company}</h5>

                    {/* Location & Employment Type Badges (Only rendered if present) */}
                    {(entry.location || entry.employmentType) && (
                      <div className="career-meta-badges">
                        {entry.location && (
                          <span className="career-meta-pill">
                            <MapPin size={11} className="shrink-0 text-[#c2a4ff]" />
                            <span>{entry.location}</span>
                          </span>
                        )}
                        {entry.employmentType && (
                          <span className="career-meta-pill">
                            <Briefcase size={11} className="shrink-0 text-[#c2a4ff]" />
                            <span>{entry.employmentType}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="career-info-details">
                  <p>{entry.description}</p>

                  {/* Key Responsibilities (Only rendered if present) */}
                  {responsibilitiesList.length > 0 && (
                    <ul className="career-responsibilities-list">
                      {responsibilitiesList.map((resp, rIdx) => (
                        <li key={rIdx} className="career-resp-item">
                          <CheckCircle2 size={12} className="career-resp-icon" />
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Technologies & Tools Chips (Only rendered if present) */}
                  {combinedPills.length > 0 && (
                    <div className="career-tech-wrapper">
                      {combinedPills.map((pill, pIdx) => (
                        <span key={pIdx} className="career-tech-pill">
                          {pill}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Achievements Highlight (Only rendered if present) */}
                  {achievementsText && (
                    <div className="career-achievement-card">
                      <Award size={14} className="career-achievement-icon" />
                      <span>{achievementsText}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Career;
