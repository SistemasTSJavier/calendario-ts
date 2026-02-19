(function () {
  const STORAGE_KEY = 'tactical_support_reservaciones';
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const firebaseConfig = window.TACTICAL_SUPPORT_FIREBASE_CONFIG || {};
  const useFirebase = !!(firebaseConfig && firebaseConfig.projectId);

  let state = {
    currentDate: new Date(),
    reservations: [],
    user: null
  };

  let firestoreUnsubscribe = null;

  function setConnectionStatus(mode, message) {
    var el = document.getElementById('connectionStatus');
    if (!el) return;
    el.className = 'connection-status ' + mode;
    el.textContent = message;
  }

  function loadReservationsLocal() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  function saveReservationsLocal() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.reservations));
  }

  function initFirebase() {
    if (!useFirebase || typeof firebase === 'undefined') return null;
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      return firebase.firestore();
    } catch (e) {
      console.warn('Firebase init error', e);
      return null;
    }
  }

  function subscribeReservations() {
    var db = initFirebase();
    if (!db) {
      state.reservations = loadReservationsLocal();
      renderDayView();
      setConnectionStatus('local', 'Modo local: las reservas solo se ven en este navegador. Revisa config.js (Firebase) y que todos abran la MISMA URL.');
      return;
    }
    var coll = db.collection('reservations');
    firestoreUnsubscribe = coll.orderBy('fecha').onSnapshot(
      function (snapshot) {
        state.reservations = snapshot.docs.map(function (d) {
          return { id: d.id, ...d.data() };
        }).sort(function (a, b) {
          if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha);
          return (a.hora || '').localeCompare(b.hora || '');
        });
        renderDayView();
        setConnectionStatus('cloud', 'Reservas compartidas (nube): todos ven lo mismo en cualquier dispositivo.');
      },
      function (err) {
        console.warn('Firestore error', err);
        state.reservations = loadReservationsLocal();
        renderDayView();
        setConnectionStatus('error', 'No se pudo conectar a la nube. Revisa reglas de Firestore y que la URL esté autorizada. Mientras tanto: solo local.');
      }
    );
  }

  function getReservationsForDay(year, month, day) {
    const key = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    return state.reservations.filter(function (r) { return r.fecha === key; });
  }

  function parseHour(horaStr) {
    if (!horaStr) return 0;
    var parts = String(horaStr).trim().split(':');
    return parseInt(parts[0], 10) || 0;
  }

  // --- Google Auth ---
  function initGoogleAuth() {
    const clientId = window.TACTICAL_SUPPORT_GOOGLE_CLIENT_ID;
    if (!clientId || !window.google) return;
    // Comprobar que el Client ID es del proyecto Firebase (809581021929). Si en consola ves otro número, hay caché/config antigua.
    if (clientId.indexOf('809581021929') !== 0) {
      console.warn('Calendario: TACTICAL_SUPPORT_GOOGLE_CLIENT_ID no es del proyecto Firebase (809581021929). Revisa config.js y recarga con Ctrl+Shift+R.');
    }

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
    if (!response || !response.credential) return;
    try {
      var payload = JSON.parse(atob(response.credential.split('.')[1]));
      state.user = {
        email: payload.email || '',
        name: payload.name || payload.email
      };
      if (useFirebase && typeof firebase !== 'undefined' && firebase.auth) {
        var credential = firebase.auth.GoogleAuthProvider.credential(response.credential);
        firebase.auth().signInWithCredential(credential).then(function () {
          updateReservationButton();
        }).catch(function (err) {
          console.warn('Firebase Auth sign-in:', err);
          updateReservationButton();
        });
      }
    } catch (e) {
      state.user = { email: '', name: '' };
    }
    renderAuthUI();
    updateReservationButton();
  }

  function signOut() {
    state.user = null;
    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.disableAutoSelect();
    }
    if (useFirebase && typeof firebase !== 'undefined' && firebase.auth) {
      firebase.auth().signOut().catch(function () {});
    }
    renderAuthUI();
    updateReservationButton();
  }

  function renderAuthUI() {
    var btnContainer = document.getElementById('googleSignInBtn');
    var userInfo = document.getElementById('userInfo');
    var userEmail = document.getElementById('userEmail');
    var signOutBtn = document.getElementById('signOutBtn');

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
    var btn = document.getElementById('newReservation');
    if (btn) {
      btn.disabled = !state.user;
      btn.title = state.user ? 'Crear nueva reservación' : 'Inicia sesión con Google para reservar';
    }
  }

  // --- Vista por día (8:00 – 18:00) ---
  const HOUR_START = 8;
  const HOUR_END = 18;

  function renderDayView() {
    var body = document.getElementById('dayViewBody');
    var dayLabel = document.getElementById('currentDayLabel');
    var d = state.currentDate;
    var y = d.getFullYear();
    var m = d.getMonth();
    var day = d.getDate();
    var dayKey = y + '-' + String(m + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');

    dayLabel.textContent = formatDate(dayKey);

    var dayReservations = getReservationsForDay(y, m, day);
    var html = '';

    for (var h = HOUR_START; h <= HOUR_END; h++) {
      var hourLabel = (h < 10 ? '0' : '') + h + ':00';
      var events = dayReservations.filter(function (r) { return parseHour(r.hora) === h; });
      var eventsHtml = events.map(function (ev) {
        var label = (ev.hora || '') + ' — ' + (ev.asunto || 'Reservado');
        return '<button type="button" class="event-pill" data-id="' + escapeAttr(ev.id) + '" title="' + escapeAttr(label) + '">' + escapeAttr(label) + '</button>';
      }).join('');
      if (!eventsHtml) eventsHtml = '<span class="day-slot-empty">—</span>';
      html += '<div class="day-view-row">' +
        '<div class="day-view-hour">' + hourLabel + '</div>' +
        '<div class="day-view-events">' + eventsHtml + '</div></div>';
    }

    body.innerHTML = html;

    body.querySelectorAll('.event-pill').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        openDetail(btn.dataset.id);
      });
    });
  }

  function escapeAttr(s) {
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function openModal(prefillDate) {
    if (!state.user) return;
    var overlay = document.getElementById('modalOverlay');
    var form = document.getElementById('reservationForm');
    var fechaInput = document.getElementById('fecha');
    var horaInput = document.getElementById('hora');
    form.reset();
    document.getElementById('responsable').value = state.user.name || state.user.email;
    if (prefillDate) {
      fechaInput.value = prefillDate;
    } else {
      var d = state.currentDate;
      fechaInput.value = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }
    horaInput.setAttribute('min', '08:00');
    horaInput.setAttribute('max', '18:00');
    overlay.classList.add('open');
    document.getElementById('asunto').focus();
  }

  function closeModal() {
    document.getElementById('modalOverlay').classList.remove('open');
  }

  function openDetail(id) {
    var res = state.reservations.find(function (r) { return r.id === id; });
    if (!res) return;
    var content = document.getElementById('detailContent');
    var canDelete = state.user && res.reservadoPor === state.user.email;
    content.innerHTML =
      '<div class="detail-row"><div class="detail-label">Fecha de reserva</div><div class="detail-value">' + formatDate(res.fecha) + '</div></div>' +
      '<div class="detail-row"><div class="detail-label">Hora</div><div class="detail-value">' + escapeHtml(res.hora) + '</div></div>' +
      '<div class="detail-row"><div class="detail-label">Reservado por</div><div class="detail-value">' + escapeHtml(res.reservadoPor || res.responsable || '—') + '</div></div>';
    document.getElementById('detailOverlay').classList.add('open');
    var deleteBtn = document.getElementById('deleteReservation');
    deleteBtn.dataset.id = id;
    deleteBtn.style.display = canDelete ? '' : 'none';
  }

  function closeDetail() {
    document.getElementById('detailOverlay').classList.remove('open');
    document.getElementById('deleteReservation').style.display = '';
  }

  function escapeHtml(s) {
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function formatDate(isoDate) {
    var parts = isoDate.split('-').map(Number);
    return parts[2] + ' de ' + months[parts[1] - 1] + ' de ' + parts[0];
  }

  function onFormSubmit(e) {
    e.preventDefault();
    if (!state.user) return;
    var responsable = document.getElementById('responsable').value.trim();
    var asunto = document.getElementById('asunto').value.trim();
    var fecha = document.getElementById('fecha').value;
    var hora = document.getElementById('hora').value;
    var participantes = document.getElementById('participantes').value.trim();

    var h = parseHour(hora);
    if (h < HOUR_START || h > HOUR_END) {
      alert('La hora debe estar entre 8:00 y 18:00.');
      return;
    }

    var data = {
      responsable: responsable,
      asunto: asunto,
      fecha: fecha,
      hora: hora,
      participantes: participantes || '',
      reservadoPor: state.user.email
    };

    if (useFirebase) {
      var db = initFirebase();
      if (db) {
        function doAdd() {
          db.collection('reservations').add(data).then(function () {
            closeModal();
          }).catch(function (err) {
            if (err && err.code === 'permission-denied' && firebase && firebase.auth && !firebase.auth().currentUser) {
              setTimeout(doAdd, 1500);
              return;
            }
            alert('No se pudo guardar en la nube. Revisa la consola (F12).');
            console.warn('Firestore add error', err);
          });
        }
        doAdd();
        return;
      }
    }

    data.id = 'id_' + Date.now();
    state.reservations.push(data);
    saveReservationsLocal();
    closeModal();
    renderDayView();
  }

  function deleteReservation() {
    var id = document.getElementById('deleteReservation').dataset.id;
    if (!id) return;
    var res = state.reservations.find(function (r) { return r.id === id; });
    if (res && state.user && res.reservadoPor !== state.user.email) return;

    if (useFirebase) {
      var db = initFirebase();
      if (db) {
        db.collection('reservations').doc(id).delete().then(function () {
          closeDetail();
        }).catch(function (err) {
          console.warn(err);
        });
        return;
      }
    }

    state.reservations = state.reservations.filter(function (r) { return r.id !== id; });
    saveReservationsLocal();
    closeDetail();
    renderDayView();
  }

  function prevDay() {
    state.currentDate.setDate(state.currentDate.getDate() - 1);
    renderDayView();
  }

  function nextDay() {
    state.currentDate.setDate(state.currentDate.getDate() + 1);
    renderDayView();
  }

  document.getElementById('prevDay').addEventListener('click', prevDay);
  document.getElementById('nextDay').addEventListener('click', nextDay);
  document.getElementById('newReservation').addEventListener('click', function () { openModal(); });
  document.getElementById('reservationForm').addEventListener('submit', onFormSubmit);
  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('cancelReservation').addEventListener('click', closeModal);
  document.getElementById('modalOverlay').addEventListener('click', function (e) {
    if (e.target.id === 'modalOverlay') closeModal();
  });
  document.getElementById('closeDetail').addEventListener('click', closeDetail);
  document.getElementById('closeDetailBtn').addEventListener('click', closeDetail);
  document.getElementById('deleteReservation').addEventListener('click', deleteReservation);
  document.getElementById('detailOverlay').addEventListener('click', function (e) {
    if (e.target.id === 'detailOverlay') closeDetail();
  });

  if (useFirebase) {
    subscribeReservations();
  } else {
    state.reservations = loadReservationsLocal();
    renderDayView();
    setConnectionStatus('local', 'Modo local: configura Firebase en config.js (projectId, apiKey, etc.) y que todos abran la MISMA URL (ej. GitHub Pages).');
  }
  updateReservationButton();

  function tryInitGoogleAuth() {
    if (!window.TACTICAL_SUPPORT_GOOGLE_CLIENT_ID) return;
    if (window.google && window.google.accounts && window.google.accounts.id) {
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
