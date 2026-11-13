import { loadQRious, useApp } from "../../app/core.js";
import { SITE } from "../../data/constants.js";
import { useEffect, useRef } from "../../lib/react.js";

export function CourtQRCard(props) {
  var court = props.court, onClose = props.onClose;
  var appCtx = useApp();
  var t = appCtx.t, lang = appCtx.lang;
  var canvasRef = useRef(null);
  var url = SITE + "/#court-" + court.id;

  useEffect(function() {
    loadQRious().then(function() {
      if (!canvasRef.current) return;
      new QRious({ element:canvasRef.current, value:url, size:220, backgroundAlpha:0, foreground:"#10B981", level:"H" });
    }).catch(function(){});
  }, []);

  var download = function() {
    if (!canvasRef.current) return;
    var offscreen = document.createElement("canvas");
    offscreen.width = 320; offscreen.height = 380;
    var ctx = offscreen.getContext("2d");
    ctx.fillStyle = "#0B0E18";
    if (ctx.roundRect) { ctx.roundRect(0,0,320,380,16); } else { ctx.fillRect(0,0,320,380); }
    ctx.fill();
    ctx.drawImage(canvasRef.current, 50, 40, 220, 220);
    ctx.fillStyle = "#10B981";
    ctx.font = "bold 14px 'Space Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(court.name, 160, 290);
    ctx.fillStyle = "#6B7280";
    ctx.font = "11px 'Libre Franklin', sans-serif";
    ctx.fillText("fromgreytoplay.netlify.app", 160, 312);
    ctx.fillStyle = "#10B981";
    ctx.font = "11px 'Space Mono', monospace";
    ctx.fillText("Scan pentru detalii / Scan for details", 160, 340);
    var a = document.createElement("a");
    a.download = "qr-" + court.id + ".png";
    a.href = offscreen.toDataURL("image/png");
    a.click();
  };

  return React.createElement("div", {
    style:{position:"fixed",inset:0,zIndex:8000,background:"rgba(8,10,22,.8)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"},
    onClick:onClose
  },
    React.createElement("div", {
      className:"card", style:{maxWidth:340,width:"100%",padding:"1.5rem",textAlign:"center"},
      onClick:function(e){e.stopPropagation();}
    },
      React.createElement("h3", { className:"mb-1", style:{fontFamily:"'Space Mono',monospace",fontSize:"1rem"} },
        t.qrCardTitle || "Cod QR pentru teren"
      ),
      React.createElement("p", { className:"text-xs mb-2", style:{color:"var(--textSec)"} }, court.name),
      React.createElement("div", { style:{background:"#0B0E18",borderRadius:12,padding:"1rem",display:"inline-block",marginBottom:"1rem"} },
        React.createElement("canvas", { ref:canvasRef, style:{display:"block",borderRadius:8} })
      ),
      React.createElement("p", { className:"text-xs mb-2", style:{color:"var(--textSec)",wordBreak:"break-all"} }, url),
      React.createElement("div", { className:"flex gap-1 justify-center" },
        React.createElement("button", { className:"btn btn-green btn-sm", onClick:download }, (t.qrDownload||"Descarcă QR")),
        React.createElement("button", { className:"btn btn-outline btn-sm", onClick:onClose }, t.close||"Închide")
      )
    )
  );
}
