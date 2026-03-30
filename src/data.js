// ─── Smart Regression Suite -- Change Tickets and Test Suites ────────────────
// PHASE 1 (PoC): All data is static. Test suites are pre-built per change type.
// PHASE 2 (Production): Replace getSuite() with a real Claude API call.
// See README.md for the Claude prompt and integration guide.

export var CHANGES = [
  {
    id: 'CHG-4821', type: 'Enhancement', module: 'PolicyCenter',
    title: 'Update HO-3 coverage limits -- new state caps for CA and TX',
    desc: 'Modify PolicyValidationPlugin to enforce coverage maximums for California ($2M) and Texas ($1.5M) on HO-3. Affects new business, renewals, rating tables, and UI validation.',
    affectedAreas: ['PolicyCenter', 'Rating', 'UI Validation', 'Renewals'],
  },
  {
    id: 'CHG-4822', type: 'Config Change', module: 'BillingCenter',
    title: 'Add ACH payment method for commercial auto',
    desc: 'Extend BillingWorkflowHandler to support ACH direct debit for commercial auto lines. New invoice template, gateway integration, and billing cycle config required.',
    affectedAreas: ['BillingCenter', 'Payment Processing', 'Invoice Generation', 'Integration'],
  },
  {
    id: 'CHG-4823', type: 'Quarterly Upgrade', module: 'ClaimCenter',
    title: 'GW Cloud Q2 2025 -- ClaimCenter API v14.2 migration',
    desc: 'Quarterly upgrade. Breaking changes to ClaimAssignmentRule, deprecated AdjusterWorkloadService methods, new mandatory FNOL fields, integration contract changes.',
    affectedAreas: ['ClaimCenter', 'FNOL', 'Assignment Rules', 'Integrations', 'API Contracts'],
  },
];

export var STATIC_SUITES = {
  'CHG-4821': {
    impact: {
      riskLevel: 'HIGH',
      affectedModules: ['PolicyCenter', 'Rating Engine', 'UI Validation', 'Renewal Workflow'],
      breakingChange: false,
      duration: '3.5 hours',
      coverage: '90%',
    },
    tests: [
      { id:'TC-001', p:'P1', cat:'Smoke',      mod:'PolicyCenter',     auto:true,  mins:8,  title:'Smoke: HO-3 quote-to-bind for non-capped state', preconditions:'Clean environment; HO-3 product', steps:['Create HO-3 submission for Ohio','Complete quote and rating','Bind policy'], expected:'Full quote-to-bind completes without errors within 60 seconds.' },
      { id:'TC-002', p:'P1', cat:'Functional', mod:'PolicyCenter',     auto:true,  mins:12, title:'CA coverage $2M cap enforced on HO-3 new business', preconditions:'HO-3 configured; CA state; underwriter login', steps:['New Submission HO-3; select California','Enter Coverage A $2,500,000','Attempt Bind'], expected:'System blocks: Coverage A limit exceeds California maximum of $2,000,000.' },
      { id:'TC-003', p:'P1', cat:'Functional', mod:'PolicyCenter',     auto:true,  mins:10, title:'TX coverage $1.5M cap enforced on HO-3 new business', preconditions:'HO-3; TX state', steps:['Create HO-3 for Texas','Enter Coverage A $1,600,000','Attempt Bind'], expected:'System blocks: Coverage A limit exceeds Texas maximum of $1,500,000.' },
      { id:'TC-004', p:'P1', cat:'Functional', mod:'PolicyCenter',     auto:true,  mins:10, title:'CA coverage at exact $2M boundary is accepted', preconditions:'HO-3; CA state', steps:['Create CA HO-3 submission','Enter exactly $2,000,000','Advance and bind'], expected:'Policy binds successfully. No validation error at boundary value.' },
      { id:'TC-005', p:'P1', cat:'Functional', mod:'Rating Engine',    auto:true,  mins:18, title:'Updated CA rating table values applied at quote', preconditions:'Rating tables updated with new CA values', steps:['Create HO-3 quote for California','Complete fields and trigger rating','Compare premium vs expected CA rates'], expected:'Premium calculated using new CA rate table. Previous rates no longer applied.' },
      { id:'TC-006', p:'P2', cat:'Regression', mod:'PolicyCenter',     auto:true,  mins:10, title:'Non-CA/TX states unaffected by new validation', preconditions:'HO-3 configured for Florida', steps:['Create HO-3 for Florida','Enter Coverage A $3,000,000','Attempt bind'], expected:'Policy binds. Florida not subject to new caps.' },
      { id:'TC-007', p:'P2', cat:'Regression', mod:'Rating Engine',    auto:true,  mins:18, title:'TX rating table values applied correctly at quote', preconditions:'Rating tables updated with TX values', steps:['Create HO-3 quote for Texas','Trigger rating','Verify premium matches TX rate schedule'], expected:'Premium calculated using new TX rate entries.' },
      { id:'TC-008', p:'P2', cat:'Functional', mod:'UI Validation',    auto:true,  mins:8,  title:'UI error message correct for CA limit breach', preconditions:'HO-3 CA in quote stage', steps:['Enter Coverage A above $2M for CA HO-3','Click Next/Bind','Inspect error message'], expected:'Red inline error adjacent to Coverage A field with approved copy text.' },
      { id:'TC-009', p:'P2', cat:'Regression', mod:'Renewal Workflow', auto:false, mins:25, title:'Existing CA HO-3 renewals above cap flagged', preconditions:'Seed: CA HO-3 with Coverage A $2.2M; renewal batch configured', steps:['Run renewal pre-qualification','Inspect renewal job output','Verify underwriter notification'], expected:'Policy flagged for underwriter review. Not auto-renewed.' },
      { id:'TC-010', p:'P3', cat:'Regression', mod:'PolicyCenter',     auto:true,  mins:10, title:'HO-3 CA cap does not affect HO-4 product', preconditions:'HO-4 product active', steps:['Create HO-4 for California','Enter Coverage A $2,500,000','Attempt bind'], expected:'HO-4 binds without coverage cap error. Validation is HO-3 specific.' },
    ],
    plan: { total:10, smoke:1, regression:3, integration:0, duration:'3.5 hours', parallel:true, sequence:['1. Smoke (TC-001) -- environment health','2. P1 functional (TC-002,003,004,005) -- core validation','3. P2 regression (TC-006,007,008,009) -- side effects','4. P3 isolation (TC-010) -- product checks','5. Manual sign-off on renewal workflow'] },
    cicd: { trigger:'On merge to release branch', pipeline:['Smoke','P1 Functional','Rating Regression','UI Validation','Renewal Regression','Report'], rollback:'Any P1 failure or >2 P2 failures', notify:['qa-team@company.com','policycenter-lead@company.com'] },
  },

  'CHG-4822': {
    impact: {
      riskLevel: 'HIGH',
      affectedModules: ['BillingCenter', 'Payment Gateway', 'Invoice Generation', 'Billing Cycle'],
      breakingChange: true,
      duration: '4 hours',
      coverage: '85%',
    },
    tests: [
      { id:'TC-001', p:'P1', cat:'Smoke',       mod:'BillingCenter',      auto:true,  mins:5,  title:'Smoke: BillingCenter loads commercial auto accounts', preconditions:'Standard test environment', steps:['Log in to BillingCenter','Search for commercial auto account','Open account'], expected:'BillingCenter loads. Account screen displays without errors.' },
      { id:'TC-002', p:'P1', cat:'Functional',  mod:'BillingCenter',      auto:true,  mins:8,  title:'ACH payment method available for commercial auto', preconditions:'Commercial auto bound; ACH endpoint configured', steps:['Open billing account for commercial auto','Navigate to Payment Methods','Verify ACH Direct Debit listed'], expected:'ACH Direct Debit is listed as a selectable payment method.' },
      { id:'TC-003', p:'P1', cat:'Functional',  mod:'BillingCenter',      auto:true,  mins:8,  title:'ACH NOT available for personal auto lines', preconditions:'Personal auto policy bound', steps:['Open billing account for personal auto','Navigate to Payment Methods','Inspect options'], expected:'ACH Direct Debit NOT listed for personal auto. Commercial auto specific.' },
      { id:'TC-004', p:'P1', cat:'Integration', mod:'Payment Gateway',    auto:true,  mins:20, title:'ACH charge request sent with correct payload', preconditions:'Mock ACH gateway configured', steps:['Trigger ACH payment on commercial auto invoice','Intercept outbound request','Validate payload fields'], expected:'Gateway receives correctly structured ACH payload. All mandatory fields present.' },
      { id:'TC-005', p:'P1', cat:'Integration', mod:'Payment Gateway',    auto:true,  mins:18, title:'Successful ACH response updates payment status', preconditions:'Mock gateway returns HTTP 200', steps:['Submit ACH payment','Confirm mock success','Check invoice and billing account status'], expected:'Invoice marked Paid. ACH payment record created. Balance updated.' },
      { id:'TC-006', p:'P1', cat:'Integration', mod:'Payment Gateway',    auto:true,  mins:18, title:'Failed ACH gateway (NSF) handled gracefully', preconditions:'Mock returns NSF error', steps:['Submit ACH payment','Mock returns NSF','Check invoice status and agent notification'], expected:'Invoice remains unpaid. NSF logged. Agent notification created. No duplicate charge.' },
      { id:'TC-007', p:'P2', cat:'API',         mod:'Payment Gateway',    auto:true,  mins:10, title:'API contract: ACH endpoint schema validation', preconditions:'Postman collection updated for v1.2', steps:['Execute Postman ACH collection','Validate response schema','Check mandatory fields'], expected:'All API contract assertions pass. Schema matches v1.2 ACH contract.' },
      { id:'TC-008', p:'P2', cat:'Functional',  mod:'Invoice Generation', auto:false, mins:15, title:'ACH invoice template renders correctly', preconditions:'Commercial auto with ACH; invoice template deployed', steps:['Generate invoice using ACH','Download PDF','Verify ACH section and masked bank details'], expected:'PDF renders with ACH payment section. Bank details masked to last 4 digits.' },
      { id:'TC-009', p:'P2', cat:'Regression',  mod:'BillingCenter',      auto:true,  mins:12, title:'Existing payment methods (credit card) unaffected', preconditions:'Commercial auto with credit card', steps:['Process credit card payment','Verify transaction completes','Confirm no regression'], expected:'Credit card payment processes successfully. No impact from ACH changes.' },
      { id:'TC-010', p:'P2', cat:'Regression',  mod:'Billing Cycle',      auto:true,  mins:20, title:'Billing cycle unaffected for non-ACH accounts', preconditions:'Mix of ACH and non-ACH accounts', steps:['Run billing cycle job','Verify invoices generated','Confirm templates correct per type'], expected:'Billing cycle completes. ACH uses new template. All others unchanged.' },
    ],
    plan: { total:10, smoke:1, regression:2, integration:3, duration:'4 hours', parallel:false, sequence:['1. Smoke (TC-001) -- BillingCenter health','2. P1 integration (TC-004,005,006) -- gateway critical path','3. P1 functional (TC-002,003) -- ACH availability','4. API contract (TC-007) -- schema check','5. P2 regression (TC-008,009,010) -- side effects','6. Manual PDF review (TC-008)'] },
    cicd: { trigger:'On merge to release/billing-ach branch', pipeline:['Smoke','Gateway Integration','Functional','API Contract','Billing Regression','Report'], rollback:'Any P1 or gateway integration test failure', notify:['qa-team@company.com','billing-lead@company.com','payments-integration@company.com'] },
  },

  'CHG-4823': {
    impact: {
      riskLevel: 'CRITICAL',
      affectedModules: ['ClaimCenter Core', 'FNOL Workflow', 'Assignment Rules', 'Adjuster Workload', 'Third-Party Integrations'],
      breakingChange: true,
      duration: '6 hours',
      coverage: '95%',
    },
    tests: [
      { id:'TC-001', p:'P1', cat:'Smoke',       mod:'ClaimCenter Core',         auto:true,  mins:8,  title:'Smoke: ClaimCenter loads on API v14.2', preconditions:'ClaimCenter v14.2 deployed; standard test user', steps:['Log in post-upgrade','Navigate to Claims > My Claims','Open a claim and verify screens'], expected:'ClaimCenter loads on v14.2. Core screens render. No console errors.' },
      { id:'TC-002', p:'P1', cat:'Functional',  mod:'FNOL Workflow',            auto:true,  mins:20, title:'FNOL submission with new v14.2 mandatory fields', preconditions:'FNOL screen updated for v14.2', steps:['Initiate new FNOL for auto claim','Populate new mandatory v14.2 fields','Submit FNOL'], expected:'FNOL submits with new mandatory fields. Claim created. No v14.1 mapping errors.' },
      { id:'TC-003', p:'P1', cat:'Regression',  mod:'FNOL Workflow',            auto:true,  mins:25, title:'Existing FNOL data not broken by v14.2 migration', preconditions:'Historical FNOL data migrated to v14.2 schema', steps:['Open 5 claims created pre-upgrade','Verify all FNOL fields display','Edit and save existing claim data'], expected:'All FNOL fields display without null errors. Edit and save completes.' },
      { id:'TC-004', p:'P1', cat:'Functional',  mod:'Assignment Rules',         auto:true,  mins:22, title:'ClaimAssignmentRule routes new claims correctly post-upgrade', preconditions:'Assignment rules configured; adjuster pool seeded', steps:['Submit 3 FNOLs for auto, property, liability','Allow auto-assignment job','Verify each claim assigned'], expected:'All 3 claims correctly assigned by type. No runtime errors. No unassigned claims.' },
      { id:'TC-005', p:'P1', cat:'Regression',  mod:'Assignment Rules',         auto:true,  mins:20, title:'Deprecated ClaimAssignmentRule methods not causing failures', preconditions:'v14.2 release notes reviewed; deprecated methods identified', steps:['Run full assignment rule set','Monitor server logs','Check for NullPointerExceptions'], expected:'Assignment rules complete. Deprecated methods produce warnings not failures.' },
      { id:'TC-006', p:'P1', cat:'Functional',  mod:'Adjuster Workload',        auto:true,  mins:18, title:'AdjusterWorkloadService replaced in v14.2', preconditions:'v14.2 migration guide followed', steps:['Access adjuster workload dashboard','Trigger workload rebalancing','Verify workload counts update'], expected:'Workload service runs using v14.2 API methods. Dashboard updates correctly.' },
      { id:'TC-007', p:'P1', cat:'Integration', mod:'Third-Party Integrations', auto:true,  mins:20, title:'ISO ClaimSearch works with v14.2 API contracts', preconditions:'ISO ClaimSearch mock configured for v14.2', steps:['Submit FNOL and trigger ISO lookup','Verify outbound request uses v14.2 contract','Confirm response mapped correctly'], expected:'ISO calls succeed. v14.2 field mappings correct. ClaimRefType field present.' },
      { id:'TC-008', p:'P1', cat:'Integration', mod:'Third-Party Integrations', auto:true,  mins:20, title:'Mitchell/CCC vendor integration after v14.2 upgrade', preconditions:'Vendor mock endpoints configured for v14.2', steps:['Create auto claim and initiate vendor assignment','Verify outbound API uses v14.2 schema','Confirm vendor response received'], expected:'Vendor API call succeeds. Estimate received and attached. No contract violations.' },
      { id:'TC-009', p:'P2', cat:'API',         mod:'Third-Party Integrations', auto:true,  mins:30, title:'API contract regression: ClaimCenter v14.2 schema', preconditions:'Postman collection updated with v14.2 specs', steps:['Run full Postman API contract suite','Validate all response schemas','Flag v14.1 vs v14.2 differences'], expected:'All API contract tests pass. Zero breaking schema differences.' },
      { id:'TC-010', p:'P2', cat:'Regression',  mod:'ClaimCenter Core',         auto:false, mins:40, title:'Claim lifecycle open-to-closed end-to-end on v14.2', preconditions:'Full claim lifecycle configured', steps:['Submit FNOL, assign, reserve, pay, close','Verify each transition','Confirm Closed status'], expected:'Full lifecycle completes. All transitions succeed on v14.2.' },
      { id:'TC-011', p:'P2', cat:'Regression',  mod:'FNOL Workflow',            auto:true,  mins:25, title:'FNOL batch import handles v14.2 schema', preconditions:'Batch import file with v14.2 schema prepared', steps:['Upload FNOL batch import file','Monitor import job','Verify claims created'], expected:'Batch import processes all records. No schema validation errors.' },
    ],
    plan: { total:11, smoke:1, regression:3, integration:2, duration:'6 hours', parallel:false, sequence:['1. Smoke (TC-001) -- verify v14.2 environment first','2. P1 FNOL (TC-002,003) -- mandatory fields','3. P1 Assignment (TC-004,005,006) -- deprecated method validation','4. P1 Integration (TC-007,008) -- third-party contracts','5. API contract suite (TC-009) -- schema regression','6. P2 regression (TC-010,011) -- lifecycle and batch','7. Manual sign-off on TC-010 claim lifecycle'] },
    cicd: { trigger:'On GW Cloud upgrade deployment to staging', pipeline:['Smoke','FNOL Critical Path','Assignment Rules','Integration Tests','API Contracts','Full Regression','Go/No-Go Report'], rollback:'Any P1 OR smoke failure OR >1 integration test failure', notify:['qa-lead@company.com','claimcenter-lead@company.com','release-manager@company.com','integration-team@company.com'] },
  },
};

// ─── getSuite ─────────────────────────────────────────────────────────────────
// PHASE 1 (PoC): Returns static data after a simulated delay.
// PHASE 2 (Production): Replace with a real Claude API call.
//
// Example production implementation:
//
//   export async function getSuite(change) {
//     const response = await fetch('https://api.anthropic.com/v1/messages', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         model: 'claude-sonnet-4-6',
//         max_tokens: 4000,
//         system: `You are a GW AMS test expert. Given a change ticket, return ONLY valid JSON
//                  with keys: impact, tests, plan, cicd. Each test must have:
//                  id, p (priority P1/P2/P3), cat (category), mod (module),
//                  auto (boolean), mins (estimate), title, preconditions, steps (array), expected.`,
//         messages: [{ role: 'user', content: JSON.stringify(change) }],
//       }),
//     });
//     const data = await response.json();
//     return JSON.parse(data.content[0].text);
//   }

export function getSuite(changeId) {
  return new Promise(function(resolve) {
    setTimeout(function() {
      resolve(STATIC_SUITES[changeId] || null);
    }, 3000);
  });
}
