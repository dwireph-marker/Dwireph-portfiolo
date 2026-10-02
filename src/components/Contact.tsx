import { useState, type FormEvent } from "react";
import { MdArrowOutward, MdCopyright } from "react-icons/md";
import { Send, Check, Loader2, User, Mail, MessageSquare, AlertCircle, Github, Linkedin, Twitter, Instagram, Globe } from "lucide-react";
import "./styles/Contact.css";
import { useCMS } from "../context/CMSContext";
import { cmsApi } from "../services/cmsApi";

const Contact = () => {
  const { content } = useCMS();
  const contact = content.contact;
  const socialLinks = content.socialLinks.filter((s) => s.enabled !== false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus("error");
      setErrorMsg("All fields are required!");
      return;
    }
    setStatus("sending");
    const result = await cmsApi.submitContact({ name: name.trim(), email: email.trim(), message: message.trim() });
    if (result.success) {
      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
      setTimeout(() => setStatus("idle"), 5000);
    } else {
      setStatus("error");
      setErrorMsg(result.error || "database error");
    }
  };

  const getPlatformIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case "github": return <Github size={16} />;
      case "linkedin": return <Linkedin size={16} />;
      case "twitter": return <Twitter size={16} />;
      case "instagram": return <Instagram size={16} />;
      default: return <Globe size={16} />;
    }
  };

  return (
    <div className="contact-section section-container" id="contact">
      <div className="contact-container">
        <h3 className="section-title">{contact.title}</h3>
        <div className="contact-flex-layout">
          <div className="contact-form-wrapper">
            <div className="contact-card-glass">
              <div className="card-top-glow" />
              <h4 className="form-header-title">Send a Message</h4>
              <p className="form-subtitle">{contact.subtitle}</p>
              <form onSubmit={handleSubmit} className="contact-real-form">
                <div className="form-field-group">
                  <label htmlFor="contact-name" className="field-label"><User size={13} className="label-icon" /><span>Your Name</span></label>
                  <input type="text" id="contact-name" value={name} onChange={(e) => setName(e.target.value)} className="form-input-element" disabled={status === "sending"} required />
                </div>
                <div className="form-field-group">
                  <label htmlFor="contact-email" className="field-label"><Mail size={13} className="label-icon" /><span>Email Address</span></label>
                  <input type="email" id="contact-email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-input-element" disabled={status === "sending"} required />
                </div>
                <div className="form-field-group">
                  <label htmlFor="contact-message" className="field-label"><MessageSquare size={13} className="label-icon" /><span>Your Message</span></label>
                  <textarea id="contact-message" value={message} onChange={(e) => setMessage(e.target.value)} className="form-textarea-element" rows={5} disabled={status === "sending"} required />
                </div>
                {status === "error" && <div className="status-banner-error"><AlertCircle size={15} /><span>{errorMsg}</span></div>}
                {status === "success" && <div className="status-banner-success"><Check size={15} /><span>Message sent!</span></div>}
                <button type="submit" disabled={status === "sending"} className={`submit-action-btn ${status === "sending" ? "btn-sending" : status === "success" ? "btn-success" : ""}`}>
                  {status === "sending" ? <><Loader2 size={16} className="animate-spin mr-2" /><span>Transmitting...</span></> : status === "success" ? <><Check size={16} className="mr-2" /><span>Message Sent!</span></> : <><Send size={15} className="mr-2" /><span>Send Message</span></>}
                </button>
              </form>
            </div>
          </div>
          <div className="contact-info-wrapper">
            <div className="info-section-group">
              <div className="contact-info-block">
                <h4>Direct Channels</h4>
                <p><span className="text-xs text-[#7c66a8] font-mono block mb-1">EMAIL</span><a href={`mailto:${contact.directEmail}`} data-cursor="disable" className="direct-channel-link">{contact.directEmail}</a></p>
                <p className="mt-4"><span className="text-xs text-[#7c66a8] font-mono block mb-1">PHONE</span><a href={`tel:${contact.directPhone.replace(/\s+/g, "")}`} data-cursor="disable" className="direct-channel-link">{contact.directPhone}</a></p>
              </div>
              <div className="contact-info-block mt-8">
                <h4>Digital Footprint</h4>
                <div className="social-links-grid">
                  {socialLinks.map((item) => <a key={item.id} href={item.url} target="_blank" rel="noreferrer" data-cursor="disable" className="contact-social-btn"><span className="flex items-center gap-2">{getPlatformIcon(item.icon)}<span>{item.platform}</span></span><MdArrowOutward /></a>)}
                </div>
              </div>
            </div>
            <div className="contact-designer-credit">
              <h2>{contact.designerCredit}</h2>
              <div className="copyright-line"><MdCopyright /> <span>{contact.copyright}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
