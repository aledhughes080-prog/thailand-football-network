'use strict';
const TFN = (() => {
  const url = 'https://gwesqhhzbiiorkcozoaa.supabase.co';
  const key = 'sb_publishable_cTrbRlxGMSPh2Jt_CuAOUw_Q-T1h5Bq';
  const db = window.supabase.createClient(url, key, {auth:{storage:sessionStorage, storageKey:'tfn-network-auth-v1',detectSessionInUrl:false}});
  const code = () => Array.from(crypto.getRandomValues(new Uint8Array(24)), b=>b.toString(16).padStart(2,'0')).join('');
  const digest = async (value) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))), b=>b.toString(16).padStart(2,'0')).join('');
  return {url,key,db,code,digest};
})();
