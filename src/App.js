import React, { useState } from 'react';
import { CHANGES, getSuite } from './data';

var BLUE   = '#003087';
var LBLUE  = '#0067B1';
var RED    = '#E4002B';
var GREEN  = '#00875A';
var AMBER  = '#FF8B00';
var PURPLE = '#6554C0';
var TEAL   = '#00A896';
var WHITE  = '#FFFFFF';
var G100   = '#F0F2F5';
var G200   = '#E2E6EC';
var G400   = '#9AAABF';
var G600   = '#5A6A82';
var G800   = '#2C3A4F';

var TYPE_COLORS   = { 'Enhancement':'#7C3AED', 'Config Change':'#00A896', 'Quarterly Upgrade':'#FF6B35' };
var RISK_COLORS   = { 'CRITICAL':'#FF6B35', 'HIGH':'#FF8B00', 'MEDIUM':'#00A896', 'LOW':'#00875A' };
var STATUS_COLORS = { 'PASS':'#00875A', 'FAIL':'#FF4444', 'RUNNING':'#FF8B00' };
var CAT_COLORS    = { 'Functional':'#7C3AED', 'Integration':'#FF6B35', 'Regression':'#FF8B00', 'Smoke':'#00875A', 'API':'#00A896' };

var PHASES = [
  'Reading change ticket and extracting impact scope...',
  'Mapping affected GW modules and integration points...',
  'Generating targeted test cases...',
  'Building execution plan and CI/CD config...',
];

function NTTLogo() {
  return (
    <div style={{ display:'flex', flexDirection:'column', lineHeight:1 }}>
      <div style={{ display:'flex', alignItems:'baseline', gap:3 }}>
        <span style={{ fontFamily:'Arial Black,Arial', fontWeight:900, fontSize:20, color:BLUE }}>NTT</span>
        <span style={{ fontFamily:'Arial,sans-serif', fontWeight:700, fontSize:16, color:BLUE }}>DATA</span>
      </div>
      <div style={{ height:2, background:RED, marginTop:2, borderRadius:1 }}/>
    </div>
  );
}

function TestCard(props) {
  var t        = props.test;
  var expanded = props.expanded;
  var onToggle = props.onToggle;
  var pc  = { 'P1':'#FF6B35', 'P2':'#FF8B00', 'P3':'#00A896' }[t.p] || G400;
  var cc  = CAT_COLORS[t.cat] || G400;
  return (
    <div onClick={onToggle} style={{ background:WHITE, borderRadius:9, padding:'12px 14px', borderLeft:'3px solid '+pc, cursor:'pointer', marginBottom:8, boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ display:'flex', justifyContent:'space-between' }}>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          <span style={{ fontSize:9, color:G400, fontFamily:'monospace' }}>{t.id}</span>
          <span style={{ fontSize:9, fontWeight:700, color:pc, border:'1px solid '+pc, borderRadius:3, padding:'0 5px' }}>{t.p}</span>
          <span style={{ fontSize:9, color:cc, border:'1px solid '+cc, borderRadius:3, padding:'0 5px' }}>{t.cat}</span>
          <span style={{ fontSize:9, color:G600, border:'1px solid '+G200, borderRadius:3, padding:'0 5px' }}>{t.mod}</span>
          {t.auto && <span style={{ fontSize:9, color:GREEN, border:'1px solid '+GREEN, borderRadius:3, padding:'0 5px' }}>AUTO</span>}
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
          <span style={{ fontSize:9, color:G400 }}>{t.mins}m</span>
          <span style={{ fontSize:11, color:G400 }}>{expanded ? '^' : 'v'}</span>
        </div>
      </div>
      <div style={{ fontSize:12, fontWeight:700, color:G800, marginTop:6 }}>{t.title}</div>
      {expanded && (
        <div style={{ marginTop:10 }}>
          <div style={{ fontSize:10, color:G400, marginBottom:2 }}>PRECONDITIONS</div>
          <div style={{ fontSize:11, color:G600, marginBottom:8 }}>{t.preconditions}</div>
          <div style={{ fontSize:10, color:G400, marginBottom:5 }}>STEPS</div>
          {t.steps.map(function(step, si) {
            return (
              <div key={si} style={{ display:'flex', gap:8, marginBottom:5 }}>
                <div style={{ width:20, height:20, borderRadius:'50%', background:BLUE, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, color:WHITE, flexShrink:0 }}>{si+1}</div>
                <div style={{ fontSize:11, color:G800, lineHeight:1.5, paddingTop:2 }}>{step}</div>
              </div>
            );
          })}
          <div style={{ marginTop:7, padding:'7px 10px', background:'#E3FCEF', border:'1px solid '+GREEN, borderRadius:6 }}>
            <span style={{ fontSize:9, color:GREEN, fontWeight:700 }}>EXPECTED: </span>
            <span style={{ fontSize:11, color:G800 }}>{t.expected}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function PlanPanel(props) {
  var p = props.plan;
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
        {[{l:'Total',v:p.total,c:AMBER},{l:'Smoke',v:p.smoke,c:GREEN},{l:'Regression',v:p.regression,c:TEAL},{l:'Integration',v:p.integration,c:PURPLE}].map(function(s) {
          return (
            <div key={s.l} style={{ background:WHITE, border:'1px solid '+G200, borderRadius:9, padding:'13px 14px', textAlign:'center' }}>
              <div style={{ fontSize:26, fontWeight:800, color:s.c }}>{s.v}</div>
              <div style={{ fontSize:10, color:G400, marginTop:2 }}>{s.l}</div>
            </div>
          );
        })}
      </div>
      <div style={{ background:WHITE, border:'1px solid '+G200, borderRadius:9, padding:'14px 16px' }}>
        <div style={{ display:'flex', gap:20, marginBottom:12 }}>
          <div><div style={{ fontSize:9, color:G400 }}>DURATION</div><div style={{ fontSize:13, fontWeight:700, color:AMBER }}>{p.duration}</div></div>
          <div><div style={{ fontSize:9, color:G400 }}>PARALLELIZABLE</div><div style={{ fontSize:13, fontWeight:700, color:p.parallel ? GREEN : RED }}>{p.parallel ? 'YES' : 'NO'}</div></div>
        </div>
        <div style={{ fontSize:10, color:G400, marginBottom:8 }}>EXECUTION SEQUENCE</div>
        {p.sequence.map(function(step, i) {
          return (
            <div key={i} style={{ display:'flex', gap:9, marginBottom:6 }}>
              <div style={{ width:22, height:22, borderRadius:'50%', background:BLUE, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:WHITE, flexShrink:0 }}>{i+1}</div>
              <div style={{ fontSize:11, color:G800, lineHeight:1.5 }}>{step}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CICDPanel(props) {
  var c  = props.config;
  var id = props.changeId;
  var yaml = 'name: GW-Regression-' + id + '\non:\n  push:\n    branches: [release/*, main]\n  workflow_dispatch: {}\n\njobs:\n  regression:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - name: Setup GW Env\n        run: ./scripts/setup-gw-sandbox.sh\n' +
    c.pipeline.map(function(s) { return '      - name: ' + s + '\n        run: ./scripts/run-tests.sh --stage="' + s + '"'; }).join('\n');
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        <div style={{ background:WHITE, border:'1px solid '+G200, borderRadius:9, padding:'12px 14px' }}>
          <div style={{ fontSize:10, color:G400, marginBottom:4 }}>TRIGGER</div>
          <div style={{ fontSize:12, color:GREEN, fontWeight:600 }}>{c.trigger}</div>
        </div>
        <div style={{ background:WHITE, border:'1px solid '+G200, borderRadius:9, padding:'12px 14px' }}>
          <div style={{ fontSize:10, color:G400, marginBottom:4 }}>ROLLBACK CONDITION</div>
          <div style={{ fontSize:12, color:RED, fontWeight:600 }}>{c.rollback}</div>
        </div>
      </div>
      <div style={{ background:WHITE, border:'1px solid '+G200, borderRadius:9, padding:'12px 14px' }}>
        <div style={{ fontSize:10, color:G400, marginBottom:8 }}>PIPELINE STAGES</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:4, rowGap:5 }}>
          {c.pipeline.map(function(stage, i) {
            return (
              <div key={i} style={{ display:'flex', alignItems:'center' }}>
                <div style={{ background:G100, border:'1px solid '+G200, borderRadius:5, padding:'5px 9px', fontSize:10, color:G800 }}>{stage}</div>
                {i < c.pipeline.length - 1 && <span style={{ color:GREEN, margin:'0 3px', fontSize:13 }}>&gt;</span>}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ background:WHITE, border:'1px solid '+G200, borderRadius:9, padding:'12px 14px' }}>
        <div style={{ fontSize:10, color:G400, marginBottom:5 }}>NOTIFY ON FAILURE</div>
        <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
          {c.notify.map(function(n, i) { return <span key={i} style={{ fontSize:9, color:AMBER, border:'1px solid '+AMBER+'55', borderRadius:3, padding:'1px 7px' }}>{n}</span>; })}
        </div>
      </div>
      <div style={{ background:WHITE, border:'1px solid '+G200, borderRadius:9, padding:'12px 14px' }}>
        <div style={{ fontSize:10, color:G400, marginBottom:7 }}>GENERATED GITHUB ACTIONS YAML</div>
        <pre style={{ fontSize:10, color:'#8EE0A0', margin:0, overflowX:'auto', lineHeight:1.6, fontFamily:'monospace', whiteSpace:'pre', background:'#1E2A3A', padding:12, borderRadius:6 }}>{yaml}</pre>
      </div>
    </div>
  );
}

function RunnerPanel(props) {
  var tests    = props.tests;
  var statuses = props.statuses;
  var running  = props.running;
  var passed   = Object.values(statuses).filter(function(s) { return s === 'PASS'; }).length;
  var failed   = Object.values(statuses).filter(function(s) { return s === 'FAIL'; }).length;
  var done     = passed + failed;
  var total    = tests.length;
  var pct      = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      <div style={{ background:WHITE, border:'1px solid '+G200, borderRadius:9, padding:'13px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', gap:18 }}>
          {[{l:'Total',v:total,c:G800},{l:'Done',v:done,c:AMBER},{l:'Pass',v:passed,c:GREEN},{l:'Fail',v:failed,c:RED}].map(function(s) {
            return <div key={s.l} style={{ textAlign:'center' }}><div style={{ fontSize:20, fontWeight:700, color:s.c }}>{s.v}</div><div style={{ fontSize:9, color:G400 }}>{s.l}</div></div>;
          })}
        </div>
        <button onClick={props.onRunAll} disabled={running}
          style={{ padding:'8px 18px', background:running?G200:BLUE, border:'none', borderRadius:7, color:running?G400:WHITE, fontWeight:700, fontSize:12, cursor:running?'not-allowed':'pointer' }}>
          {running ? 'Running...' : 'Run All Tests'}
        </button>
      </div>
      <div style={{ background:WHITE, border:'1px solid '+G200, borderRadius:9, padding:'12px 16px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
          <span style={{ fontSize:11, color:G800 }}>Progress</span>
          <span style={{ fontSize:11, color:AMBER, fontWeight:700 }}>{pct}%</span>
        </div>
        <div style={{ height:7, background:G200, borderRadius:4 }}>
          <div style={{ height:'100%', width:pct+'%', background:BLUE, borderRadius:4, transition:'width 0.4s' }}/>
        </div>
      </div>
      {tests.map(function(t, i) {
        var st  = statuses[t.id];
        var sc  = STATUS_COLORS[st] || null;
        var pc  = { 'P1':'#FF6B35', 'P2':'#FF8B00', 'P3':'#00A896' }[t.p] || G400;
        return (
          <div key={i} style={{ background:WHITE, border:'1px solid '+G200, borderRadius:7, padding:'9px 13px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ display:'flex', gap:7, alignItems:'center', flex:1, minWidth:0 }}>
              <span style={{ fontSize:9, color:pc, border:'1px solid '+pc, borderRadius:3, padding:'0 4px', flexShrink:0 }}>{t.p}</span>
              <span style={{ fontSize:11, color:G800, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.title}</span>
            </div>
            <div style={{ flexShrink:0, marginLeft:10 }}>
              {sc ? (
                <span style={{ fontSize:10, fontWeight:700, color:sc }}>{st === 'RUNNING' ? 'Running...' : st}</span>
              ) : (
                <button onClick={function() { props.onRunOne(t.id); }}
                  style={{ fontSize:9, padding:'3px 8px', background:'#E3FCEF', border:'1px solid '+GREEN, borderRadius:4, color:GREEN, cursor:'pointer' }}>
                  Run
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function App() {
  var [selected,  setSelected]  = useState(null);
  var [suite,     setSuite]      = useState(null);
  var [loading,   setLoading]    = useState(false);
  var [phaseIdx,  setPhaseIdx]   = useState(0);
  var [tab,       setTab]        = useState('tests');
  var [doneMap,   setDoneMap]    = useState({});
  var [statuses,  setStatuses]   = useState({});
  var [running,   setRunning]    = useState(false);
  var [expanded,  setExpanded]   = useState(null);

  var passCount  = Object.values(statuses).filter(function(v) { return v === 'PASS'; }).length;
  var failCount  = Object.values(statuses).filter(function(v) { return v === 'FAIL'; }).length;
  var scanned    = Object.keys(doneMap).length;
  var totalTests = Object.values(doneMap).reduce(function(s, r) { return s + (r.tests ? r.tests.length : 0); }, 0);

  function runGeneration(change) {
    if (loading) return;
    setSelected(change);
    setSuite(null);
    setStatuses({});
    setLoading(true);
    setTab('tests');
    setExpanded(null);
    setPhaseIdx(0);
    var p = 0;
    function tick() { p++; setPhaseIdx(p); if (p < PHASES.length - 1) { setTimeout(tick, 750); } }
    setTimeout(tick, 750);
    getSuite(change.id).then(function(data) {
      setSuite(data);
      setDoneMap(function(prev) { var n = Object.assign({}, prev); n[change.id] = data; return n; });
      setLoading(false);
    });
  }

  function runOne(testId) {
    setStatuses(function(prev) { var n = Object.assign({}, prev); n[testId] = 'RUNNING'; return n; });
    setTimeout(function() {
      setStatuses(function(prev) { var n = Object.assign({}, prev); n[testId] = Math.random() > 0.12 ? 'PASS' : 'FAIL'; return n; });
    }, 800 + Math.floor(Math.random() * 1400));
  }

  function runAll() {
    if (!suite || running) return;
    setRunning(true);
    var tests = suite.tests.slice();
    var idx = 0;
    function next() {
      if (idx >= tests.length) { setRunning(false); return; }
      var t = tests[idx]; idx++;
      setStatuses(function(prev) { var n = Object.assign({}, prev); n[t.id] = 'RUNNING'; return n; });
      setTimeout(function() {
        setStatuses(function(prev) { var n = Object.assign({}, prev); n[t.id] = Math.random() > 0.12 ? 'PASS' : 'FAIL'; return n; });
        setTimeout(next, 150);
      }, 700 + Math.floor(Math.random() * 1200));
    }
    next();
  }

  return (
    <div style={{ fontFamily:"'Segoe UI',Arial,sans-serif", background:G100, minHeight:'100vh', display:'flex', flexDirection:'column' }}>

      <header style={{ background:WHITE, borderBottom:'3px solid '+BLUE, padding:'10px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'0 2px 6px rgba(0,0,0,0.07)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:18 }}>
          <NTTLogo/>
          <div style={{ width:1, height:30, background:G200 }}/>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:BLUE }}>Smart Regression Suite</div>
            <div style={{ fontSize:10, color:G600 }}>AI-Powered GW Test Generation -- Guidewire AMS Accelerator</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:22 }}>
          {[{v:scanned,l:'Suites',c:AMBER},{v:totalTests,l:'Tests',c:TEAL},{v:passCount,l:'Passed',c:GREEN},{v:failCount,l:'Failed',c:RED}].map(function(s) {
            return (
              <div key={s.l} style={{ textAlign:'center' }}>
                <div style={{ fontSize:20, fontWeight:800, color:s.c, lineHeight:1 }}>{s.v}</div>
                <div style={{ fontSize:9, color:G400, textTransform:'uppercase', letterSpacing:1 }}>{s.l}</div>
              </div>
            );
          })}
        </div>
      </header>

      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

        <aside style={{ width:290, background:WHITE, borderRight:'1px solid '+G200, overflowY:'auto', padding:'14px 10px', flexShrink:0 }}>
          <div style={{ fontSize:10, fontWeight:700, color:G400, letterSpacing:2, marginBottom:12 }}>CHANGE QUEUE</div>
          {CHANGES.map(function(c) {
            var cached = doneMap[c.id];
            var isAct  = selected && selected.id === c.id;
            var tc     = TYPE_COLORS[c.type] || G400;
            var risk   = cached ? cached.impact.riskLevel : null;
            var rc     = risk ? RISK_COLORS[risk] : null;
            return (
              <div key={c.id} onClick={function() { runGeneration(c); }}
                style={{ background:isAct?'#EBF2FF':WHITE, border:'1.5px solid '+(isAct?BLUE:G200), borderRadius:10, padding:'10px 11px', marginBottom:7, cursor:loading?'not-allowed':'pointer', opacity:loading&&!isAct?0.5:1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                  <span style={{ fontSize:9, color:G400, fontFamily:'monospace' }}>{c.id}</span>
                  {rc && <span style={{ fontSize:9, fontWeight:700, color:rc, border:'1px solid '+rc, borderRadius:3, padding:'0 5px' }}>{risk}</span>}
                </div>
                <div style={{ fontSize:11, fontWeight:700, color:G800, marginBottom:5, lineHeight:1.4 }}>{c.title}</div>
                <div style={{ display:'flex', gap:5 }}>
                  <span style={{ fontSize:9, color:tc, border:'1px solid '+tc, borderRadius:3, padding:'0 5px' }}>{c.type}</span>
                  <span style={{ fontSize:9, color:G400 }}>{c.module}</span>
                </div>
                {cached && (
                  <div style={{ marginTop:5, display:'flex', gap:8, borderTop:'1px solid '+G200, paddingTop:5 }}>
                    <span style={{ fontSize:9, color:AMBER }}>{cached.tests.length} tests</span>
                    <span style={{ fontSize:9, color:G400 }}>{cached.impact.duration}</span>
                  </div>
                )}
              </div>
            );
          })}
        </aside>

        <main style={{ flex:1, overflowY:'auto', padding:'18px 22px' }}>

          {!selected && !loading && (
            <div style={{ textAlign:'center', paddingTop:80, opacity:0.4 }}>
              <div style={{ fontSize:48, marginBottom:12 }}>&#9889;</div>
              <div style={{ fontSize:15, fontWeight:700, color:G800 }}>Select a change ticket to generate tests</div>
              <div style={{ fontSize:12, color:G600, marginTop:6, lineHeight:1.7, maxWidth:380, margin:'6px auto 0' }}>
                The Smart Regression Suite analyses a GW change ticket and generates a full targeted test suite with execution plan and CI/CD configuration.
              </div>
            </div>
          )}

          {loading && selected && (
            <div style={{ maxWidth:700 }}>
              <div style={{ background:WHITE, border:'1px solid '+G200, borderRadius:10, padding:'12px 15px', marginBottom:14 }}>
                <div style={{ fontSize:14, fontWeight:700, color:G800 }}>{selected.title}</div>
                <div style={{ fontSize:11, color:G600, marginTop:3 }}>{selected.module} -- {selected.type}</div>
              </div>
              <div style={{ background:WHITE, borderRadius:12, padding:'22px 20px', border:'1px solid '+G200 }}>
                <div style={{ fontSize:13, color:BLUE, fontWeight:700, marginBottom:18 }}>&#9889; Generating test suite...</div>
                {PHASES.map(function(label, i) {
                  var done = i < phaseIdx;
                  var act  = i === phaseIdx;
                  var pct  = [25,50,75,100][i];
                  return (
                    <div key={i} style={{ marginBottom:12 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                        <span style={{ fontSize:11, color:act?BLUE:done?GREEN:G400, fontWeight:act?700:400 }}>
                          {done ? 'v ' : act ? '> ' : 'o '}{label}
                        </span>
                        <span style={{ fontSize:10, color:G400 }}>{done||act?pct:0}%</span>
                      </div>
                      <div style={{ height:4, background:G200, borderRadius:4 }}>
                        <div style={{ height:'100%', width:(done||act)?pct+'%':'0%', background:done?GREEN:act?BLUE:'transparent', borderRadius:4, transition:'width 0.5s' }}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!loading && suite && selected && (
            <div style={{ maxWidth:820 }}>
              <div style={{ background:WHITE, border:'1px solid '+G200, borderRadius:10, padding:'12px 15px', marginBottom:12 }}>
                <div style={{ display:'flex', gap:8, marginBottom:5 }}>
                  <span style={{ fontSize:10, fontWeight:700, color:BLUE, fontFamily:'monospace' }}>{selected.id}</span>
                  <span style={{ fontSize:9, color:TYPE_COLORS[selected.type]||G400, border:'1px solid '+(TYPE_COLORS[selected.type]||G400), borderRadius:3, padding:'0 6px' }}>{selected.type}</span>
                </div>
                <div style={{ fontSize:14, fontWeight:700, color:G800 }}>{selected.title}</div>
                <div style={{ fontSize:11, color:G600, marginTop:4 }}>{selected.desc}</div>
              </div>

              {(function() {
                var im = suite.impact;
                var rc = RISK_COLORS[im.riskLevel] || G400;
                return (
                  <div style={{ marginBottom:14, padding:'12px 15px', background:WHITE, border:'2px solid '+rc, borderRadius:10, display:'flex', gap:16, flexWrap:'wrap', alignItems:'center' }}>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontSize:10, fontWeight:700, color:rc, border:'1px solid '+rc, borderRadius:4, padding:'2px 8px' }}>{im.riskLevel}</div>
                      <div style={{ fontSize:9, color:G400, marginTop:2 }}>RISK</div>
                    </div>
                    <div style={{ width:1, height:36, background:G200 }}/>
                    <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
                      <div><div style={{ fontSize:9, color:G400 }}>COVERAGE</div><div style={{ fontSize:12, fontWeight:700, color:AMBER }}>{im.coverage}</div></div>
                      <div><div style={{ fontSize:9, color:G400 }}>DURATION</div><div style={{ fontSize:12, fontWeight:700, color:TEAL }}>{im.duration}</div></div>
                      <div><div style={{ fontSize:9, color:G400 }}>BREAKING CHANGE</div><div style={{ fontSize:12, fontWeight:700, color:im.breakingChange?RED:GREEN }}>{im.breakingChange?'YES -- Review Required':'No'}</div></div>
                      <div>
                        <div style={{ fontSize:9, color:G400, marginBottom:3 }}>MODULES</div>
                        <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                          {im.affectedModules.map(function(m) { return <span key={m} style={{ fontSize:9, color:G600, border:'1px solid '+G200, borderRadius:3, padding:'0 5px' }}>{m}</span>; })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div style={{ display:'flex', marginBottom:14, borderBottom:'2px solid '+G200 }}>
                {[{k:'tests',l:'Test Cases ('+(suite.tests?suite.tests.length:0)+')'},{k:'plan',l:'Execution Plan'},{k:'cicd',l:'CI/CD Config'},{k:'runner',l:'Test Runner'}].map(function(t) {
                  var a = tab === t.k;
                  return (
                    <button key={t.k} onClick={function() { setTab(t.k); }}
                      style={{ background:'transparent', border:'none', borderBottom:'3px solid '+(a?BLUE:'transparent'), color:a?BLUE:G600, padding:'7px 14px', fontSize:12, fontWeight:a?700:400, cursor:'pointer', marginBottom:-2 }}>
                      {t.l}
                    </button>
                  );
                })}
              </div>

              {tab === 'tests' && (suite.tests||[]).map(function(t, i) {
                return <TestCard key={i} test={t} expanded={expanded===i} onToggle={function() { setExpanded(expanded===i?null:i); }}/>;
              })}
              {tab === 'plan'   && <PlanPanel plan={suite.plan}/>}
              {tab === 'cicd'   && <CICDPanel config={suite.cicd} changeId={selected.id}/>}
              {tab === 'runner' && <RunnerPanel tests={suite.tests||[]} statuses={statuses} running={running} onRunAll={runAll} onRunOne={runOne}/>}
            </div>
          )}
        </main>
      </div>

      <footer style={{ background:WHITE, borderTop:'1px solid '+G200, padding:'6px 24px', display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:GREEN }}/>
          <span style={{ fontSize:10, color:GREEN, fontWeight:700 }}>Live</span>
        </div>
        {['PolicyCenter','BillingCenter','ClaimCenter','GW TestNG (Prod)','GitHub Actions (Prod)','Claude AI (Prod)'].map(function(t) {
          return <span key={t} style={{ fontSize:9, color:G600, border:'1px solid '+G200, padding:'2px 7px', borderRadius:3, background:G100 }}>{t}</span>;
        })}
        <span style={{ marginLeft:'auto', fontSize:10, color:G400 }}>NTT DATA -- Smart Regression Suite 2025</span>
      </footer>
    </div>
  );
}
