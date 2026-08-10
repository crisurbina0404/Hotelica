// ============================================
// HOTELICA — Lógica del Buscador (HU-001)
// Vanilla JS, comentarios simples de una línea
// Estilos y datos copiados de referencia-visual.html
// ============================================

// Helper corto para querySelector
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];

// Estado global de los filtros
const state={dept:'Todos', maxPrice:170, amenities:new Set(), favs:new Set()};

// Catálogo de servicios con icono Lucide (nombre del icono) y nombre legible
const AMEN={wifi:['wifi','Wifi'],piscina:['waves','Piscina'],desayuno:['coffee','Desayuno'],parqueo:['square-parking','Parqueo'],ac:['snowflake','Aire acond.'],bar:['martini','Bar'],restaurante:['utensils','Restaurante'],spa:['flower-2','Spa'],senderos:['footprints','Senderos'],gym:['dumbbell','Gimnasio']};

// Contador único para IDs de gradientes SVG
let uid=0;

// Genera una escena SVG ilustrada según el tipo de paisaje
function scene(type){
  const u='sg'+(uid++);
  const S={
  beach:`<svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="${u}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD79A"/><stop offset="1" stop-color="#FF8A5E"/></linearGradient>
    <linearGradient id="${u}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2AA5B5"/><stop offset="1" stop-color="#0E6E86"/></linearGradient></defs>
    <rect width="400" height="150" fill="url(#${u}a)"/><circle cx="298" cy="92" r="44" fill="#FFF4D6" opacity=".35"/><circle cx="298" cy="92" r="28" fill="#FFF4D6"/>
    <rect y="140" width="400" height="100" fill="url(#${u}b)"/>
    <path d="M0 154 Q50 148 100 154 T200 154 T300 154 T400 154" stroke="#BFF0F2" stroke-width="3" fill="none" opacity=".7"/>
    <path d="M0 174 Q50 168 100 174 T200 174 T300 174 T400 174" stroke="#BFF0F2" stroke-width="3" fill="none" opacity=".4"/>
    <path d="M0 240 L0 206 Q90 186 190 215 L400 240 Z" fill="#F2D9A6"/>
    <path d="M60 212 C64 180 58 162 70 134" stroke="#5A3A22" stroke-width="7" fill="none" stroke-linecap="round"/>
    <g fill="#1E7A4E"><path d="M70 134 Q40 120 18 130 Q44 110 72 124 Z"/><path d="M70 134 Q100 116 124 124 Q96 108 68 122 Z"/><path d="M70 134 Q60 106 40 100 Q68 102 76 128 Z"/><path d="M70 134 Q84 106 106 102 Q80 106 66 130 Z"/></g>
    <path d="M248 62 q6 -8 12 0 M268 54 q6 -8 12 0" stroke="#7A4A2B" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`,
  colonial:`<svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="${u}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CDE9E2"/><stop offset="1" stop-color="#F7E8C3"/></linearGradient></defs>
    <rect width="400" height="240" fill="url(#${u}a)"/><circle cx="52" cy="42" r="20" fill="#FFD79A"/>
    <rect x="40" y="72" width="320" height="140" fill="#F6E8C9" stroke="#D9BE8C" stroke-width="2"/>
    <rect x="28" y="50" width="344" height="24" fill="#C4552F"/><path d="M28 62 h344" stroke="#A33E20" stroke-width="3"/>
    <rect x="58" y="96" width="284" height="9" fill="#B98A54"/>
    <path d="M90 212 v-58 a30 30 0 0 1 60 0 v58 z" fill="#7A4A2B"/><path d="M170 212 v-58 a30 30 0 0 1 60 0 v58 z" fill="#8A5636"/><path d="M250 212 v-58 a30 30 0 0 1 60 0 v58 z" fill="#7A4A2B"/>
    <rect x="188" y="168" width="24" height="44" fill="#4A2E1E"/>
    <circle cx="120" cy="128" r="4" fill="#F5A623"/><circle cx="280" cy="128" r="4" fill="#F5A623"/>
    <rect y="212" width="400" height="28" fill="#C9B08A"/><path d="M30 226 h20 M90 232 h16 M160 226 h22 M240 232 h18 M320 226 h20" stroke="#A98F66" stroke-width="3" stroke-linecap="round"/>
    <circle cx="66" cy="200" r="12" fill="#2F7355"/><circle cx="336" cy="200" r="12" fill="#2F7355"/><rect x="61" y="204" width="10" height="10" fill="#A33E20"/><rect x="331" y="204" width="10" height="10" fill="#A33E20"/></svg>`,
  volcano:`<svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="${u}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CBE7F5"/><stop offset="1" stop-color="#EDF8E6"/></linearGradient></defs>
    <rect width="400" height="240" fill="url(#${u}a)"/><circle cx="340" cy="48" r="22" fill="#FFD79A"/>
    <ellipse cx="132" cy="46" rx="17" ry="7" fill="#fff" opacity=".9"/><ellipse cx="146" cy="34" rx="11" ry="5" fill="#fff" opacity=".7"/>
    <path d="M-30 200 L132 56 L294 200 Z" fill="#3E6B52"/><path d="M118 68 L132 56 L148 68 L140 74 L128 72 Z" fill="#2C4F3C"/>
    <path d="M180 200 L302 94 L434 200 Z" fill="#2F5544"/>
    <rect y="192" width="400" height="48" fill="#2E8FA3"/><path d="M40 206 h50 M150 214 h40 M260 206 h56 M340 216 h34" stroke="#9FE0E8" stroke-width="3" stroke-linecap="round" opacity=".8"/>
    <path d="M0 240 L0 226 Q200 214 400 228 L400 240 Z" fill="#24584A"/>
    <path d="M230 60 q6 -8 12 0 M252 50 q6 -8 12 0" stroke="#4A5F56" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`,
  city:`<svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="${u}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#35507A"/><stop offset="1" stop-color="#FF9E6D"/></linearGradient></defs>
    <rect width="400" height="240" fill="url(#${u}a)"/><circle cx="330" cy="52" r="16" fill="#FDF3D8" opacity=".95"/>
    <rect x="20" y="110" width="52" height="110" fill="#22304A"/><rect x="84" y="80" width="60" height="140" fill="#1B2740"/><rect x="156" y="126" width="46" height="94" fill="#22304A"/><rect x="214" y="66" width="66" height="154" fill="#1B2740"/><rect x="292" y="104" width="54" height="116" fill="#22304A"/><rect x="356" y="140" width="44" height="80" fill="#1B2740"/>
    <g fill="#FFC868"><rect x="94" y="94" width="9" height="9"/><rect x="116" y="94" width="9" height="9"/><rect x="94" y="116" width="9" height="9"/><rect x="226" y="80" width="9" height="9"/><rect x="250" y="80" width="9" height="9"/><rect x="226" y="104" width="9" height="9"/><rect x="250" y="128" width="9" height="9"/><rect x="302" y="118" width="9" height="9"/><rect x="324" y="140" width="9" height="9"/><rect x="32" y="126" width="9" height="9"/><rect x="52" y="148" width="9" height="9"/><rect x="166" y="140" width="9" height="9"/></g>
    <rect y="218" width="400" height="22" fill="#141D30"/><path d="M20 229 h30 M90 229 h30 M160 229 h30 M230 229 h30 M300 229 h30 M370 229 h20" stroke="#F5A623" stroke-width="3" stroke-linecap="round" opacity=".8"/></svg>`,
  island:`<svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="${u}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BDEDF2"/><stop offset="1" stop-color="#EAFBF3"/></linearGradient></defs>
    <rect width="400" height="240" fill="url(#${u}a)"/><circle cx="70" cy="52" r="24" fill="#FFD79A"/>
    <rect y="128" width="400" height="112" fill="#18A7BC"/>
    <path d="M0 140 Q100 134 200 140 T400 140" stroke="#BFF0F2" stroke-width="3" fill="none" opacity=".7"/>
    <path d="M110 150 Q200 108 290 150 Z" fill="#F2D9A6"/>
    <path d="M196 132 C198 116 194 106 200 92" stroke="#5A3A22" stroke-width="5" fill="none" stroke-linecap="round"/>
    <g fill="#1E7A4E"><path d="M200 92 Q180 82 166 88 Q184 74 202 84 Z"/><path d="M200 92 Q220 80 236 86 Q216 74 198 84 Z"/><path d="M200 92 Q196 72 182 68 Q200 70 204 88 Z"/></g>
    <path d="M300 176 q22 14 44 0 l-6 12 h-32 z" fill="#7A4A2B"/><path d="M322 176 v-30 l20 26 h-20 z" fill="#fff"/><path d="M320 176 v-24 l-14 20 h14 z" fill="#F6E8C9"/>
    <path d="M60 190 h40 M140 206 h30 M330 210 h36" stroke="#9FE0E8" stroke-width="3" stroke-linecap="round" opacity=".8"/></svg>`,
  eco:`<svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="${u}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E8F4E4"/><stop offset="1" stop-color="#FDF6E3"/></linearGradient></defs>
    <rect width="400" height="240" fill="url(#${u}a)"/><circle cx="320" cy="50" r="20" fill="#FFD79A" opacity=".8"/>
    <path d="M0 130 L90 66 L180 130 Z" fill="#A8CDB4"/><path d="M120 138 L230 58 L340 138 Z" fill="#8FBFA0"/><path d="M250 142 L350 78 L450 142 Z" fill="#A8CDB4"/>
    <rect y="128" width="400" height="14" fill="#fff" opacity=".5"/>
    <path d="M0 240 L0 160 Q120 120 240 164 Q330 194 400 172 L400 240 Z" fill="#3E7D5F"/>
    <path d="M60 190 l14 -30 l14 30 z M100 200 l12 -26 l12 26 z M300 196 l13 -28 l13 28 z" fill="#24584A"/>
    <rect x="196" y="182" width="52" height="34" fill="#7A4A2B"/><path d="M190 184 L222 162 L254 184 Z" fill="#5A3A22"/><rect x="214" y="194" width="16" height="22" fill="#FFC868"/>
    <path d="M150 84 q6 -8 12 0 M170 76 q6 -8 12 0" stroke="#4A5F56" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`
  };
  return S[type]||S.eco;
}

// Lista de hoteles (solo los "aprobado" se muestran en resultados)
const HOTELS=[
 {id:1,name:'Hotel Plaza Colón',dept:'Granada',city:'Granada',scene:'colonial',rating:4.7,reviews:214,featured:true,
  tags:['Centro histórico','Colonial','Piscina'],amenities:['wifi','piscina','desayuno','parqueo','ac','restaurante'],status:'aprobado',
  desc:'Casona colonial de 1890 restaurada, a dos cuadras del Parque Central de Granada.',
  rooms:[{tipo:'Sencilla Estándar',cap:1,precio:65,total:6,ocupadas:2,mant:false},{tipo:'Doble Deluxe',cap:3,precio:85,total:10,ocupadas:6,mant:false},{tipo:'Suite Colonial',cap:2,precio:100,total:4,ocupadas:3,mant:false}]},
 {id:2,name:'Selina Maderas',dept:'Rivas',city:'San Juan del Sur',scene:'beach',rating:4.5,reviews:389,
  tags:['Surf','Frente al mar','Coworking'],amenities:['wifi','bar','ac','piscina'],status:'aprobado',
  desc:'Hostal boutique frente a la bahía, meca del surf con coworking y piscina infinita.',
  rooms:[{tipo:'Dormitorio Compartido',cap:1,precio:22,total:8,ocupadas:3,mant:false},{tipo:'Doble Frente al Mar',cap:2,precio:45,total:8,ocupadas:4,mant:false},{tipo:'Suite Vista Bahía',cap:2,precio:68,total:3,ocupadas:1,mant:false}]},
 {id:3,name:'Totoco Plantation',dept:'Rivas',city:'Ometepe',scene:'volcano',rating:4.9,reviews:96,
  tags:['Eco-lodge','Vista al volcán','Yoga'],amenities:['wifi','desayuno','spa','senderos'],status:'aprobado',
  desc:'Eco-lodge de lujo a los pies del volcán Concepción. Yoga al amanecer y senderos privados.',
  rooms:[{tipo:'Doble Jardín',cap:2,precio:88,total:5,ocupadas:2,mant:false},{tipo:'Cabaña Vista Volcán',cap:3,precio:110,total:6,ocupadas:2,mant:false}]},
 {id:4,name:'Hotel Los Robles',dept:'Managua',city:'Managua',scene:'city',rating:4.3,reviews:512,
  tags:['Negocios','Céntrico','Aeropuerto'],amenities:['wifi','parqueo','ac','restaurante','gym'],status:'aprobado',
  desc:'Hotel urbano en el corazón de Managua, ideal para viajes de negocios.',
  rooms:[{tipo:'Sencilla Business',cap:1,precio:58,total:12,ocupadas:5,mant:false},{tipo:'Doble Estándar',cap:2,precio:70,total:15,ocupadas:8,mant:false},{tipo:'Suite Ejecutiva',cap:3,precio:95,total:5,ocupadas:2,mant:false}]},
 {id:5,name:'La Posada de Doña Inés',dept:'León',city:'León',scene:'colonial',rating:4.6,reviews:178,
  tags:['Colonial','Rooftop','Arte'],amenities:['wifi','desayuno','bar','ac'],status:'aprobado',
  desc:'Posada familiar en el casco histórico de León, con rooftop frente a la Catedral.',
  rooms:[{tipo:'Sencilla Patio',cap:1,precio:42,total:5,ocupadas:1,mant:false},{tipo:'Doble Patio',cap:2,precio:55,total:7,ocupadas:3,mant:false}]},
 {id:6,name:'Arenas Beach Resort',dept:'RACCS',city:'Corn Island',scene:'island',rating:4.8,reviews:143,featured:true,
  tags:['Caribe','Buceo','Todo incluido'],amenities:['wifi','desayuno','bar','spa','ac'],status:'aprobado',
  desc:'Resort caribeño sobre arena blanca en Little Corn Island.',
  rooms:[{tipo:'Doble Playa',cap:2,precio:118,total:8,ocupadas:5,mant:false},{tipo:'Cabaña Caribeña',cap:3,precio:130,total:5,ocupadas:4,mant:false}]},
 {id:7,name:'Selva Negra Mountain Lodge',dept:'Matagalpa',city:'Matagalpa',scene:'eco',rating:4.4,reviews:203,
  tags:['Bosque nuboso','Senderos','Familiar'],amenities:['wifi','desayuno','senderos','restaurante'],status:'aprobado',
  desc:'Lodge de montaña entre pinos y neblina, con senderos de bosque nuboso.',
  rooms:[{tipo:'Doble Bosque',cap:2,precio:58,total:6,ocupadas:3,mant:false},{tipo:'Cabaña Pino',cap:4,precio:65,total:6,ocupadas:2,mant:false}]}
];

// Calcula el precio mínimo de un hotel (para el "desde $X/noche")
const pbase=h=>Math.min(...h.rooms.map(r=>r.precio));

// ============================================
// FUNCIONES DE LA LÓGICA
// ============================================

// Crea el HTML de una tarjeta de hotel
function cardHTML(h,i){
  // Calculamos habitaciones disponibles (restamos ocupadas y mantenimiento)
  const disp=h.rooms.reduce((a,r)=>a+Math.max(0,r.total-r.ocupadas-(r.mant?r.total:0)),0);
  return `<article class="hcard" style="animation-delay:${i*60}ms">
    <div class="ph">${h.featured?'<span class="flag"><i data-lucide="star"></i> Destacado</span>':''}${scene(h.scene)}
      <button class="heart ${state.favs.has(h.id)?'on':''}" onclick="toggleFav(${h.id},this)" title="Guardar en favoritos"><i data-lucide="heart"></i></button>
    </div>
    <div class="hbody">
      <div class="hloc"><i data-lucide="map-pin"></i> ${h.city}, ${h.dept}</div>
      <h3 class="hname">${h.name}</h3>
      <div class="hrate"><b><i data-lucide="star"></i> ${h.rating}</b> · ${h.reviews} reseñas</div>
      <div class="htags">${h.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>
      <div class="hfoot">
        <div class="price"><b>$${pbase(h)}</b> <span>/noche<br>desde</span></div>
      </div>
      <div style="font-size:.75rem;font-weight:700;margin-top:.5rem;color:${disp>0?'var(--teal)':'#B3341C'}">${disp>0?disp+' habitaciones disponibles esta semana':'Sin disponibilidad esta semana'}</div>
    </div>
  </article>`;
}

// Filtra y ordena la lista de hoteles según el estado
function renderHotels(){
  // Solo se muestran hoteles con estado "aprobado"
  let list=HOTELS.filter(h=>h.status==='aprobado');
  // Filtro por departamento
  if(state.dept!=='Todos')list=list.filter(h=>h.dept===state.dept);
  // Filtro por precio máximo
  list=list.filter(h=>pbase(h)<=state.maxPrice);
  // Filtro por servicios (debe tener todos los seleccionados)
  if(state.amenities.size)list=list.filter(h=>[...state.amenities].every(a=>h.amenities.includes(a)));
  // Ordenamiento según el select
  const s=$('#sort').value;
  if(s==='precio-asc')list.sort((a,b)=>pbase(a)-pbase(b));
  if(s==='precio-desc')list.sort((a,b)=>pbase(b)-pbase(a));
  if(s==='rating')list.sort((a,b)=>b.rating-a.rating);
  if(s==='recomendados')list.sort((a,b)=>(b.featured-a.featured)||(b.rating-a.rating));
  // Renderizamos las tarjetas o el mensaje de vacío
  $('#grid').innerHTML=list.length?list.map(cardHTML).join(''):`<div class="empty"><div class="big"><i data-lucide="search-x"></i></div><h3 style="font-family:var(--display);margin:.4rem 0">No encontramos hoteles con esos filtros</h3><p>Probá ampliar el precio o quitar servicios.</p></div>`;
  // Actualizamos el contador de resultados
  $('#rescount').textContent=`${list.length} hotel${list.length!==1?'es':''} ${state.dept!=='Todos'?'en '+state.dept:'disponibles'} · ${nochesDe($('#f-in').value,$('#f-out').value)} noches`;
  // Actualizamos el stat del hero
  $('#stat-hoteles').textContent=HOTELS.filter(h=>h.status==='aprobado').length;
  // Reinicializamos iconos Lucide insertados dinámicamente
  if(window.lucide) lucide.createIcons();
}

// Alterna favorito de un hotel
function toggleFav(id,btn){
  if(state.favs.has(id)){state.favs.delete(id);btn.classList.remove('on');toast('Quitado de favoritos','heart-off');}
  else{state.favs.add(id);btn.classList.add('on');toast('Guardado en tus favoritos','heart');}
  $('#favcount').textContent=state.favs.size;
}

// Limpia todos los filtros laterales
function limpiarFiltros(){
  state.dept='Todos';state.maxPrice=170;state.amenities.clear();
  $('#fprice').value=170;$('#pval').textContent='$170';
  $$('#fdept input,#famen input').forEach(c=>c.checked=false);
  renderHotels();toast('Filtros restablecidos','rotate-ccw');
}

// Maneja el submit del formulario de búsqueda
function buscar(e){
  e.preventDefault();
  // Validamos las fechas antes de buscar
  if(!validarFechas())return;
  // Tomamos el destino del select principal
  state.dept=$('#f-dept').value;
  // Sincronizamos el checkbox del departamento en los filtros laterales
  $$('#fdept input').forEach(c=>c.checked=(c.value===state.dept&&state.dept!=='Todos'));
  renderHotels();
  // Scroll suave hasta los resultados
  document.getElementById('hoteles').scrollIntoView({behavior:'smooth'});
  const n=$('#grid').querySelectorAll('.hcard').length;
  toast(`${n} hoteles encontrados${state.dept!=='Todos'?' en '+state.dept:''} para tus fechas`);
}

// Valida que la salida sea posterior a la llegada
function validarFechas(){
  const llegada=$('#f-in').value;
  const salida=$('#f-out').value;
  const err=$('#mensaje-error');
  // Si la salida es igual o anterior a la llegada, mostramos error
  if(llegada && salida && salida<=llegada){
    err.hidden=false;
    err.textContent='La fecha de salida debe ser posterior a la de llegada.';
    return false;
  }
  err.hidden=true;
  return true;
}

// Calcula la cantidad de noches entre dos fechas
const nochesDe=(a,b)=>{let n=Math.round((new Date(b)-new Date(a))/864e5);return n>0?n:1};

// Muestra un toast temporal con icono Lucide
function toast(msg,icon='circle-check'){
  const t=document.createElement('div');
  t.className='toast';
  t.innerHTML=`<i data-lucide="${icon}"></i><span>${msg}</span>`;
  $('#toasts').appendChild(t);
  if(window.lucide) lucide.createIcons();
  setTimeout(()=>{t.classList.add('out');setTimeout(()=>t.remove(),380)},3400);
}

// ============================================
// INICIALIZACIÓN AL CARGAR LA PÁGINA
// ============================================
(function init(){
  // Fechas por defecto: hoy y mañana
  let hoy=new Date();
  let manana=new Date(hoy);manana.setDate(hoy.getDate()+1);
  $('#f-in').value=hoy.toISOString().split('T')[0];
  $('#f-out').value=manana.toISOString().split('T')[0];

  // Llenamos el select principal de departamentos
  const depts=[...new Set(HOTELS.map(h=>h.dept))];
  $('#f-dept').innerHTML='<option>Todos</option>'+depts.map(d=>`<option>${d}</option>`).join('');
  // Checkboxes de departamento en los filtros
  $('#fdept').innerHTML=depts.map(d=>`<label class="chk"><input type="checkbox" value="${d}" onchange="state.dept=this.checked?this.value:'Todos';$$('#fdept input').forEach(c=>{if(c!==this)c.checked=false});if(!this.checked)state.dept='Todos';renderHotels()"> ${d}</label>`).join('');
  // Checkboxes de servicios en los filtros
  $('#famen').innerHTML=Object.keys(AMEN).slice(0,8).map(a=>`<label class="chk"><input type="checkbox" value="${a}" onchange="this.checked?state.amenities.add('${a}'):state.amenities.delete('${a}');renderHotels()"> <i data-lucide="${AMEN[a][0]}"></i> ${AMEN[a][1]}</label>`).join('');

  // Texto del marquee (cinta naranja)
  const dest='GRANADA · LEÓN · OMETEPE · SAN JUAN DEL SUR · CORN ISLAND · MATAGALPA · ESTELÍ · MASAYA · ';
  $('#mq').textContent=dest+dest;

  // Render inicial (comentado: sin base de datos todavía, el placeholder del HTML se mantiene)
  // renderHotels();

  // Animación reveal al hacer scroll
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.12});
  $$('.reveal').forEach(el=>io.observe(el));

  // Inicializamos iconos Lucide del HTML estático (header, hero, filtros, footer)
  if(window.lucide) lucide.createIcons();
})();
