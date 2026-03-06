// Dummy dashboard template JS - renders KPIs, table, filters and handler modal
// Simplified dashboard script: only renders KPIs (no manual input/table in dashboard)
(function () {
  const DATA_KEY = 'dashboard_template_entries';
  const initialEntries = [
    { id:1, closingDate:'2026-01-02', uniqueCode:'USR0001', brand:'ABSG', handler:'Yunlai', label:'REACTIVATION' },
    { id:2, closingDate:'2026-01-09', uniqueCode:'USR0002', brand:'FWSG', handler:'Christine', label:'RECOMMEND' },
    { id:3, closingDate:'2026-01-16', uniqueCode:'USR0003', brand:'OXSG', handler:'Poichee', label:'ACTIVE' },
  ];

  function loadOrInit(key, initial) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) { localStorage.setItem(key, JSON.stringify(initial)); return initial; }
      return JSON.parse(raw);
    } catch (e) { localStorage.setItem(key, JSON.stringify(initial)); return initial; }
  }

  const entries = loadOrInit(DATA_KEY, initialEntries);
  const kpiRow = document.getElementById('kpiRow');

  function getCycleFromDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const day = d.getDate();
    if (day <=7) return 'Cycle 1';
    if (day <=14) return 'Cycle 2';
    if (day <=21) return 'Cycle 3';
    return 'Cycle 4';
  }

  function renderKPIs() {
    kpiRow.innerHTML = '';
    const total = entries.length;
    const brands = new Set(entries.map(e=>e.brand)).size;
    const handlersSet = new Set(entries.map(e=>e.handler)).size;
    const status = total>0 ? 'Active':'Idle';
    const items = [
      {label:'Total Entries', value:total},
      {label:'Active Brands', value:brands},
      {label:'Total Handlers', value:handlersSet},
      {label:'Workspace Status', value:status},
    ];
    items.forEach(it=>{
      const el = document.createElement('div'); el.className='kpi';
      el.innerHTML = `<div class="icon">${it.label[0]}</div><div><div class="value">${it.value}</div><div style="font-size:12px;color:#9aa4bf">${it.label}</div></div>`;
      kpiRow.appendChild(el);
    });
  }

  renderKPIs();
  window.__dt = { entries };
})();

