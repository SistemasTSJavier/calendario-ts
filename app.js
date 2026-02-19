(function () {
  const STORAGE_KEY = 'tactical_support_reservaciones';
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  let state = {
    currentDate: new Date(),
    reservations: loadReservations(),
    user: null
  };

  function loadReservations() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  function saveReservations() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.reservations));
  }

  function getReservationsForDay(year, month, day) {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return state.reservations.filter(r => r.fecha === key);
  }

  // --- Google Auth (sin backend) ---
  function initGoogleAuth() {
    const clientId = window.TACTICAL_SUPPORT_GOOGLE_CLIENT_ID;
    if (!clientId || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: onGoogleSignIn
    });

    const btn = document.getElementById('googleSignInBtn');
    if (btn && !state.user) {
      window.google.accounts.id.renderButton(btn, {
        type: 'standard',
        theme: 'filled_black',
        size: 'medium',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left'
      });
    }
  }

  function onGoogleSignIn(response) {
    if (!response?.credential) return;
    try {
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      state.user = {
        email: payload.email || '',
        name: payload.name || payload.email
      };
    } catch {
      state.user = { email: '', name: '' };
    }
    renderAuthUI();
    updateReservationButton();
  }

  function signOut() {
    state.user = null;
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
    renderAuthUI();
    updateReservationButton();
  }

  function renderAuthUI() {
    const btnContainer = document.getElementById('googleSignInBtn');
    const userInfo = document.getElementById('userInfo');
    const userEmail = document.getElementById('userEmail');
    const signOutBtn = document.getElementById('signOutBtn');

    if (!btnContainer || !userInfo) return;

    if (state.user) {
      btnContainer.innerHTML = '';
      btnContainer.style.display = 'none';
      userInfo.style.display = 'flex';
      if (userEmail) userEmail.textContent = state.user.email;
      if (signOutBtn) signOutBtn.onclick = signOut;
    } else {
      userInfo.style.display = 'none';
      btnContainer.style.display = 'block';
      initGoogleAuth();
    }
  }

  function updateReservationButton() {
    const btn = document.getElementById('newReservation');
    if (btn) {
      btn.disabled = !state.user;
      btn.title = state.user ? 'Crear nueva reservación' : 'Inicia sesión con Google para reservar';
    }
  }

  // --- Calendario: solo se visualiza la fecha de reserva ---
  function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    const monthLabel = document.getElementById('currentMonth');
    const y = state.currentDate.getFullYear();
    const m = state.currentDate.getMonth();

    monthLabel.textContent = `${months[m]} ${y}`;

    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);
    const startOffset = first.getDay();
    const daysInMonth = last.getDate();
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    let html = '';
    const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      const dayNum = i - startOffset + 1;
      const isOtherMonth = dayNum < 1 || dayNum > daysInMonth;
      const day = dayNum > 0 && dayNum <= daysInMonth ? dayNum : (dayNum < 1 ? new Date(y, m, 0).getDate() + dayNum : dayNum - daysInMonth);
      const actualMonth = dayNum < 1 ? m - 1 : dayNum > daysInMonth ? m + 1 : m;
      const actualYear = actualMonth < 0 ? y - 1 : actualMonth > 11 ? y + 1 : y;
      const cellDate = dayNum >= 1 && dayNum <= daysInMonth ? new Date(y, m, dayNum) : new Date(actualYear, actualMonth, day);
      const dayKey = `${cellDate.getFullYear()}-${String(cellDate.getMonth() + 1).padStart(2, '0')}-${String(cellDate.getDate()).padStart(2, '0')}`;
      const isToday = dayKey === todayKey;
      const events = getReservationsForDay(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());

      const otherClass = isOtherMonth ? ' other-month' : '';
      const todayClass = isToday ? ' today' : '';
      const eventsHtml = events
        .map(ev => {
          const label = `${ev.hora} — Reservado`;
          return `<button type="button" class="event-pill" data-id="${ev.id}" title="${label}">${label}</button>`;
        })
        .join('');

      html += `<div class="day-cell${otherClass}${todayClass}" data-date="${dayKey}">
        <div class="day-number">${dayNum >= 1 && dayNum <= daysInMonth ? dayNum : day}</div>
        <div class="day-events">${eventsHtml}</div>
      </div>`;
    }

    grid.innerHTML = html;

    grid.querySelectorAll('.day-cell').forEach(cell => {
      cell.addEventListener('click', onDayClick);
    });
    grid.querySelectorAll('.event-pill').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        openDetail(btn.dataset.id);
      });
    });
  }

  function onDayClick(e) {
    if (e.target.classList.contains('event-pill')) return;
    if (!state.user) {
      alert('Inicia sesión con Google para poder reservar.');
      return;
    }
    const date = e.currentTarget.dataset.date;
    openModal(date);
  }

  function openModal(prefillDate) {
    if (!state.user) return;
    const overlay = document.getElementById('modalOverlay');
    const form = document.getElementById('reservationForm');
    form.reset();
    document.getElementById('responsable').value = state.user.name || state.user.email;
    if (prefillDate) {
      document.getElementById('fecha').value = prefillDate;
    } else {
      const d = new Date();
      document.getElementById('fecha').value = d.toISOString().slice(0, 10);
    }
    overlay.classList.add('open');
    document.getElementById('asunto').focus();
  }

  function closeModal() {
    document.getElementById('modalOverlay').classList.remove('open');
  }

  function openDetail(id) {
    const res = state.reservations.find(r => r.id === id);
    if (!res) return;
    const content = document.getElementById('detailContent');
    const canDelete = state.user && res.reservadoPor === state.user.email;
    content.innerHTML = `
      <div class="detail-row">
        <div class="detail-label">Fecha de reserva</div>
        <div class="detail-value">${formatDate(res.fecha)}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Hora</div>
        <div class="detail-value">${res.hora}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Reservado por</div>
        <div class="detail-value">${escapeHtml(res.reservadoPor || res.responsable || '—')}</div>
      </div>
    `;
    document.getElementById('detailOverlay').classList.add('open');
    const deleteBtn = document.getElementById('deleteReservation');
    deleteBtn.dataset.id = id;
    deleteBtn.style.display = canDelete ? '' : 'none';
  }

  function closeDetail() {
    document.getElementById('detailOverlay').classList.remove('open');
    document.getElementById('deleteReservation').style.display = '';
  }

  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function formatDate(isoDate) {
    const [y, m, d] = isoDate.split('-').map(Number);
    return `${d} de ${months[m - 1]} de ${y}`;
  }

  function onFormSubmit(e) {
    e.preventDefault();
    if (!state.user) return;
    const responsable = document.getElementById('responsable').value.trim();
    const asunto = document.getElementById('asunto').value.trim();
    const fecha = document.getElementById('fecha').value;
    const hora = document.getElementById('hora').value;
    const participantes = document.getElementById('participantes').value.trim();

    const reservation = {
      id: 'id_' + Date.now(),
      responsable,
      asunto,
      fecha,
      hora,
      participantes: participantes || '',
      reservadoPor: state.user.email
    };
    state.reservations.push(reservation);
    saveReservations();
    closeModal();
    renderCalendar();
  }

  function deleteReservation() {
    const id = document.getElementById('deleteReservation').dataset.id;
    if (!id) return;
    const res = state.reservations.find(r => r.id === id);
    if (res && state.user && res.reservadoPor !== state.user.email) return;
    state.reservations = state.reservations.filter(r => r.id !== id);
    saveReservations();
    closeDetail();
    renderCalendar();
  }

  function prevMonth() {
    state.currentDate.setMonth(state.currentDate.getMonth() - 1);
    renderCalendar();
  }

  function nextMonth() {
    state.currentDate.setMonth(state.currentDate.getMonth() + 1);
    renderCalendar();
  }

  document.getElementById('prevMonth').addEventListener('click', prevMonth);
  document.getElementById('nextMonth').addEventListener('click', nextMonth);
  document.getElementById('newReservation').addEventListener('click', () => openModal());
  document.getElementById('reservationForm').addEventListener('submit', onFormSubmit);
  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('cancelReservation').addEventListener('click', closeModal);
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target.id === 'modalOverlay') closeModal();
  });

  document.getElementById('closeDetail').addEventListener('click', closeDetail);
  document.getElementById('closeDetailBtn').addEventListener('click', closeDetail);
  document.getElementById('deleteReservation').addEventListener('click', deleteReservation);
  document.getElementById('detailOverlay').addEventListener('click', e => {
    if (e.target.id === 'detailOverlay') closeDetail();
  });

  renderCalendar();
  updateReservationButton();

  function tryInitGoogleAuth() {
    if (!window.TACTICAL_SUPPORT_GOOGLE_CLIENT_ID) return;
    if (window.google?.accounts?.id) {
      initGoogleAuth();
      return true;
    }
    return false;
  }
  if (!tryInitGoogleAuth()) {
    window.addEventListener('load', tryInitGoogleAuth);
    var t = setInterval(function () {
      if (tryInitGoogleAuth()) clearInterval(t);
    }, 300);
    setTimeout(clearInterval.bind(null, t), 5000);
  }
})();
