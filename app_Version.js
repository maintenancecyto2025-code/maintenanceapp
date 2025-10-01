document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'https://script.google.com/macros/s/AKfycbzNaCo7FGPjEE5WI-Az1KX-PBSpeofq0uiSPlydroQTWlm1PyoregGots4ZEcfWtjG0oQ/exec'; // remplace ici

  const el = id => document.getElementById(id);
  const api = (action, data={}) => fetch(API_URL, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({action, ...data})
  }).then(r => r.json());

  el('loginBtn').onclick = async () => {
    const email = el('emailInput').value.trim();
    const pwd   = el('pwdInput').value.trim();
    el('loginError').textContent = '';
    if (!email || !pwd) return el('loginError').textContent = 'Email et mot de passe requis';
    try {
      const res = await api('login', {email, password: pwd});
      if (res.success) {
        el('loginBox').classList.add('hidden');
        el('appBox').classList.remove('hidden');
        loadKPI();
      } else {
        el('loginError').textContent = res.error;
      }
    } catch {
      el('loginError').textContent = 'Erreur réseau';
    }
  };

  el('logoutBtn').onclick = () => {
    el('appBox').classList.add('hidden');
    el('loginBox').classList.remove('hidden');
  };

  document.querySelectorAll('nav a').forEach(a => {
    a.onclick = e => {
      e.preventDefault();
      document.querySelectorAll('nav a').forEach(x => x.classList.remove('active'));
      a.classList.add('active');
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      el(a.dataset.sec).classList.add('active');
    };
  });

  el('refreshKPI').onclick = loadKPI;
  async function loadKPI() {
    el('kpiList').innerHTML = '';
    try {
      const arr = await api('getAll', {tab:'WorkOrders'});
      const open = arr.filter(o => !o.report).length;
      const late = arr.filter(o => Date.now() - +o.date > 86400000).length;
      [['OT ouverts', open], ['OT en retard', late]].forEach(([label, val]) => {
        const li = document.createElement('li');
        li.textContent = `${label} : ${val}`;
        el('kpiList').appendChild(li);
      });
    } catch {
      alert('Erreur chargement KPI');
    }
  }

  const bind = (btnId, listId, tab) => {
    el(btnId).onclick = async () => {
      el(listId).innerHTML = '';
      try {
        const arr = await api('getAll', {tab});
        arr.forEach(o => {
          const li = document.createElement('li');
          li.textContent = Object.values(o).join(' – ');
          el(listId).appendChild(li);
        });
      } catch {
        alert(`Erreur chargement ${tab}`);
      }
    };
  };

  bind('loadWO', 'woList', 'WorkOrders');
  bind('loadStocks', 'stocksList', 'Stocks');
  bind('loadDocs', 'docsList', 'Docs');
  bind('loadUsers', 'usersList', 'Users');
});
