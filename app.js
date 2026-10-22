(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const STORE = 'bungoma_extension_demo_v1';
  const seed = {
    farmers:[
      {id:1,name:'Mary Wanjiku',phone:'0712345678',ward:'Kanduyi',crop:'Maize'},
      {id:2,name:'Peter Wafula',phone:'0723456789',ward:'Webuye',crop:'Beans'},
      {id:3,name:'Grace Nasimiyu',phone:'0734567890',ward:'Kimilili',crop:'Dairy'},
      {id:4,name:'John Barasa',phone:'0700123456',ward:'Tongaren',crop:'Maize'}
    ],
    announcements:[
      {id:1,title:'Fall armyworm scouting',message:'Inspect maize leaves weekly and report signs of fall armyworm to your extension officer.',ward:'All wards',date:new Date().toISOString().slice(0,10),status:'Published'},
      {id:2,title:'Dairy farmer field day',message:'Join the dairy field day at the ward demonstration farm. Bring your questions for the extension team.',ward:'Kimilili',date:new Date().toISOString().slice(0,10),status:'Draft'}
    ], deliveries:[{id:1,farmerId:1,announcementId:1,status:'Delivered',date:new Date().toISOString()},{id:2,farmerId:2,announcementId:1,status:'Pending',date:new Date().toISOString()}], nextId:5
  };
  let data;
  try { data = JSON.parse(localStorage.getItem(STORE)) || structuredClone(seed); } catch { data = structuredClone(seed); }
  const save = () => localStorage.setItem(STORE, JSON.stringify(data));
  let user = null, page = 'dashboard', searchTerm = '', editing = null, formType = null;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const dateShort = d => { try { return new Date(d).toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'}); } catch { return d; } };
  const farmer = id => data.farmers.find(f=>f.id===id);
  const announcement = id => data.announcements.find(a=>a.id===id);
  const statusPill = s => `<span class="pill ${esc(String(s).toLowerCase())}">${esc(s)}</span>`;
  function toast(msg, warning=false){const n=$('#notice');n.textContent=msg;n.classList.remove('hidden','warning');if(warning)n.classList.add('warning');setTimeout(()=>n.classList.add('hidden'),3500)}
  function showApp(){ $('#login-screen').classList.add('hidden');$('#app').classList.remove('hidden');$('#profile-name').textContent=user.name;$('#profile-role').textContent=user.role;$('#avatar').textContent=user.name[0].toUpperCase();render(); }
  $('#login-form').addEventListener('submit',e=>{e.preventDefault();const u=$('#username').value.trim(),p=$('#password').value; if((u==='mahad'&&p==='shukri9274')||(u==='manager'&&p==='Password123!')){user={name:u==='manager'?'Management':'Mahad',role:u==='manager'?'Management':'Extension officer'};$('#login-error').textContent='';showApp()}else $('#login-error').textContent='Incorrect demo username or password.';});
  $('#logout').addEventListener('click',()=>{user=null;$('#app').classList.add('hidden');$('#login-screen').classList.remove('hidden');$('#password').value='';});
  $('#nav').addEventListener('click',e=>{const b=e.target.closest('[data-page]');if(!b)return;page=b.dataset.page;searchTerm='';$$('.nav-link').forEach(n=>n.classList.toggle('active',n===b));render();});
  function intro(title,sub,button,label){return `<div class="page-intro"><div><h3>${title}</h3><p>${sub}</p></div>${button?`<button class="primary" data-action="${button}">＋ ${label}</button>`:''}</div>`}
  function table(headers, rows, empty='No records found.'){return `<div class="table-wrap"><table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows||`<tr><td colspan="${headers.length}" class="empty">${empty}</td></tr>`}</tbody></table></div>`}
  function stat(label,value,foot){return `<div class="stat"><div class="stat-label">${label}</div><div class="stat-value">${value}</div><div class="stat-foot">${foot}</div></div>`}
  function render(){ $('#page-title').textContent=({dashboard:'Dashboard',farmers:'Farmers',announcements:'Announcements',deliveries:'Delivery log',reports:'Reports'})[page]; const c=$('#page-content'); if(page==='dashboard')c.innerHTML=dashboard(); if(page==='farmers')c.innerHTML=farmersPage();if(page==='announcements')c.innerHTML=announcementsPage();if(page==='deliveries')c.innerHTML=deliveriesPage();if(page==='reports')c.innerHTML=reportsPage(); }
  function dashboard(){const published=data.announcements.filter(a=>a.status==='Published').length;const delivered=data.deliveries.filter(d=>d.status==='Delivered'||d.status==='Confirmed').length;const rows=[...data.announcements].slice().reverse().slice(0,5).map(a=>`<tr><td><b>${esc(a.title)}</b></td><td>${esc(a.ward)}</td><td>${dateShort(a.date)}</td><td>${statusPill(a.status)}</td><td><button class="text-btn" data-action="edit-announcement" data-id="${a.id}">Edit</button></td></tr>`).join('');return `${intro('Good day, '+esc(user.name),'Here is a snapshot of extension communication activity.')}<div class="stats">${stat('Registered farmers',data.farmers.length,'Farmer records in the system')}${stat('Announcements',data.announcements.length,'Total created')}${stat('Published notices',published,'Available for delivery')}${stat('Delivered SMS',delivered,'Demo delivery records')}</div><div class="quick-grid"><div class="panel"><div class="panel-head"><h3>Recent announcements</h3><button class="text-btn" data-page="announcements">View all →</button></div>${table(['Announcement','Target ward','Date','Status',''],rows,'Create an announcement to get started.')}</div><div class="panel"><div class="panel-head"><h3>Quick actions</h3></div><button class="quick-action" data-action="add-farmer"><span><b>Register a farmer</b><small>Add farmer contact and ward details</small></span><strong>＋</strong></button><button class="quick-action" data-action="add-announcement"><span><b>Create announcement</b><small>Draft an agricultural extension notice</small></span><strong>＋</strong></button><button class="quick-action" data-page="deliveries"><span><b>Check delivery log</b><small>Review simulated message statuses</small></span><strong>→</strong></button><p class="report-note">GitHub Pages demo: records are saved in this browser using local storage. SMS sending is simulated.</p></div></div>`}
  function farmersPage(){const q=searchTerm.toLowerCase();const rows=data.farmers.filter(f=>[f.name,f.phone,f.ward,f.crop].some(x=>x.toLowerCase().includes(q))).map(f=>`<tr><td><b>${esc(f.name)}</b></td><td>${esc(f.phone)}</td><td>${esc(f.ward)}</td><td>${esc(f.crop)}</td><td><div class="table-actions"><button class="text-btn" data-action="edit-farmer" data-id="${f.id}">Edit</button><button class="text-btn danger" data-action="delete-farmer" data-id="${f.id}">Delete</button></div></td></tr>`).join('');return `${intro('Farmer directory','Manage farmer contacts and agricultural interests.','add-farmer','Add farmer')}<div class="panel"><div class="toolbar"><input id="search" placeholder="Search name, phone, ward or crop…" value="${esc(searchTerm)}"><span class="report-note">${data.farmers.length} farmer(s)</span></div>${table(['Farmer name','Phone','Ward','Interest','Actions'],rows)}</div>`}
  function announcementsPage(){const rows=data.announcements.slice().reverse().map(a=>`<tr><td><b>${esc(a.title)}</b><div class="report-note">${esc(a.message.slice(0,70))}${a.message.length>70?'…':''}</div></td><td>${esc(a.ward)}</td><td>${dateShort(a.date)}</td><td>${statusPill(a.status)}</td><td><div class="table-actions"><button class="text-btn" data-action="edit-announcement" data-id="${a.id}">Edit</button>${a.status==='Draft'?`<button class="text-btn" data-action="publish" data-id="${a.id}">Publish</button>`:`<button class="text-btn" data-action="send" data-id="${a.id}">Send demo SMS</button>`}<button class="text-btn danger" data-action="delete-announcement" data-id="${a.id}">Delete</button></div></td></tr>`).join('');return `${intro('Announcements','Create notices, publish them and simulate SMS delivery.','add-announcement','New announcement')}<div class="panel">${table(['Announcement','Ward','Created','Status','Actions'],rows,'No announcements yet.')}</div>`}
  function deliveriesPage(){const rows=data.deliveries.slice().reverse().map(d=>`<tr><td>${esc(farmer(d.farmerId)?.name||'Deleted farmer')}</td><td>${esc(announcement(d.announcementId)?.title||'Deleted announcement')}</td><td>${dateShort(d.date)}</td><td>${statusPill(d.status)}</td><td>${d.status==='Pending'?`<button class="text-btn" data-action="mark-delivered" data-id="${d.id}">Mark delivered</button>`:''}${d.status==='Delivered'?`<button class="text-btn" data-action="confirm" data-id="${d.id}">Confirm receipt</button>`:''}</td></tr>`).join('');return `${intro('Delivery log','Review demo SMS records and update delivery or receipt status.')}<div class="panel"><div class="toolbar"><span class="report-note">${data.deliveries.length} delivery record(s). Real SMS is not sent from this static page.</span></div>${table(['Farmer','Announcement','Date','Status','Action'],rows,'No delivery records yet. Publish a notice and select Send demo SMS.')}</div>`}
  function reportsPage(){const delivered=data.deliveries.filter(d=>['Delivered','Confirmed'].includes(d.status)).length;const confirmed=data.deliveries.filter(d=>d.status==='Confirmed').length;const pending=data.deliveries.filter(d=>d.status==='Pending').length;const failed=data.deliveries.filter(d=>d.status==='Failed').length;const total=data.deliveries.length||1;return `${intro('Reports & coverage','A quick summary of farmer outreach and delivery outcomes.')}<div class="stats">${stat('Farmers registered',data.farmers.length,'All wards')}${stat('Messages recorded',data.deliveries.length,'Simulated deliveries')}${stat('Delivered / confirmed',delivered,Math.round(delivered/total*100)+'% of records')}${stat('Receipt confirmations',confirmed,'Confirmed by staff in demo')}</div><div class="panel"><div class="panel-head"><h3>Delivery status breakdown</h3></div>${[['Delivered',delivered],['Confirmed',confirmed],['Pending',pending],['Failed',failed]].map(([name,n])=>`<div class="bar-row"><span>${name}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.min(100,n/total*100)}%"></div></div><b>${n}</b></div>`).join('')}<p class="report-note">These figures are generated from the browser demo's local data, not from a live SMS provider.</p><button class="secondary" data-action="export">Export report as CSV</button></div>`}
  const fields={farmer:[['name','Farmer name','text',true],['phone','Phone number','tel',true],['ward','Ward','select',true,['Kanduyi','Webuye','Kimilili','Tongaren','Bumula','Kabuchai','Sirisia','All wards']],['crop','Main interest','select',true,['Maize','Beans','Dairy','Poultry','Horticulture','Other']]],announcement:[['title','Announcement title','text',true],['message','Message body','textarea',true],['ward','Target ward','select',true,['All wards','Kanduyi','Webuye','Kimilili','Tongaren','Bumula','Kabuchai','Sirisia']],['date','Date','date',true],['status','Status','select',true,['Draft','Published']]]};
  function openForm(type,id=null){formType=type;editing=id;const item=id?(type==='farmer'?farmer(id):announcement(id)):null;$('#dialog-title').textContent=(id?'Edit ':'Add ')+(type==='farmer'?'farmer':'announcement');$('#dialog-fields').innerHTML=fields[type].map(([key,label,kind,required,options])=>{const val=item?.[key]??(key==='date'?new Date().toISOString().slice(0,10):key==='ward'?(type==='farmer'?'Kanduyi':'All wards'):key==='status'?'Draft':'');let input='';if(kind==='select')input=`<select name="${key}" ${required?'required':''}>${options.map(o=>`<option ${val===o?'selected':''}>${esc(o)}</option>`).join('')}</select>`;else if(kind==='textarea')input=`<textarea name="${key}" ${required?'required':''}>${esc(val)}</textarea>`;else input=`<input name="${key}" type="${kind}" value="${esc(val)}" ${required?'required':''} ${key==='phone'?'pattern="[0-9+() -]{7,20}"':''}>`;return `<div class="field"><label>${label}</label>${input}</div>`}).join('');$('#item-dialog').showModal();}
  $('#close-dialog').addEventListener('click',()=>$('#item-dialog').close());$('#cancel-dialog').addEventListener('click',()=>$('#item-dialog').close());
  $('#item-form').addEventListener('submit',e=>{e.preventDefault();const obj=Object.fromEntries(new FormData(e.currentTarget).entries());if(formType==='farmer'){if(editing)Object.assign(farmer(editing),obj);else{obj.id=Date.now();data.farmers.push(obj)}}else{if(editing)Object.assign(announcement(editing),obj);else{obj.id=Date.now();data.announcements.push(obj)}}save();$('#item-dialog').close();render();toast('Record saved successfully.');});
  
async function sendDemo(id) {
  const a = announcement(id);
  if (!a) return;

  const targets = data.farmers.filter(
    f => a.ward === 'All wards' || f.ward === a.ward
  );

  if (!targets.length) {
    toast('No farmers found for this ward.', true);
    return;
  }

  if (!confirm(`Send SMS requests to ${targets.length} farmer(s)?`)) return;

  let sent = 0;
  let failed = 0;

  for (const f of targets) {
    let phone = f.phone.replace(/\D/g, '');
    if (phone.startsWith('0')) {
      phone = '+254' + phone.slice(1);
    } else if (phone.startsWith('254')) {
      phone = '+' + phone;
    }

    try {
      const response = await fetch(
        'https://bungoma-agricultural-office-1.onrender.com/send-sms',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: phone,
            message: a.message
          })
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        failed++;
        continue;
      }

      data.deliveries.push({
        id: Date.now() + sent,
        farmerId: f.id,
        announcementId: a.id,
        status: 'Pending',
        date: new Date().toISOString()
      });

      sent++;
    } catch (error) {
      failed++;
    }
  }

  save();
  render();
  toast(`Requests accepted: ${sent}. Failed: ${failed}.`, failed > 0);
}

  function exportCsv(){const rows=[['Farmer','Phone','Ward','Announcement','Status','Date'],...data.deliveries.map(d=>[farmer(d.farmerId)?.name||'',farmer(d.farmerId)?.phone||'',farmer(d.farmerId)?.ward||'',announcement(d.announcementId)?.title||'',d.status,d.date])];const csv=rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));const a=document.createElement('a');a.href=url;a.download='bungoma-delivery-report.csv';a.click();URL.revokeObjectURL(url);}
  document.addEventListener('click',e=>{const pg=e.target.closest('[data-page]');if(pg&&pg.dataset.page){page=pg.dataset.page;$$('.nav-link').forEach(n=>n.classList.toggle('active',n.dataset.page===page));render();return}const b=e.target.closest('[data-action]');if(!b)return;const a=b.dataset.action,id=Number(b.dataset.id);if(a==='add-farmer')openForm('farmer');if(a==='edit-farmer')openForm('farmer',id);if(a==='add-announcement')openForm('announcement');if(a==='edit-announcement')openForm('announcement',id);if(a==='delete-farmer'&&confirm('Delete this farmer record?')){data.farmers=data.farmers.filter(f=>f.id!==id);save();render();toast('Farmer record deleted.')}if(a==='delete-announcement'&&confirm('Delete this announcement?')){data.announcements=data.announcements.filter(x=>x.id!==id);save();render();toast('Announcement deleted.')}if(a==='publish'){const an=announcement(id);an.status='Published';save();render();toast('Announcement published.')}if(a==='send')sendDemo(id);if(a==='mark-delivered'){const d=data.deliveries.find(x=>x.id===id);d.status='Delivered';save();render();toast('Demo delivery marked delivered.')}if(a==='confirm'){const d=data.deliveries.find(x=>x.id===id);d.status='Confirmed';save();render();toast('Receipt confirmation recorded.')}if(a==='export')exportCsv();});
  document.addEventListener('input',e=>{if(e.target.id==='search'){searchTerm=e.target.value;const pos=e.target.selectionStart;render();const i=$('#search');i.focus();i.setSelectionRange(pos,pos);}});
  save();
})();
