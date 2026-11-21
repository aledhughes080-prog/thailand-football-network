'use strict';
(() => {
  const {db,url,key,code} = TFN;
  const root=document.getElementById('app');
  const staff=document.body.dataset.mode==='staff';
  const stages=['Received','In review','More information needed','Next steps ready','Closed'];
  const columns='id,submitted_at,updated_at,full_name,email,pathway,country,position_or_role,recent_club,highest_level,match_footage,portfolio_links,goals,stage,revision,owner_id';
  const cleanCode=v=>v.toLowerCase().replace(/[\s-]/g,'').trim();
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const stamp=v=>new Intl.DateTimeFormat(undefined,{day:'numeric',month:'short',year:'numeric'}).format(new Date(v));
  const $=id=>document.getElementById(id);
  const loginMail=login=>login.includes('@')?login:login+'@players.tfn.invalid';
  const invite=new URLSearchParams(location.hash.slice(1)).get('activate');
  if(invite) history.replaceState(null,'',location.pathname+location.search);
  let mode=invite&&staff?'activate':'login', viewer=null, term='', filter='', offset=0, activeId=null, revision=null, listGeneration=0, detailGeneration=0;
  const listSize=25;
  const buttons=(label)=>'<button class="button" type="submit">'+esc(label)+'</button>';
  const field=(label,name,opts={})=>'<label class="field">'+esc(label)+'<input name="'+name+'" type="'+(opts.type||'text')+'" autocomplete="'+(opts.auto||'off')+'" '+(opts.attrs||'')+' required></label>';
  const stageTag=s=>'<span class="stage" data-stage="'+esc(s)+'">'+esc(s)+'</span>';
  const stageOptions=(selected,all=false)=>(all?'<option value="">All stages</option>':'')+stages.map(s=>'<option'+(s===selected?' selected':'')+'>'+esc(s)+'</option>').join('');
  function notice(id,msg,bad=false){const n=$(id);if(n){n.className='notice'+(bad?' bad':'');n.textContent=msg;}}
  async function copying(value,button){try{await navigator.clipboard.writeText(value);button.textContent='Copied';}catch{button.textContent='Select and copy the code above';}}
  function signedOut(msg=''){
    viewer=null;
    const isNew=mode==='register', recover=mode==='recover', activate=mode==='activate';
    const title=activate?'Activate staff access':recover?'Recover your account':isNew?'Create your player account':staff?'Staff sign in':'Player sign in';
    const issueKey=isNew||recover||activate;
    const backup=issueKey?code():'';
    const backLink='<button class="text-btn" type="button" data-mode="login">Back to sign in</button>';
    root.innerHTML='<div class="wrap signin"><section class="entry-side"><p class="kicker">'+(staff?'Team workspace':'Player area')+'</p><h1>'+(staff?'The review<br><em>room.</em>':'Your football.<br><em>Your pathway.</em>')+'</h1><p class="lead">'+(staff?'Review the evidence, speak directly to applicants and give each player a clear next step.':'Keep your footage, assessment and conversations with the Thailand Football Network team in one place.')+'</p><figure class="photo"><img src="assets/tommy-osullivan.webp" alt="Tommy O’Sullivan in his Samui United shirt"><figcaption>Tommy O’Sullivan · Samui United</figcaption></figure></section><section class="entry-form"><h2>'+title+'</h2><p class="muted">'+(activate?'Use the invited email address and choose your password.':recover?'Use your saved recovery key to choose a new password.':isNew?'Choose a player ID you can use on any device. You’ll add your contact email when you apply.':staff?'For invited Thailand Football Network staff.':'Sign in with the player ID you chose when you registered.')+'</p><form id="auth-form">'+
      field(staff?'Staff email':'Player ID','login',{type:staff?'email':'text',auto:'username',attrs:staff?'maxlength="254"':'autocapitalize="none" spellcheck="false" maxlength="30" pattern="[a-zA-Z][a-zA-Z0-9_\\-]{3,29}" title="4–30 characters, starting with a letter"'})+
      (recover?field('Current recovery key','proof',{attrs:'spellcheck="false"'}):'')+
      field(issueKey?'Choose a password':'Password','password',{auto:issueKey?'new-password':'current-password',type:'password',attrs:issueKey?'minlength="12" maxlength="72"':'maxlength="128"'})+
      (issueKey?'<p class="help">Use at least 12 characters. Save the recovery key below so you can reset your password.</p><div class="keybox"><strong>Your new recovery key</strong><code class="keycode" id="new-key">'+backup.match(/.{8}/g).join('-')+'</code><button class="text-btn" type="button" id="copy-key">Copy recovery key</button><label class="check"><input type="checkbox" required> I’ve saved my recovery key.</label></div>':'')+
      '<div class="notice" role="status" id="auth-note"></div>'+buttons(activate?'Activate and sign in':recover?'Save new password':isNew?'Create account':'Sign in')+'</form><div class="actions">'+(issueKey?backLink:(!staff?'<button class="text-btn" type="button" data-mode="register">Create a player account</button>':'')+'<button class="text-btn" type="button" data-mode="recover">Forgot password?</button>')+'</div></section></div>';
    root.setAttribute('aria-busy','false');if(msg)notice('auth-note',msg);
    root.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;signedOut();});
    if(issueKey)$('copy-key').onclick=e=>copying(backup,e.currentTarget);
    $('auth-form').onsubmit=async e=>{
      e.preventDefault();const form=e.currentTarget,btn=form.querySelector('[type=submit]');if(btn.disabled)return;
      btn.disabled=true;const vals=new FormData(form),login=String(vals.get('login')).trim().toLowerCase(),password=String(vals.get('password'));
      try{
        if(issueKey){
          notice('auth-note','Saving your account…');
          const res=await fetch(url+'/functions/v1/tfn-account',{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify({action:mode,login,password,code:recover?cleanCode(vals.get('proof')||''):invite,backup}),signal:AbortSignal.timeout(25000)});
          const body=await res.json().catch(()=>({}));if(!res.ok)throw Error(body.message||'The account service is unavailable. Try again.');
        }
        notice('auth-note','Signing in…');const {data,error}=await db.auth.signInWithPassword({email:loginMail(login),password});
        if(error)throw Error(issueKey?'Your account was saved. Return to sign in with your new password.':'Sign-in failed. Check your login and password.');
        await workspace(data.user);
      }catch(ex){notice('auth-note',ex.message||'Please try again.',true);}finally{btn.disabled=false;}
    };
  }
  async function signout(){const {error}=await db.auth.signOut({scope:'local'});if(error){notice('global-note','Could not sign out. Please try again.',true);return;}mode='login';activeId=null;term='';filter='';offset=0;signedOut();}
  function statusText(stage){
    return {'Received':'The team has received your application.','In review':'The team is reviewing your football background and evidence.','More information needed':'Read the latest team message and reply with what they need.','Next steps ready':'Read your next steps below and reply with any questions.','Closed':'This review is complete. Your messages and feedback are available below.'}[stage]||'';
  }
  async function workspace(user){
    viewer=user;root.setAttribute('aria-busy','false');
    if(staff){const result=await db.rpc('tfn_my_staff_access');if(result.error||!result.data){root.innerHTML='<section class="wrap content"><div class="panel"><h1>Staff access required</h1><p>'+esc(result.error?'We couldn’t check your staff access. Please try again.':'This account can use the player area. Staff access is by invitation.')+'</p><div id="global-note" role="status"></div><div class="actions"><a href="player.html" class="button">Open player area</a><button class="button light" id="signout">Sign out</button></div></div></section>';$('signout').onclick=signout;return;}}
    root.innerHTML='<section class="mast compact-mast"><div class="wrap row"><div><p class="kicker">'+(staff?'Team workspace':'Player area')+'</p><h1>'+(staff?'Application <em>review.</em>':'My <em>pathway.</em>')+'</h1><p class="intro">'+(staff?'Review new applications, request evidence and share decisions.':'Follow your applications and speak to the team about your next step.')+'</p></div><div class="actions">'+(!staff?'<a class="button gold" href="index.html?apply=Pro%20Pathway">New application</a>':'')+'<button class="button gold" id="signout">Sign out</button></div></div></section><div class="wrap content"><div id="global-note" role="status"></div><div class="workspace"><aside class="panel"><h2>'+(staff?'Review queue':'Your applications')+'</h2>'+(staff?'<form id="filters"><label class="field">Search<input id="search" maxlength="160" placeholder="Name, email or club"></label><label class="field">Stage<select id="filter">'+stageOptions(filter,true)+'</select></label><button class="button light" type="submit">Apply filters</button></form>':'')+'<div id="queue" class="queue-list spaced" aria-live="polite"></div><div class="pager" id="pager"></div>'+(!staff?'<details id="claim-details"><summary>Link a guest application</summary><form id="claim-form"><label class="field">Private application code<input name="code" required spellcheck="false" maxlength="64" autocomplete="off"></label>'+buttons('Link application')+'<div id="claim-note" role="status"></div></form></details>':'')+'</aside><section class="record" id="detail" aria-label="Application details" aria-live="polite"></section></div></div>';
    $('signout').onclick=signout;
    if(staff){$('search').value=term;$('filters').onsubmit=e=>{e.preventDefault();term=$('search').value.trim();filter=$('filter').value;offset=0;activeId=null;loadQueue();};}
    else{
      const claim=$('claim-form');const pending=sessionStorage.getItem('tfn-pending-claim');
      if(pending||location.hash==='#claim'){$('claim-details').open=true;claim.elements.code.value=pending||'';}
      claim.onsubmit=async e=>{e.preventDefault();const b=claim.querySelector('button');if(b.disabled)return;b.disabled=true;try{const val=cleanCode(claim.elements.code.value);if(!/^[a-f0-9]{48}$/.test(val))throw Error('Enter the full private code from your receipt.');const res=await db.rpc('tfn_claim',{p_code:val});if(res.error)throw res.error;if(!res.data)throw Error('No unlinked application matched. Check the code or your application list.');if(pending===val)sessionStorage.removeItem('tfn-pending-claim');claim.reset();notice('claim-note','Application linked.');activeId=null;offset=0;await loadQueue();}catch(ex){notice('claim-note',ex.message,true);}finally{b.disabled=false;}};
    }
    await loadQueue();
  }
  async function loadQueue(){
    const turn=++listGeneration;++detailGeneration;const list=$('queue');if(!list)return;list.textContent='Loading applications…';$('pager').replaceChildren();$('detail').innerHTML='';
    try{
      const res=staff?await db.rpc('tfn_review_queue',{p_term:term,p_stage:filter,p_offset:offset}):
        await db.from('tfn_applications').select('id,full_name,pathway,stage,submitted_at').eq('owner_id',viewer.id).order('submitted_at',{ascending:false}).order('id',{ascending:false}).range(offset,offset+listSize);
      if(turn!==listGeneration||!$('queue'))return;if(res.error)throw res.error;
      const records=res.data||[], slice=records.slice(0,listSize);
      list.replaceChildren();
      if(!slice.length){list.textContent=staff?'No matching applications.':'No applications here yet.';$('detail').innerHTML=staff?'<h2>Your review queue</h2><p>New applications appear here. Clear the filters or refresh to check again.</p>':'<h2>Start with your football.</h2><p>Tell us where you play, show us the evidence and explain what a move to Thailand would need to offer you.</p><a class="button" href="index.html?apply=Pro%20Pathway">Start an application</a>';}
      for(const entry of slice){const btn=document.createElement('button');btn.className='queue-item';btn.dataset.id=entry.id;btn.innerHTML='<strong>'+esc(staff?entry.full_name:entry.pathway)+'</strong><small>'+esc(staff?entry.pathway+' · ':'')+esc(stamp(entry.submitted_at))+'</small>'+stageTag(entry.stage);btn.onclick=()=>showDetail(entry.id);list.append(btn);}
      const nav=(label,action)=>{const btn=document.createElement('button');btn.className='text-btn';btn.textContent=label;btn.onclick=action;$('pager').append(btn);};
      if(offset)nav('Previous',()=>{offset=Math.max(offset-listSize,0);activeId=null;loadQueue();});if(records.length>listSize)nav('Next',()=>{offset+=listSize;activeId=null;loadQueue();});nav('Refresh',loadQueue);
      if(slice.length)await showDetail(slice.some(a=>a.id===activeId)?activeId:slice[0].id);
    }catch(ex){if(turn===listGeneration&&$('queue')){list.textContent='Could not load applications.';$('detail').innerHTML='<button id="retry-list" class="button">Try again</button>';$('retry-list').onclick=loadQueue;}}
  }
  function evidLinks(text){
    if(!text)return '';
    return text.split(/(https?:\/\/[^\s,]+)/gi).map(part=>{if(!/^https?:\/\//i.test(part))return esc(part);try{const u=new URL(part);if(!['https:','http:'].includes(u.protocol))return esc(part);return '<a rel="noopener noreferrer nofollow" target="_blank" href="'+esc(u.href)+'">'+esc(part)+'</a>';}catch{return esc(part);}}).join('');
  }
  async function showDetail(id){
    const turn=++detailGeneration;activeId=id;const box=$('detail');box.textContent='Opening application…';
    document.querySelectorAll('.queue-item').forEach(b=>b.setAttribute('aria-current',String(b.dataset.id===id)));
    try{
      const [details,updates]=await Promise.all([db.from('tfn_applications').select(columns).eq('id',id).single(),db.from('tfn_updates').select('id,created_at,author_kind,body,stage').eq('application_id',id).order('created_at',{ascending:false}).order('id',{ascending:false}).limit(101)]);
      if(turn!==detailGeneration||!$('detail'))return;if(details.error||updates.error)throw details.error||updates.error;
      const a=details.data;revision=a.revision;const facts=[['Name',a.full_name],['Contact email',a.email],['Current country',a.country],['Position or role',a.position_or_role],['Current or recent club',a.recent_club],['Highest level',a.highest_level],['Match footage',a.match_footage]].filter(([,v])=>v);
      box.innerHTML='<div class="topline">'+stageTag(a.stage)+'<span class="date">Received '+esc(stamp(a.submitted_at))+'</span></div><h2>'+esc(staff?a.full_name:a.pathway)+'</h2><p class="muted">'+esc(staff?a.pathway:statusText(a.stage))+'</p><details'+(staff?' open':'')+'><summary>Application details</summary><dl class="facts">'+facts.map(([k,v])=>'<div><dt>'+esc(k)+'</dt><dd>'+esc(v)+'</dd></div>').join('')+'</dl>'+(a.goals?'<h3>Goals</h3><p class="prose">'+esc(a.goals)+'</p>':'')+(a.portfolio_links?'<h3>Footage and portfolio</h3><p class="prose">'+evidLinks(a.portfolio_links)+'</p>':'')+'</details><hr style="border:0;border-top:1px solid var(--line);margin:1.4rem 0"><h3>Application conversation</h3><div id="thread"></div><form id="message-form">'+(staff?'<label class="field">Application stage<select name="stage">'+stageOptions(a.stage)+'</select></label>':'')+'<label class="field">'+(staff?'Message for the player':'Message to the team')+'<textarea name="body" maxlength="3000" '+(staff?'':'required')+' placeholder="'+(staff?'Share feedback or request footage':'Add a question, update or footage link')+'"></textarea></label>'+buttons(staff?'Save review':'Send message')+'<div id="message-note" role="status"></div></form>';
      const rows=updates.data||[];
      $('thread').innerHTML=rows.length?'<ul class="thread">'+rows.slice(0,100).map(m=>'<li><strong>'+esc(m.author_kind)+'</strong> <small>'+esc(stamp(m.created_at))+'</small><p>'+evidLinks(m.body)+'</p></li>').join('')+'</ul>'+(rows.length>100?'<p class="help">Showing the 100 latest updates.</p>':''):'<p class="muted">No messages yet.</p>';
      const form=$('message-form');form.onsubmit=async e=>{e.preventDefault();const btn=form.querySelector('button');if(btn.disabled)return;btn.disabled=true;const body=form.elements.body.value.trim(),stage=staff?form.elements.stage.value:null;
        try{const {error}=await db.rpc('tfn_post_update',{p_id:id,p_body:body,p_stage:stage,p_revision:a.revision});if(error)throw error;await loadQueue();notice('global-note',staff?'Review saved.':'Message sent.');}catch(ex){notice('message-note',ex.message||'Could not save. Please retry.',true);}finally{btn.disabled=false;}};
    }catch{if(turn===detailGeneration&&$('detail')){box.innerHTML='<p>This application could not be opened.</p><button class="button light" id="reload-detail">Retry</button>';$('reload-detail').onclick=()=>showDetail(id);}}
  }
  async function start(){
    try{if(invite&&staff){signedOut();return;}const {data,error}=await db.auth.getSession();if(error)throw error;if(!data.session){signedOut();return;}
      const {data:identity,error:bad}=await db.auth.getUser();if(bad||!identity.user){signedOut('Please sign in again.');return;}await workspace(identity.user);
    }catch{signedOut('Could not restore your session. Please sign in again.');}
  }
  db.auth.onAuthStateChange(event=>{if(event==='SIGNED_OUT'&&viewer){listGeneration++;detailGeneration++;mode='login';signedOut();}});
  start();
})();
