# GW Smart Regression Suite
### NTT DATA -- Guidewire AMS Accelerator

AI-powered regression test generation for Guidewire AMS. Paste in a change ticket (Enhancement, Config Change, or Quarterly Upgrade) and get a full targeted test suite with prioritised test cases, execution plan, and GitHub Actions CI/CD config in seconds.

---

## Quick Start (3 minutes)

**Requires:** Node.js 18+ ([nodejs.org](https://nodejs.org))

```bash
npm install
npm start
# Open http://localhost:3000
```

---

## Deploy to Vercel (5 minutes, free)

### Option A -- GitHub + Vercel (recommended)

```bash
git init && git add . && git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_ORG/gw-smart-regression.git
git push -u origin main
```

Then: vercel.com -> Add New Project -> import repo -> Deploy.
Live at `https://gw-smart-regression.vercel.app`. Auto-deploys on every push.

### Option B -- Vercel CLI (60 seconds)

```bash
npm install -g vercel
vercel
```

### Option C -- Netlify drag-and-drop

```bash
npm run build
# Drag /build folder to app.netlify.com/drop
```

---

## Project Structure

```
gw-smart-regression/
├── src/
│   ├── data.js    <- All change tickets and test suites -- EDIT THIS
│   ├── App.js     <- Main UI
│   └── index.js   <- Entry point
├── public/
│   └── index.html
└── package.json
```

---

## Production Roadmap

### Phase 1 -- PoC (now, on Vercel)
Static test suites in `src/data.js`. Full UI with 4-tab view. No backend needed.

### Phase 2 -- Live Claude API (Week 1-2)

Replace `getSuite()` in `src/data.js` with a real Claude API call:

```javascript
export async function getSuite(changeId) {
  const change = CHANGES.find(c => c.id === changeId);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: `You are a GW AMS QA expert. Given a Guidewire change ticket, return ONLY valid JSON
               with keys: impact, tests, plan, cicd.
               Each test must have: id, p (P1/P2/P3), cat, mod, auto (boolean),
               mins, title, preconditions, steps (array), expected.
               Prioritise GW-specific patterns: N+1 queries, workflow engine, deprecated APIs,
               integration contracts, and batch processes.`,
      messages: [{ role: 'user', content: JSON.stringify(change) }],
    }),
  });
  const data = await response.json();
  return JSON.parse(data.content[0].text);
}
```

Add `REACT_APP_ANTHROPIC_KEY` in Vercel dashboard -> Environment Variables.

### Phase 3 -- ServiceNow / Jira Integration (Week 3-4)

Auto-pull change tickets from your ITSM instead of static data:

```javascript
// Pull from Jira Service Management
const tickets = await fetch(
  'https://YOUR_ORG.atlassian.net/rest/api/3/search?jql=project=GW AND type=Change',
  { headers: { Authorization: 'Bearer ' + process.env.REACT_APP_JIRA_TOKEN } }
).then(r => r.json());
```

### Phase 4 -- TestNG / Selenium Integration (Week 5-6)

Auto-create TestNG test stubs from generated test cases:

```javascript
// Generate TestNG XML from Claude output
const testngXml = suite.tests.map(t => `
  <test name="${t.id}">
    <classes><class name="gw.tests.${t.mod}.${t.id}"/></classes>
  </test>
`).join('\n');
```

### Phase 5 -- CI/CD Gate (Week 7-8)

Add GitHub Action that blocks merge if high-risk change has no regression coverage:

```yaml
- name: Check Regression Coverage
  run: node scripts/check-coverage.js --change=${{ github.event.pull_request.title }}
  env:
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
    MIN_COVERAGE: 80
```

---

## Adding New Change Tickets

Add to `CHANGES` in `src/data.js`:

```javascript
{ id: 'CHG-4824', type: 'Enhancement', module: 'PolicyCenter',
  title: 'Your change title', desc: 'Description of the change...',
  affectedAreas: ['PolicyCenter', 'Rating'] },
```

Then add a matching suite in `STATIC_SUITES` (Phase 1) or let Claude generate it dynamically (Phase 2+).

---

## NTT DATA -- Guidewire AMS Accelerators 2025
