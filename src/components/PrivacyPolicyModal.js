import { useApp } from "../app/core.js";

/* === Privacy Policy Modal (RGPD / GDPR Art. 6(1)(a)) === */
export function PrivacyPolicyModal({ onClose }) {
  var _ref = useApp(), t = _ref.t, lang = _ref.lang;
  return React.createElement("div", { className: "modal-overlay", onClick: onClose },
    React.createElement("div", { className: "modal", onClick: function(e) { e.stopPropagation(); }, style: { maxWidth: 600, maxHeight: "80vh", overflowY: "auto" } },
      React.createElement("div", { className: "flex justify-between items-center mb-2" },
        React.createElement("h2", null, "🔒 ", t.privacyPolicy),
        React.createElement("button", { onClick: onClose, style: { background: "none", border: "none", fontSize: "1.4rem", color: "var(--text)" } }, "✕")
      ),
      React.createElement("div", { className: "text-sm", style: { lineHeight: 1.7, color: "var(--text)" } },
        React.createElement("h4", { className: "mb-1 mt-1" }, lang === "ro" ? "1. Cine prelucrează datele" : "1. Data controller"),
        React.createElement("p", { className: "mb-1", style: { color: "var(--textSec)" } },
          lang === "ro"
            ? "Operatorul de date este Cîmpan Teodor, coordonatorul platformei civice \"From Grey to Play\" (fromgreytoplay.netlify.app). Contact: teodor.cimpan12@gmail.com"
            : "Data controller: Cîmpan Teodor, coordinator of the civic platform \"From Grey to Play\" (fromgreytoplay.netlify.app). Contact: teodor.cimpan12@gmail.com"
        ),
        React.createElement("h4", { className: "mb-1 mt-2" }, lang === "ro" ? "2. Ce date colectăm" : "2. Data collected"),
        React.createElement("p", { className: "mb-1", style: { color: "var(--textSec)" } },
          lang === "ro"
            ? "Nume, adresă de email, opțiunea de vot, disponibilitate voluntariat, data semnăturii. Datele sunt stocate în Firebase Realtime Database (Google LLC, SUA), cu clauze contractuale standard UE."
            : "Name, email address, vote choice, volunteer availability, signature date. Data stored in Firebase Realtime Database (Google LLC, USA) with EU standard contractual clauses."
        ),
        React.createElement("h4", { className: "mb-1 mt-2" }, lang === "ro" ? "3. Scopul prelucrării" : "3. Purpose"),
        React.createElement("p", { className: "mb-1", style: { color: "var(--textSec)" } },
          lang === "ro"
            ? "Transmiterea petiției colective \"From Grey to Play\" către Primăria Municipiului Târgu Mureș și către Consiliul Local, în scopul solicitării renovării terenurilor sportive din cartierele periferice."
            : "Submission of the collective petition \"From Grey to Play\" to Târgu Mureș City Hall and Local Council, requesting renovation of peripheral sports courts."
        ),
        React.createElement("h4", { className: "mb-1 mt-2" }, lang === "ro" ? "4. Baza legală" : "4. Legal basis"),
        React.createElement("p", { className: "mb-1", style: { color: "var(--textSec)" } },
          "Art. 6(1)(a) RGPD — consimțământ explicit. / GDPR Art. 6(1)(a) — explicit consent."
        ),
        React.createElement("h4", { className: "mb-1 mt-2" }, lang === "ro" ? "5. Durata retenției" : "5. Retention"),
        React.createElement("p", { className: "mb-1", style: { color: "var(--textSec)" } },
          lang === "ro"
            ? "Datele se păstrează pe durata campaniei civice, maxim 3 ani de la data semnăturii, sau până la retragerea consimțământului."
            : "Data retained for the duration of the campaign, max 3 years from signature date, or until consent is withdrawn."
        ),
        React.createElement("h4", { className: "mb-1 mt-2" }, lang === "ro" ? "6. Drepturile tale" : "6. Your rights"),
        React.createElement("p", { className: "mb-1", style: { color: "var(--textSec)" } },
          lang === "ro"
            ? "Ai dreptul la: acces, rectificare, ștergere, portabilitate, opoziție. Contactează-ne la teodor.cimpan12@gmail.com. Ai dreptul să depui plângere la ANSPDCP (www.dataprotection.ro, 0318.059.211)."
            : "You have the right to: access, rectification, erasure, portability, objection. Contact: teodor.cimpan12@gmail.com. You may lodge a complaint with ANSPDCP (www.dataprotection.ro)."
        ),
        React.createElement("h4", { className: "mb-1 mt-2" }, lang === "ro" ? "7. Securitate" : "7. Security"),
        React.createElement("p", { className: "mb-1", style: { color: "var(--textSec)" } },
          lang === "ro"
            ? "Accesul la datele personale este restricționat la administratorul autentificat al platformei. Datele nu se transmit terților și nu se folosesc în scop comercial."
            : "Access to personal data is restricted to the authenticated platform administrator. Data is not shared with third parties or used commercially."
        ),
        React.createElement("p", { className: "mt-2 text-xs", style: { color: "var(--textSec)" } },
          lang === "ro" ? "Ultima actualizare: Iunie 2026" : "Last updated: June 2026"
        )
      ),
      React.createElement("button", { className: "btn btn-green btn-block mt-2", onClick: onClose },
        lang === "ro" ? "Am înțeles" : "Got it"
      )
    )
  );
}
