/* === Court Health Score Ring === */
export function getCourtHealthScore(court, allReports, ratingsData) {
  var score = 0;
  var cond = court.condition || 0;
  var rated = ratingsData && Object.keys(ratingsData).length > 0;
  // Without user ratings the condition carries the whole score (5/5 -> 90), so a perfect court is not stuck at 40.
  score += (cond / 5) * (rated ? 40 : 90);
  // Condition checks are verification, not open problems.
  var openReps = allReports ? Object.values(allReports).filter(function(r) { return r.courtId === court.id && r.status !== "resolved" && r.category !== "condition"; }).length : (court.reports || 0);
  score -= Math.min(openReps * 6, 24);
  if (ratingsData) {
    var rVals = Object.values(ratingsData);
    if (rVals.length > 0) {
      var avg = rVals.reduce(function(s,r) {
        var dims = [r.surface||0,r.lighting||0,r.equipment||0,r.safety||0];
        return s + dims.reduce(function(a,b){return a+b;},0)/4;
      }, 0) / rVals.length;
      score += (avg / 5) * 30;
    }
  }
  if (court.checkins) {
    var recent = Object.values(court.checkins).filter(function(c) { return Date.now() - (c.timestamp||0) < 7*24*3600*1000; }).length;
    score += Math.min(recent * 2, 10);
  }
  // Stadiums ("excellent") are kept to the top standard; a stray report never makes them look sick.
  if (court.status === "excellent") score = Math.max(score, 92);
  return Math.max(0, Math.min(100, Math.round(score)));
}
