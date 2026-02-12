"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Billy SVG Components ───────────────────────────────────────
const BillyBase = ({ expression = "normal", size = 200, className = "" }) => {
  const expressions = {
    normal: { leftEye: "open", rightEye: "open", mouth: "smile", brows: "normal" },
    wink: { leftEye: "open", rightEye: "closed", mouth: "grin", brows: "normal" },
    shocked: { leftEye: "wide", rightEye: "wide", mouth: "open", brows: "raised" },
    happy: { leftEye: "happy", rightEye: "happy", mouth: "big-smile", brows: "normal" },
    thinking: { leftEye: "open", rightEye: "squint", mouth: "flat", brows: "raised-one" },
    sad: { leftEye: "sad", rightEye: "sad", mouth: "sad", brows: "sad" },
    searching: { leftEye: "squint", rightEye: "squint", mouth: "flat", brows: "focused" },
  };
  const expr = expressions[expression] || expressions.normal;

  const renderEye = (cx, isRight) => {
    const state = isRight ? expr.rightEye : expr.leftEye;
    if (state === "closed") return <path d={`M${cx-5},52 Q${cx},48 ${cx+5},52`} stroke="#3D2C1E" strokeWidth="2.5" fill="none" strokeLinecap="round"/>;
    if (state === "wide") return (<><ellipse cx={cx} cy="50" rx="7" ry="8" fill="white" stroke="#3D2C1E" strokeWidth="1.5"/><circle cx={cx} cy="49" r="4.5" fill="#3D2C1E"/><circle cx={cx+1.5} cy="47.5" r="1.5" fill="white"/></>);
    if (state === "happy") return <path d={`M${cx-5},52 Q${cx},46 ${cx+5},52`} stroke="#3D2C1E" strokeWidth="2.5" fill="none" strokeLinecap="round"/>;
    if (state === "sad") return (<><ellipse cx={cx} cy="52" rx="5.5" ry="6" fill="white" stroke="#3D2C1E" strokeWidth="1.5"/><circle cx={cx} cy="53" r="3.5" fill="#3D2C1E"/><circle cx={cx+1} cy="51.5" r="1.2" fill="white"/></>);
    if (state === "squint") return (<><ellipse cx={cx} cy="51" rx="5" ry="4.5" fill="white" stroke="#3D2C1E" strokeWidth="1.5"/><circle cx={cx} cy="51" r="3" fill="#3D2C1E"/><circle cx={cx+1} cy="50" r="1" fill="white"/></>);
    return (<><ellipse cx={cx} cy="51" rx="5.5" ry="6" fill="white" stroke="#3D2C1E" strokeWidth="1.5"/><circle cx={cx} cy="51" r="3.8" fill="#3D2C1E"/><circle cx={cx+1.5} cy="49.5" r="1.3" fill="white"/></>);
  };

  const renderMouth = () => {
    if (expr.mouth === "grin") return <path d="M44,67 Q50,74 56,67" stroke="#3D2C1E" strokeWidth="2" fill="none" strokeLinecap="round"/>;
    if (expr.mouth === "open") return <ellipse cx="50" cy="68" rx="5" ry="6" fill="#3D2C1E"/>;
    if (expr.mouth === "big-smile") return (<><path d="M42,65 Q50,76 58,65" stroke="#3D2C1E" strokeWidth="2" fill="#3D2C1E" strokeLinecap="round"/><path d="M43,65 Q50,60 57,65" fill="#3D2C1E"/></>);
    if (expr.mouth === "flat") return <path d="M44,67 L56,67" stroke="#3D2C1E" strokeWidth="2" strokeLinecap="round"/>;
    if (expr.mouth === "sad") return <path d="M43,70 Q50,64 57,70" stroke="#3D2C1E" strokeWidth="2" fill="none" strokeLinecap="round"/>;
    return <path d="M43,66 Q50,73 57,66" stroke="#3D2C1E" strokeWidth="2" fill="none" strokeLinecap="round"/>;
  };

  const renderBrows = () => {
    if (expr.brows === "raised") return (<><path d="M35,38 Q40,33 46,36" stroke="#5C3A1E" strokeWidth="2.5" fill="none" strokeLinecap="round"/><path d="M54,36 Q60,33 65,38" stroke="#5C3A1E" strokeWidth="2.5" fill="none" strokeLinecap="round"/></>);
    if (expr.brows === "raised-one") return (<><path d="M36,40 Q40,37 46,39" stroke="#5C3A1E" strokeWidth="2.5" fill="none" strokeLinecap="round"/><path d="M54,36 Q60,33 65,38" stroke="#5C3A1E" strokeWidth="2.5" fill="none" strokeLinecap="round"/></>);
    if (expr.brows === "sad") return (<><path d="M35,38 Q40,40 46,42" stroke="#5C3A1E" strokeWidth="2.5" fill="none" strokeLinecap="round"/><path d="M54,42 Q60,40 65,38" stroke="#5C3A1E" strokeWidth="2.5" fill="none" strokeLinecap="round"/></>);
    if (expr.brows === "focused") return (<><path d="M35,40 Q40,37 46,39" stroke="#5C3A1E" strokeWidth="2.5" fill="none" strokeLinecap="round"/><path d="M54,39 Q60,37 65,40" stroke="#5C3A1E" strokeWidth="2.5" fill="none" strokeLinecap="round"/></>);
    return (<><path d="M36,40 Q40,37 46,39" stroke="#5C3A1E" strokeWidth="2.5" fill="none" strokeLinecap="round"/><path d="M54,39 Q60,37 65,40" stroke="#5C3A1E" strokeWidth="2.5" fill="none" strokeLinecap="round"/></>);
  };

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className}>
      {/* Hair back */}
      <ellipse cx="50" cy="30" rx="30" ry="20" fill="#5C3A1E"/>
      {/* Head */}
      <ellipse cx="50" cy="55" rx="26" ry="28" fill="#FDDCB5"/>
      {/* Hair front - messy spikes */}
      <path d="M25,35 Q28,15 38,22 Q35,8 50,15 Q55,5 60,18 Q68,10 70,25 Q78,18 75,35" fill="#5C3A1E"/>
      <path d="M28,33 Q32,20 40,25 Q38,12 50,18 Q54,10 58,20 Q65,12 68,28 Q75,20 73,35" fill="#6B4423"/>
      {/* Ears */}
      <ellipse cx="24" cy="55" rx="5" ry="6" fill="#FDDCB5" stroke="#E8C9A0" strokeWidth="1"/>
      <ellipse cx="76" cy="55" rx="5" ry="6" fill="#FDDCB5" stroke="#E8C9A0" strokeWidth="1"/>
      {/* Glasses */}
      <ellipse cx="40" cy="51" rx="11" ry="10" fill="none" stroke="#3D2C1E" strokeWidth="2.5"/>
      <ellipse cx="60" cy="51" rx="11" ry="10" fill="none" stroke="#3D2C1E" strokeWidth="2.5"/>
      <path d="M51,51 L49,51" stroke="#3D2C1E" strokeWidth="2.5"/>
      <path d="M29,49 L24,47" stroke="#3D2C1E" strokeWidth="2"/>
      <path d="M71,49 L76,47" stroke="#3D2C1E" strokeWidth="2"/>
      {/* Glass lenses tint */}
      <ellipse cx="40" cy="51" rx="9.5" ry="8.5" fill="rgba(200,220,255,0.15)"/>
      <ellipse cx="60" cy="51" rx="9.5" ry="8.5" fill="rgba(200,220,255,0.15)"/>
      {/* Eyes */}
      {renderEye(40, false)}
      {renderEye(60, true)}
      {/* Eyebrows */}
      {renderBrows()}
      {/* Nose */}
      <path d="M49,58 Q50,60 51,58" stroke="#DEB896" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Mouth */}
      {renderMouth()}
      {/* Cheeks blush */}
      <ellipse cx="33" cy="62" rx="5" ry="3" fill="rgba(255,150,150,0.2)"/>
      <ellipse cx="67" cy="62" rx="5" ry="3" fill="rgba(255,150,150,0.2)"/>
    </svg>
  );
};

// ─── Magnifying Glass Accessory ───
const MagnifyingGlass = ({ size = 60 }) => (
  <svg viewBox="0 0 50 50" width={size} height={size}>
    <circle cx="22" cy="22" r="14" fill="none" stroke="#6B7280" strokeWidth="4"/>
    <circle cx="22" cy="22" r="11" fill="rgba(147,197,253,0.3)"/>
    <ellipse cx="17" cy="17" rx="4" ry="3" fill="rgba(255,255,255,0.5)" transform="rotate(-30,17,17)"/>
    <line x1="32" y1="32" x2="46" y2="46" stroke="#6B7280" strokeWidth="5" strokeLinecap="round"/>
  </svg>
);

// ─── Chat Bubble ───
const ChatBubble = ({ children, delay = 0, variant = "billy" }) => {
  const [visible, setVisible] = useState(delay === 0);
  useEffect(() => {
    if (delay > 0) {
      const t = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(t);
    }
  }, [delay]);

  if (!visible) return null;

  const isBilly = variant === "billy";
  return (
    <div style={{
      animation: "fadeSlideUp 0.4s ease-out",
      maxWidth: "85%",
      alignSelf: isBilly ? "flex-start" : "flex-end",
    }}>
      <div style={{
        background: isBilly ? "white" : "#EEF2FF",
        border: isBilly ? "2px solid #E2E8F0" : "2px solid #C7D2FE",
        borderRadius: isBilly ? "4px 18px 18px 18px" : "18px 4px 18px 18px",
        padding: "12px 18px",
        fontSize: "15px",
        lineHeight: "1.5",
        color: "#1E293B",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}>
        {children}
      </div>
    </div>
  );
};

// ─── Progress Bar ───
const ProgressBar = ({ progress }) => (
  <div style={{
    width: "100%",
    height: "8px",
    background: "#E2E8F0",
    borderRadius: "4px",
    overflow: "hidden",
  }}>
    <div style={{
      width: `${progress}%`,
      height: "100%",
      background: "linear-gradient(90deg, #2563EB, #10B981)",
      borderRadius: "4px",
      transition: "width 0.5s ease",
    }}/>
  </div>
);

// ─── Offer Card ───
const OfferCard = ({ offer, rank, engagement }) => {
  const medals = ["🥇", "🥈", "🥉"];
  const savingsColor = offer.savings > 200 ? "#059669" : offer.savings > 100 ? "#10B981" : "#6B7280";

  return (
    <div style={{
      background: "white",
      border: rank === 0 ? "2px solid #10B981" : "1px solid #E2E8F0",
      borderRadius: "16px",
      padding: "20px",
      boxShadow: rank === 0 ? "0 4px 20px rgba(16,185,129,0.12)" : "0 2px 8px rgba(0,0,0,0.04)",
      position: "relative",
      transition: "transform 0.2s",
    }}>
      {rank === 0 && (
        <div style={{
          position: "absolute",
          top: "-10px",
          right: "16px",
          background: "#10B981",
          color: "white",
          fontSize: "11px",
          fontWeight: "700",
          padding: "3px 10px",
          borderRadius: "20px",
          letterSpacing: "0.5px",
        }}>MEILLEURE ESTIMATION</div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
        <span style={{ fontSize: "24px" }}>{medals[rank] || "•"}</span>
        <div>
          <div style={{ fontWeight: "700", fontSize: "16px", color: "#0F172A" }}>{offer.provider}</div>
          <div style={{ fontSize: "13px", color: "#64748B" }}>{offer.plan}</div>
        </div>
      </div>

      <div style={{
        background: "#F0FDF4",
        borderRadius: "10px",
        padding: "12px 16px",
        marginBottom: "12px",
      }}>
        <div style={{ fontSize: "13px", color: "#64748B", marginBottom: "2px" }}>
          Économie potentielle estimée
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
          <span style={{ fontSize: "28px", fontWeight: "800", color: savingsColor, fontFamily: "'DM Mono', monospace" }}>
            ~{offer.savings}€
          </span>
          <span style={{ fontSize: "14px", color: "#64748B" }}>/an*</span>
        </div>
        <div style={{
          marginTop: "6px",
          height: "6px",
          background: "#D1FAE5",
          borderRadius: "3px",
          overflow: "hidden",
        }}>
          <div style={{
            width: `${Math.min(offer.savingsPercent, 100)}%`,
            height: "100%",
            background: savingsColor,
            borderRadius: "3px",
          }}/>
        </div>
        <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>
          soit environ ~{offer.savingsPercent}% de moins
        </div>
      </div>

      {engagement === "yes" && (
        <div style={{
          background: "#FEF3C7",
          border: "1px solid #FDE68A",
          borderRadius: "8px",
          padding: "8px 12px",
          fontSize: "12px",
          color: "#92400E",
          marginBottom: "12px",
          lineHeight: "1.4",
        }}>
          ⚠️ Tu as indiqué être engagé(e). Vérifie la date de fin de ton contrat et les éventuels frais de résiliation avant de changer.
        </div>
      )}

      {engagement === "unknown" && (
        <div style={{
          background: "#EFF6FF",
          border: "1px solid #BFDBFE",
          borderRadius: "8px",
          padding: "8px 12px",
          fontSize: "12px",
          color: "#1E40AF",
          marginBottom: "12px",
          lineHeight: "1.4",
        }}>
          ℹ️ Vérifie tes conditions d'engagement avant de souscrire. Cette information figure généralement sur ta facture ou ton espace client.
        </div>
      )}

      <div style={{ display: "flex", gap: "8px", fontSize: "12px", color: "#64748B", flexWrap: "wrap", marginBottom: "14px" }}>
        <span style={{ background: "#F1F5F9", padding: "3px 8px", borderRadius: "6px" }}>~{offer.priceKwh}€/kWh</span>
        <span style={{ background: "#F1F5F9", padding: "3px 8px", borderRadius: "6px" }}>{offer.type}</span>
        {offer.green && <span style={{ background: "#F0FDF4", padding: "3px 8px", borderRadius: "6px" }}>🌱 Vert</span>}
      </div>

      <button
        onClick={() => window.open("#", "_blank")}
        style={{
          width: "100%",
          padding: "12px",
          background: rank === 0 ? "#10B981" : "#F1F5F9",
          color: rank === 0 ? "white" : "#334155",
          border: "none",
          borderRadius: "10px",
          fontSize: "14px",
          fontWeight: "600",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
      >
        Voir cette offre →
      </button>
    </div>
  );
};

// ─── Disclaimer Component ───
const LegalDisclaimer = () => (
  <div style={{
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: "12px",
    padding: "16px",
    fontSize: "12px",
    color: "#64748B",
    lineHeight: "1.6",
    marginTop: "16px",
  }}>
    <div style={{ fontWeight: "600", marginBottom: "6px", color: "#475569" }}>* Informations importantes</div>
    <p style={{ margin: "0 0 6px 0" }}>
      Les estimations d'économies sont calculées sur la base des données extraites de ta facture et des tarifs publics des fournisseurs au moment de l'analyse. Elles sont indicatives et peuvent varier selon ton profil de consommation réel, les conditions contractuelles et les éventuelles promotions.
    </p>
    <p style={{ margin: "0 0 6px 0" }}>
      BillyCheck ne fournit pas de conseil financier ou juridique. Avant tout changement de fournisseur, vérifie les conditions de ton contrat actuel (durée d'engagement, frais de résiliation éventuels) et les conditions générales de la nouvelle offre.
    </p>
    <p style={{ margin: 0 }}>
      BillyCheck peut percevoir une commission du fournisseur si tu souscris via nos liens. Cela ne modifie pas le prix de l'offre pour toi.
    </p>
  </div>
);

// ─── FAQ Item ───
const FAQItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      borderBottom: "1px solid #E2E8F0",
      overflow: "hidden",
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          padding: "16px 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "15px",
          fontWeight: "600",
          color: "#0F172A",
          textAlign: "left",
        }}
      >
        {question}
        <span style={{
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.3s",
          fontSize: "18px",
          color: "#94A3B8",
          flexShrink: 0,
          marginLeft: "12px",
        }}>▼</span>
      </button>
      {open && (
        <div style={{
          padding: "0 0 16px 0",
          fontSize: "14px",
          color: "#475569",
          lineHeight: "1.6",
          animation: "fadeSlideUp 0.3s ease-out",
        }}>
          {answer}
        </div>
      )}
    </div>
  );
};

// ─── Main App ────────────────────────────────────────────────────
export default function BillyCheckApp() {
  const [step, setStep] = useState("home");
  const [file, setFile] = useState(null);
  const [engagement, setEngagement] = useState(null);
  const [progress, setProgress] = useState(0);
  const [billyMessages, setBillyMessages] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const appRef = useRef(null);

  // Scroll to top on step change
  useEffect(() => {
    if (appRef.current) {
      appRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [step]);

  // Processing simulation
  useEffect(() => {
    if (step !== "processing") return;

    const messages = [
      { text: "Je regarde ta facture... 🔍", delay: 0 },
      { text: "Hmm, je vois ton fournisseur...", delay: 2000 },
      { text: "Je compare avec les offres du marché...", delay: 4500 },
      { text: "Encore un petit instant... 📊", delay: 7000 },
      { text: "J'ai presque fini !", delay: 9000 },
    ];

    setBillyMessages([]);
    const timers = messages.map((msg, i) => 
      setTimeout(() => {
        setBillyMessages(prev => [...prev, msg.text]);
      }, msg.delay)
    );

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + Math.random() * 12 + 3;
      });
    }, 500);

    const doneTimer = setTimeout(() => {
      setStep("results");
    }, 11000);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(progressTimer);
      clearTimeout(doneTimer);
    };
  }, [step]);

  const handleFile = useCallback((f) => {
    if (!f) return;
    const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(f.type)) {
      alert("Format non supporté. Envoie un PDF, JPG ou PNG.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      alert("Fichier trop lourd (max 10 MB).");
      return;
    }
    setFile(f);
    setStep("engagement");
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const startProcessing = (engValue) => {
    setEngagement(engValue);
    setProgress(0);
    setStep("processing");
  };

  const resetApp = () => {
    setStep("home");
    setFile(null);
    setEngagement(null);
    setProgress(0);
    setBillyMessages([]);
  };

  // Mock results
  const mockResults = {
    scan: {
      provider: "ENGIE Electrabel",
      plan: "Easy Fix",
      amount: 127.5,
      consumption: 3500,
      unitPrice: 0.3214,
      postalCode: "1000",
    },
    offers: [
      { provider: "TotalEnergies", plan: "Pixie Energie", savings: 287, savingsPercent: 19, priceKwh: "0.2650", type: "Fixe 1 an", green: true },
      { provider: "Luminus", plan: "Fix Online", savings: 213, savingsPercent: 14, priceKwh: "0.2790", type: "Fixe 1 an", green: false },
      { provider: "Eneco", plan: "Sun Fix", savings: 156, savingsPercent: 10, priceKwh: "0.2910", type: "Fixe 1 an", green: true },
    ],
  };

  // FAQ data
  const faqs = [
    {
      question: "C'est vraiment gratuit le premier check ?",
      answer: "Oui ! Le premier check est totalement gratuit, sans inscription et sans carte bancaire. Les checks suivants sont à 0,99€ — moins qu'un café."
    },
    {
      question: "Qu'est-ce que tu fais de ma facture, Billy ?",
      answer: "Je lis ta facture pour en extraire les chiffres importants (montant, consommation, fournisseur). Ta facture est supprimée immédiatement après l'analyse. Je ne garde que les données chiffrées nécessaires à la comparaison — aucun nom, aucune adresse."
    },
    {
      question: "Comment tu gagnes de l'argent ?",
      answer: "Si tu décides de changer de fournisseur via un de mes liens, le fournisseur me verse une petite commission. Ça ne change absolument rien au prix de l'offre pour toi. C'est le même tarif que si tu y allais directement."
    },
    {
      question: "Les résultats sont-ils fiables ?",
      answer: "Les estimations sont basées sur les données de ta facture et les tarifs publics des fournisseurs. Ce sont des estimations indicatives — ton économie réelle peut varier selon ta consommation, la période, et les conditions spécifiques de chaque offre. Je te recommande toujours de vérifier les détails avant de souscrire."
    },
    {
      question: "C'est compliqué de changer de fournisseur ?",
      answer: "Non, en général c'est assez simple. Le nouveau fournisseur s'occupe de la plupart des démarches. Mais vérifie d'abord si tu es engagé(e) avec ton fournisseur actuel — il pourrait y avoir des frais de résiliation. Changer de fournisseur n'entraîne aucune coupure d'électricité."
    },
    {
      question: "Mes données sont protégées ?",
      answer: "Absolument. Ta facture est supprimée immédiatement après analyse. Je suis conforme au RGPD. Aucune donnée personnelle n'est conservée. Tu peux demander la suppression de tes données à tout moment via contact@billycheck.com."
    },
  ];

  return (
    <div ref={appRef} style={{
      minHeight: "100vh",
      background: "#FAFBFF",
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      color: "#0F172A",
      overflowY: "auto",
      maxHeight: "100vh",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;700&family=Nunito:wght@700;800;900&display=swap');
        
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes billyBounce {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-5px) rotate(-2deg); }
          75% { transform: translateY(-3px) rotate(2deg); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        .billy-float { animation: float 3s ease-in-out infinite; }
        .billy-bounce { animation: billyBounce 1.5s ease-in-out infinite; }
        
        .cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 16px 32px;
          background: #2563EB;
          color: white;
          border: none;
          border-radius: 14px;
          font-size: 17px;
          font-weight: 700;
          font-family: 'Nunito', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 14px rgba(37,99,235,0.25);
        }
        .cta-btn:hover {
          background: #1D4ED8;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(37,99,235,0.35);
        }
        .cta-btn:active { transform: translateY(0); }
        
        .cta-green {
          background: #10B981;
          box-shadow: 0 4px 14px rgba(16,185,129,0.25);
        }
        .cta-green:hover {
          background: #059669;
          box-shadow: 0 6px 20px rgba(16,185,129,0.35);
        }
        
        .section-title {
          font-family: 'Nunito', sans-serif;
          font-weight: 800;
          font-size: 26px;
          color: #0F172A;
          text-align: center;
          margin-bottom: 8px;
        }
        
        .dropzone {
          border: 2px dashed #CBD5E1;
          border-radius: 20px;
          padding: 40px 24px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
          background: white;
        }
        .dropzone:hover, .dropzone-active {
          border-color: #2563EB;
          background: #EFF6FF;
          box-shadow: 0 0 0 4px rgba(37,99,235,0.1);
        }
        
        .engagement-btn {
          padding: 14px 20px;
          border: 2px solid #E2E8F0;
          border-radius: 12px;
          background: white;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          color: #334155;
          width: 100%;
          text-align: left;
        }
        .engagement-btn:hover {
          border-color: #2563EB;
          background: #EFF6FF;
          color: #1D4ED8;
        }

        .navbar {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(250,251,255,0.9);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(226,232,240,0.6);
          padding: 12px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
      `}</style>

      {/* ─── NAVBAR ─── */}
      <div className="navbar">
        <div style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }} onClick={resetApp}>
          <BillyBase expression="wink" size={36} />
          <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: "900", fontSize: "20px" }}>
            <span style={{ color: "#2563EB" }}>Billy</span><span style={{ color: "#0F172A" }}>Check</span>
          </span>
        </div>
        {step !== "upload" && step !== "processing" && (
          <button className="cta-btn" style={{ padding: "10px 20px", fontSize: "14px" }} onClick={() => setStep("upload")}>
            🔍 Checker ma facture
          </button>
        )}
      </div>

      {/* ─── HOME ─── */}
      {step === "home" && (
        <div style={{ animation: "fadeSlideUp 0.5s ease-out" }}>
          {/* Hero */}
          <div style={{
            padding: "48px 20px 40px",
            textAlign: "center",
            background: "linear-gradient(180deg, #EFF6FF 0%, #FAFBFF 100%)",
          }}>
            <div className="billy-float" style={{ marginBottom: "16px" }}>
              <BillyBase expression="wink" size={140} />
            </div>
            <h1 style={{
              fontFamily: "'Nunito', sans-serif",
              fontWeight: "900",
              fontSize: "clamp(28px, 6vw, 42px)",
              lineHeight: "1.15",
              color: "#0F172A",
              marginBottom: "12px",
            }}>
              Hé 👋 Moi c'est <span style={{ color: "#2563EB" }}>Billy</span>.
            </h1>
            <p style={{
              fontSize: "18px",
              color: "#475569",
              maxWidth: "420px",
              margin: "0 auto 28px",
              lineHeight: "1.5",
            }}>
              Envoie-moi ta facture d'électricité, je te dis en 30 secondes si tu pourrais payer moins cher.
            </p>
            <button className="cta-btn" onClick={() => setStep("upload")} style={{ fontSize: "18px", padding: "18px 36px" }}>
              🔍 Checker ma facture
            </button>
            <p style={{ fontSize: "13px", color: "#94A3B8", marginTop: "14px" }}>
              Gratuit · Sans inscription · Facture supprimée après analyse
            </p>
          </div>

          {/* How it works */}
          <div style={{ padding: "48px 20px", maxWidth: "600px", margin: "0 auto" }}>
            <h2 className="section-title">Comment ça marche ?</h2>
            <p style={{ textAlign: "center", color: "#64748B", fontSize: "15px", marginBottom: "32px" }}>
              Trois étapes. 30 secondes. C'est tout.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {[
                { icon: "📸", title: "Envoie ta facture", desc: "Photo, PDF ou capture d'écran — tout marche.", billy: "normal" },
                { icon: "🔍", title: "Billy analyse", desc: "Je lis ta facture et je compare avec les offres du marché.", billy: "searching" },
                { icon: "💡", title: "Tu découvres le résultat", desc: "Je te montre les offres qui pourraient te convenir, avec une estimation des économies possibles.", billy: "happy" },
              ].map((s, i) => (
                <div key={i} style={{
                  display: "flex",
                  gap: "16px",
                  alignItems: "flex-start",
                  background: "white",
                  padding: "20px",
                  borderRadius: "16px",
                  border: "1px solid #E2E8F0",
                }}>
                  <div style={{
                    width: "48px",
                    height: "48px",
                    background: "#EFF6FF",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    flexShrink: 0,
                  }}>{s.icon}</div>
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "16px", marginBottom: "4px" }}>{s.title}</div>
                    <div style={{ fontSize: "14px", color: "#64748B", lineHeight: "1.5" }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust */}
          <div style={{ padding: "32px 20px 48px", maxWidth: "600px", margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "14px" }}>
              {[
                { icon: "🔒", title: "Confidentiel", desc: "Ta facture est supprimée immédiatement après analyse" },
                { icon: "🎁", title: "1er check gratuit", desc: "Puis 0,99€ — moins qu'un café" },
                { icon: "⚡", title: "30 secondes", desc: "Billy va vite. Très vite." },
              ].map((t, i) => (
                <div key={i} style={{
                  background: "white",
                  border: "1px solid #E2E8F0",
                  borderRadius: "14px",
                  padding: "20px 16px",
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: "28px", marginBottom: "8px" }}>{t.icon}</div>
                  <div style={{ fontWeight: "700", fontSize: "14px", marginBottom: "4px" }}>{t.title}</div>
                  <div style={{ fontSize: "13px", color: "#64748B", lineHeight: "1.4" }}>{t.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div style={{ padding: "32px 20px 48px", maxWidth: "600px", margin: "0 auto" }}>
            <h2 className="section-title" style={{ marginBottom: "24px" }}>Questions fréquentes</h2>
            <div style={{
              background: "white",
              borderRadius: "16px",
              border: "1px solid #E2E8F0",
              padding: "0 20px",
            }}>
              {faqs.map((faq, i) => <FAQItem key={i} {...faq} />)}
            </div>
          </div>

          {/* Final CTA */}
          <div style={{
            padding: "48px 20px",
            textAlign: "center",
            background: "linear-gradient(180deg, #FAFBFF 0%, #EFF6FF 100%)",
          }}>
            <BillyBase expression="happy" size={100} />
            <h2 style={{
              fontFamily: "'Nunito', sans-serif",
              fontWeight: "800",
              fontSize: "24px",
              marginTop: "12px",
              marginBottom: "8px",
            }}>Allez, montre-moi cette facture.</h2>
            <p style={{ color: "#64748B", fontSize: "15px", marginBottom: "24px" }}>
              En 30 secondes, tu sauras si tu pourrais payer moins.
            </p>
            <button className="cta-btn" onClick={() => setStep("upload")}>
              🔍 Checker ma facture gratuitement
            </button>
          </div>

          {/* Footer */}
          <footer style={{
            padding: "24px 20px",
            borderTop: "1px solid #E2E8F0",
            textAlign: "center",
            fontSize: "12px",
            color: "#94A3B8",
          }}>
            <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap", marginBottom: "8px" }}>
              <span style={{ cursor: "pointer" }}>Politique de confidentialité</span>
              <span>·</span>
              <span style={{ cursor: "pointer" }}>CGU</span>
              <span>·</span>
              <span style={{ cursor: "pointer" }}>Mentions légales</span>
              <span>·</span>
              <span>contact@billycheck.com</span>
            </div>
            <div>BillyCheck © 2026 — Billy ne fournit pas de conseil financier ou juridique.</div>
          </footer>
        </div>
      )}

      {/* ─── UPLOAD ─── */}
      {step === "upload" && (
        <div style={{ padding: "32px 20px", maxWidth: "500px", margin: "0 auto", animation: "fadeSlideUp 0.4s ease-out" }}>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div className="billy-float">
              <BillyBase expression="normal" size={120} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
            <ChatBubble>
              <strong>Envoie-moi ta facture !</strong>
              <br/>Photo, PDF, capture d'écran... tout fonctionne.
            </ChatBubble>
          </div>

          <div
            className={`dropzone ${dragOver ? "dropzone-active" : ""}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>📄</div>
            <div style={{ fontWeight: "700", fontSize: "16px", marginBottom: "6px", color: "#334155" }}>
              Glisse ta facture ici
            </div>
            <div style={{ fontSize: "14px", color: "#64748B", marginBottom: "16px" }}>
              ou clique pour choisir un fichier
            </div>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 20px",
              background: "#2563EB",
              color: "white",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: "600",
            }}>
              📸 Choisir un fichier
            </div>
            <div style={{ fontSize: "12px", color: "#94A3B8", marginTop: "12px" }}>
              PDF, JPG ou PNG · 10 MB max
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/webp"
            style={{ display: "none" }}
            onChange={(e) => handleFile(e.target.files[0])}
          />

          <div style={{
            marginTop: "24px",
            display: "flex",
            gap: "8px",
            alignItems: "flex-start",
          }}>
            <span style={{ fontSize: "16px" }}>🔒</span>
            <p style={{ fontSize: "12px", color: "#94A3B8", lineHeight: "1.5" }}>
              Ta facture est supprimée immédiatement après analyse. Aucune donnée personnelle n'est conservée. Billy ne garde que les chiffres nécessaires à la comparaison.
            </p>
          </div>
        </div>
      )}

      {/* ─── ENGAGEMENT QUESTION ─── */}
      {step === "engagement" && (
        <div style={{ padding: "32px 20px", maxWidth: "500px", margin: "0 auto", animation: "fadeSlideUp 0.4s ease-out" }}>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <BillyBase expression="thinking" size={110} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" }}>
            <ChatBubble>
              <strong>Petite question avant de commencer</strong> 🤔
            </ChatBubble>
            <ChatBubble delay={400}>
              Es-tu actuellement engagé(e) avec ton fournisseur d'énergie ? Ça m'aide à te donner des infos plus adaptées.
            </ChatBubble>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
            <button className="engagement-btn" onClick={() => startProcessing("no")}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>✅</span>
                <div>
                  <div style={{ fontWeight: "700" }}>Non, je ne suis pas engagé(e)</div>
                  <div style={{ fontSize: "13px", color: "#64748B", fontWeight: "400" }}>Je peux changer de fournisseur quand je veux</div>
                </div>
              </div>
            </button>

            <button className="engagement-btn" onClick={() => startProcessing("yes")}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>📋</span>
                <div>
                  <div style={{ fontWeight: "700" }}>Oui, je suis engagé(e)</div>
                  <div style={{ fontSize: "13px", color: "#64748B", fontWeight: "400" }}>J'ai un contrat avec une durée minimale</div>
                </div>
              </div>
            </button>

            <button className="engagement-btn" onClick={() => startProcessing("unknown")}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>🤷</span>
                <div>
                  <div style={{ fontWeight: "700" }}>Je ne sais pas</div>
                  <div style={{ fontSize: "13px", color: "#64748B", fontWeight: "400" }}>Pas de souci, Billy t'expliquera comment vérifier</div>
                </div>
              </div>
            </button>
          </div>

          <div style={{
            background: "#F0FDF4",
            border: "1px solid #D1FAE5",
            borderRadius: "12px",
            padding: "14px 16px",
            fontSize: "13px",
            color: "#047857",
            lineHeight: "1.5",
          }}>
            <strong>💡 Comment vérifier ?</strong><br/>
            Regarde sur ta facture ou dans ton espace client en ligne. Tu y trouveras la mention "contrat fixe" avec une date de fin, ou "contrat variable" (généralement sans engagement).
          </div>

          {file && (
            <div style={{
              marginTop: "16px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 16px",
              background: "white",
              border: "1px solid #E2E8F0",
              borderRadius: "10px",
              fontSize: "13px",
              color: "#64748B",
            }}>
              <span>📎</span>
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
              <span style={{ color: "#10B981" }}>✓</span>
            </div>
          )}
        </div>
      )}

      {/* ─── PROCESSING ─── */}
      {step === "processing" && (
        <div style={{ padding: "32px 20px", maxWidth: "500px", margin: "0 auto", animation: "fadeSlideUp 0.4s ease-out" }}>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div className="billy-bounce">
              <BillyBase expression="searching" size={120} />
            </div>
          </div>

          <ProgressBar progress={Math.min(progress, 100)} />
          <div style={{ textAlign: "center", fontSize: "13px", color: "#94A3B8", marginTop: "6px", marginBottom: "24px" }}>
            {Math.min(Math.round(progress), 100)}%
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {billyMessages.map((msg, i) => (
              <ChatBubble key={i}>
                {msg}
              </ChatBubble>
            ))}
          </div>
        </div>
      )}

      {/* ─── RESULTS ─── */}
      {step === "results" && (
        <div style={{ padding: "24px 20px 48px", maxWidth: "560px", margin: "0 auto", animation: "fadeSlideUp 0.5s ease-out" }}>
          {/* Billy reaction */}
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <BillyBase expression="shocked" size={110} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
            <ChatBubble>
              <strong>J'ai trouvé des offres potentiellement intéressantes !</strong> 👀
            </ChatBubble>
            <ChatBubble delay={300}>
              D'après les données de ta facture, tu pourrais peut-être payer moins cher. Voici ce que j'ai repéré — à toi de voir si ça te convient.
            </ChatBubble>
          </div>

          {/* Current situation */}
          <div style={{
            background: "white",
            border: "1px solid #E2E8F0",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "20px",
          }}>
            <div style={{ fontSize: "13px", color: "#64748B", marginBottom: "8px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Ta facture actuelle
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <div style={{ fontSize: "12px", color: "#94A3B8" }}>Fournisseur</div>
                <div style={{ fontWeight: "700", fontSize: "15px" }}>{mockResults.scan.provider}</div>
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "#94A3B8" }}>Offre détectée</div>
                <div style={{ fontWeight: "700", fontSize: "15px" }}>{mockResults.scan.plan}</div>
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "#94A3B8" }}>Montant mensuel</div>
                <div style={{ fontWeight: "700", fontSize: "15px", fontFamily: "'DM Mono', monospace" }}>{mockResults.scan.amount}€</div>
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "#94A3B8" }}>Consommation estimée</div>
                <div style={{ fontWeight: "700", fontSize: "15px", fontFamily: "'DM Mono', monospace" }}>{mockResults.scan.consumption} kWh/an</div>
              </div>
            </div>

            <div style={{
              marginTop: "12px",
              padding: "8px 12px",
              background: "#FEF3C7",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#92400E",
              lineHeight: "1.4",
            }}>
              ℹ️ Ces données ont été extraites automatiquement de ta facture. Vérifie qu'elles correspondent bien à ta situation.
            </div>
          </div>

          {/* Offers */}
          <div style={{
            fontSize: "13px",
            color: "#64748B",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: "12px",
          }}>
            Offres potentiellement plus avantageuses
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "16px" }}>
            {mockResults.offers.map((offer, i) => (
              <OfferCard key={i} offer={offer} rank={i} engagement={engagement} />
            ))}
          </div>

          {/* Engagement-specific block */}
          {engagement === "unknown" && (
            <div style={{
              background: "#EFF6FF",
              border: "1px solid #BFDBFE",
              borderRadius: "14px",
              padding: "18px",
              marginBottom: "16px",
            }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <BillyBase expression="thinking" size={50} />
                <div>
                  <div style={{ fontWeight: "700", fontSize: "15px", marginBottom: "6px" }}>
                    Comment vérifier ton engagement ?
                  </div>
                  <div style={{ fontSize: "13px", color: "#475569", lineHeight: "1.6" }}>
                    <strong>Option 1 :</strong> Regarde ta facture — la mention "fixe" avec une date de fin indique un engagement.<br/>
                    <strong>Option 2 :</strong> Connecte-toi à l'espace client de ton fournisseur, la durée du contrat y est indiquée.<br/>
                    <strong>Option 3 :</strong> Appelle ton fournisseur et demande-leur directement.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Legal disclaimer */}
          <LegalDisclaimer />

          {/* Actions */}
          <div style={{ marginTop: "28px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Email alert */}
            <div style={{
              background: "white",
              border: "1px solid #E2E8F0",
              borderRadius: "14px",
              padding: "18px",
            }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
                <BillyBase expression="wink" size={40} />
                <div style={{ fontSize: "14px", color: "#334155", fontWeight: "600" }}>
                  Tu veux que je te prévienne si de meilleures offres apparaissent ?
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="email"
                  placeholder="ton@email.com"
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    border: "2px solid #E2E8F0",
                    borderRadius: "10px",
                    fontSize: "14px",
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                />
                <button style={{
                  padding: "10px 18px",
                  background: "#2563EB",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: "600",
                  fontSize: "14px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}>M'alerter</button>
              </div>
              <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "6px" }}>
                Pas de spam. Tu peux te désinscrire à tout moment.
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={resetApp}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#F1F5F9",
                  border: "1px solid #E2E8F0",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  color: "#334155",
                }}
              >
                🔄 Nouveau check
              </button>
              <button
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "white",
                  border: "1px solid #FCA5A5",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  color: "#DC2626",
                }}
              >
                🗑️ Supprimer mes données
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
