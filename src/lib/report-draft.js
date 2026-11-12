export function reportDraft() { try { return JSON.parse(sessionStorage.getItem("g2p_report_draft") || "null"); } catch (e) { return null; } }
