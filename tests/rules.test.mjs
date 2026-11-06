// Firebase rules tests. Run (needs Java + network for the emulator jar), from a scratch dir that has
// firebase-tools, @firebase/rules-unit-testing and firebase installed, and a copy of database.rules.json as rules.json:
//   npx firebase emulators:exec --only database --project demo-g2p "node rules.test.mjs"
// Not part of the deploy surface and not run by hooks (the repo has no package.json on purpose).
import { initializeTestEnvironment, assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
import { readFileSync } from "node:fs";
const env = await initializeTestEnvironment({ projectId: "demo-g2p", database: { host: "127.0.0.1", port: 9100, rules: readFileSync("rules.json","utf8") } });
const anon = env.unauthenticatedContext().database();
const admin = env.authenticatedContext("IIdfYqliTrdlYqjS0swd0swlRkV2").database();
let pass=0, fail=0;
const ok = async (name, p, expect=true) => { try { await (expect?assertSucceeds(p):assertFails(p)); pass++; console.log("  ✓", name);} catch(e){ fail++; console.log("  ✗", name, String(e.message).slice(0,100)); } };
// seed
await env.withSecurityRulesDisabled(async c => { const d=c.database(); await d.ref("gallery/g1").set({img:"data:image/jpeg;base64,AAA",caption:"x",timestamp:1,votes:0}); await d.ref("forum/f1").set({title:"t",body:"b",author:"a",upvotes:0,downvotes:0,date:"d"}); await d.ref("leaderboard/Ana").set({name:"Ana",points:10}); await d.ref("games/c1/g1").set({sport:"basket",createdBy:"a",timestamp:1,playerCount:1}); await d.ref("pixels/1_1").set("#112233"); });
console.log("legit client writes");
await ok("gallery push", anon.ref("gallery/new1").set({courtId:"c1",img:"data:image/jpeg;base64,AAA",caption:"hi",author:"x",votes:0,timestamp:1}));
await ok("gallery vote +1", anon.ref("gallery/g1/votes").set(1));
await ok("pixel set", anon.ref("pixels/3_4").set("#AABBCC"));
await ok("presence set", anon.ref("presence/vk123").set(true));
await ok("achievement set", anon.ref("achievements/vk1/vocal").set(Date.now()));
await ok("booking set", anon.ref("bookings/c1/2026-11-10/10-00").set({name:"A",uid:"g1",hour:"10:00",ts:1}));
await ok("booking cancel", anon.ref("bookings/c1/2026-11-10/10-00").remove());
await ok("adoption set", anon.ref("adoptions/c1/vk1").set({name:"A",ts:1}));
await ok("adoption remove", anon.ref("adoptions/c1/vk1").remove());
await ok("task volunteer", anon.ref("tasks/c1/paint/volunteers/vk1").set("Ana"));
await ok("leaderboard +10", anon.ref("leaderboard/Ana").set({name:"Ana",points:20}));
await ok("leaderboard new", anon.ref("leaderboard/Bob").set({name:"Bob",points:10}));
await ok("game create", anon.ref("games/c1/g2").set({sport:"basket",maxPlayers:6,note:"",createdBy:"A",playerCount:1,timestamp:1}));
await ok("game playerCount +1", anon.ref("games/c1/g1/playerCount").set(2));
await ok("game remove", anon.ref("games/c1/g2").remove());
await ok("rating", anon.ref("ratings/c1/vk1").set({surface:4,userName:"A",ts:1}));
await ok("follow set/remove", anon.ref("follows/vk1/c1").set(true));
await ok("forum post", anon.ref("forum/f2").set({title:"t",body:"b",author:"a",upvotes:0,downvotes:0,date:"d",pinned:false}));
await ok("forum upvote", anon.ref("forum/f1/upvotes").set(1));
await ok("forum reply", anon.ref("forum/f1/replies/r1").set({author:"a",body:"hi",date:"d"}));
await ok("letterCount +1", anon.ref("letterCount/total").set(1));
console.log("attacks must fail");
await ok("wipe gallery", anon.ref("gallery").set(null), false);
await ok("wipe leaderboard", anon.ref("leaderboard").remove(), false);
await ok("wipe pixels", anon.ref("pixels").remove(), false);
await ok("overwrite gallery entry", anon.ref("gallery/g1").set({img:"http://evil/x.png",caption:"x",timestamp:1}), false);
await ok("external img url", anon.ref("gallery/new2").set({img:"https://evil.example/t.gif",caption:"x",timestamp:1}), false);
await ok("huge gallery img", anon.ref("gallery/new3").set({img:"data:image/jpeg;base64,"+"A".repeat(500000),caption:"x",timestamp:1}), false);
await ok("bad pixel color", anon.ref("pixels/3_5").set("red"), false);
await ok("pixel out of key format", anon.ref("pixels/abc").set("#AABBCC"), false);
await ok("votes +1000 gallery", anon.ref("gallery/g1/votes").set(1000), false);
await ok("leaderboard +9999", anon.ref("leaderboard/Ana").set({name:"Ana",points:9999}), false);
await ok("letterCount +500", anon.ref("letterCount/total").set(500), false);
await ok("forum upvote +50", anon.ref("forum/f1/upvotes").set(50), false);
await ok("forum huge body", anon.ref("forum/f3").set({title:"t",body:"x".repeat(5000),author:"a"}), false);
await ok("overwrite forum post", anon.ref("forum/f1").set({title:"hacked",body:"b",author:"a"}), false);
await ok("write junk root node", anon.ref("evil").set(1), false);
await ok("wipe games", anon.ref("games").remove(), false);
console.log("admin");
await ok("admin delete gallery entry", admin.ref("gallery/g1").remove());
await ok("admin wipe forum entry", admin.ref("forum/f1").remove());
await env.cleanup();
console.log(`${pass} passed, ${fail} failed`); process.exit(fail?1:0);
