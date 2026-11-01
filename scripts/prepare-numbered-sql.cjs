throw new Error('Historical SQL generator retired. Use supabase/FINAL_DATABASE/README.md. Refresh defaults with scripts/build-final-database-defaults.cjs');
// Prepare and genuinely execute the numbered delivery in isolated PostgreSQL only.
const fs=require('node:fs');
const assert=require('node:assert/strict');
const {isolatedDatabase,executeFiles}=require('./sql-verified-support.cjs');
const source='supabase/slkm_sql_verified/';
const target='supabase/SLKM_SQL_ORDRE/';
const mapping=[
 ['00_prerequisites.sql','01_PREREQUIS.sql'],
 ['01_tables_and_columns.sql','02_TABLES_ET_COLONNES.sql'],
 ['02_keys_and_checks.sql','03_CLES_ET_CONTRAINTES.sql'],
 ['03_storage_buckets.sql','04_STORAGE_BUCKETS.sql'],
 ['04_foreign_keys.sql','05_RELATIONS_FOREIGN_KEYS.sql'],
 ['05_functions_triggers_indexes.sql','06_FONCTIONS_TRIGGERS_INDEX.sql'],
 ['06_rls_and_grants.sql','07_SECURITE_RLS.sql'],
 ['07_editorial_defaults.sql','08_CONTENU_INITIAL.sql'],
 ['VALIDATION_QUERIES.sql','09_VERIFICATION.sql'],
];
const scalar=async(db,sql)=>(await db.query(sql)).rows[0].value;
const contract=JSON.parse(fs.readFileSync(source+'SCHEMA_CONTRACT.json'));
let checks=0;
const check=(a,b)=>{assert.deepEqual(a,b);checks++;};
async function verify(db){
 const columns=(await db.query(`select c.relname as table_name,a.attname as column_name,format_type(a.atttypid,a.atttypmod) as data_type,a.attnotnull as required,pg_get_expr(d.adbin,d.adrelid) as default_sql from pg_attribute a join pg_class c on c.oid=a.attrelid left join pg_attrdef d on d.adrelid=c.oid and d.adnum=a.attnum where c.relnamespace='public'::regnamespace and c.relkind='r' and a.attnum>0 and not a.attisdropped`)).rows;
 const sort=a=>[...a].sort((a,b)=>(a.table_name+'.'+a.column_name).localeCompare(b.table_name+'.'+b.column_name));
 check(sort(columns),sort(contract.columns));
 const constraints=(await db.query(`select c.relname as table_name,pg_get_constraintdef(k.oid) as definition,k.convalidated as validated from pg_constraint k join pg_class c on c.oid=k.conrelid where c.relnamespace='public'::regnamespace and k.contype in ('p','u','c','f')`)).rows;
 for(const c of contract.constraints){assert.ok(constraints.some(a=>a.table_name===c.table_name&&a.validated&&c.accepted_definitions.includes(a.definition)),c.name);checks++;}
 check(await scalar(db,`select count(*)::int as value from pg_class where relnamespace='public'::regnamespace and relkind='r' and relrowsecurity`),13);
 const policies=(await db.query(`select schemaname,tablename,policyname,permissive,roles,cmd,qual,with_check from pg_policies where schemaname in ('public','storage') order by schemaname,tablename,policyname`)).rows;
 check(policies,contract.policies);
}
async function main(){
 fs.mkdirSync(target,{recursive:true});
 for(const[from,to]of mapping){fs.copyFileSync(source+from,target+to);check(fs.readFileSync(target+to,'utf8'),fs.readFileSync(source+from,'utf8'));}
 const executions=[];
 for(const legacy of [false,true]){
   const db=await isolatedDatabase();
   try{
     const snapshots=[];
     if(legacy){
       await executeFiles(db,['supabase/schema.sql','supabase/seed.sql']);
       await db.exec("update public.agencies set agency_name_fr='Local edit to preserve'");
       for(const table of ['agencies','routes','parcel_rates','corporate_quotes','contact_messages','blog_posts','site_settings']){
         const cols=(await db.query(`select column_name from information_schema.columns where table_schema='public' and table_name='${table}' order by ordinal_position`)).rows.map(r=>r.column_name);
         const sql=`select coalesce(jsonb_agg(to_jsonb(a) order by a.id),'[]'::jsonb) as value from(select ${cols.map(c=>'"'+c+'"').join(',')} from public.${table}) a`;
         snapshots.push({sql,value:await scalar(db,sql)});
       }
     }
     for(const[,name]of mapping){await executeFiles(db,[target+name]);executions.push({scenario:legacy?'existing':'fresh',file:name,status:'PASS'});}
     await verify(db);
     for(const s of snapshots)check(await scalar(db,s.sql),s.value);
     if(!legacy)check(await scalar(db,'select count(*)::int as value from public.agencies'),0);
     await executeFiles(db,mapping.map(([,name])=>target+name));
     await verify(db);checks++;
     await db.exec('set role anon');
     await assert.rejects(()=>db.exec('select * from public.contact_messages'),e=>e.code==='42501');checks++;
     await db.exec(`set role authenticated;select set_config('request.jwt.claims','{"user_metadata":{"role":"admin"}}',false)`);
     check(await scalar(db,'select public.is_admin() as value'),false);
     await assert.rejects(()=>db.exec("insert into storage.objects(bucket_id,name) values('agencies-media','forbidden.png')"),e=>e.code==='42501');checks++;
   }finally{await db.close();}
 }
 const result={date:new Date().toISOString(),status:'PASS',engine:'PostgreSQL 18.6 via PGlite 0.5.13; minimal Supabase Auth/Storage test schemas',checks,executions,reruns:'PASS for fresh and populated existing database',preservedData:'All original column values in seven historical tables preserved',remoteMigrationsExecuted:false,liveSupabase:'NOT VERIFIED by these local tests'};
 fs.writeFileSync(target+'TESTS.json',JSON.stringify(result,null,2));
 fs.writeFileSync(target+'LISEZ_MOI.txt',`SLKM - UTILISER UNIQUEMENT CE DOSSIER\n\nExécuter chaque fichier COMPLET dans Supabase SQL Editor, un par un :\n\n${mapping.map(([,name])=>name).join('\n')}\n\nMême ordre pour une base neuve ou existante compatible.\nAttendre le succès d'un fichier avant de passer au suivant.\nNe pas ajouter les anciens schema.sql, seed.sql, migrations ou autres packages.\nSi un fichier échoue : arrêter et conserver son nom + le message exact.\nSi la transaction est en erreur : ROLLBACK; puis corriger la cause avant de reprendre.\nLe fichier 01 vérifie les prérequis ; les tables sont créées par le fichier 02.\nLes gardes de types, policies inconnues et privilèges ne sont pas contournés.\nAucune donnée commerciale d'exemple n'est ajoutée.\nSauvegarder une base existante avant une migration réelle.\n\nDarija : khdem ghir b had dossier. Bda b 01, mnb3d 02, tal 09.\nMa tzidch les anciens fichiers. Ila chi fichier 3ta erreur, waqef f dik l'étape.\n\nVérification locale : ${checks} contrôles réussis dans PostgreSQL embarqué.\nInstallation neuve, base peuplée, conservation des données et réexécution testées.\nLes services Supabase réels et les migrations distantes ne sont pas testés/exécutés.\n`);
 console.log(`9 numbered SQL files: PASS; ${checks} checks; fresh, existing, preserved data, reruns and role restrictions. No remote writes.`);
 for(const[,name]of mapping)console.log(name+' : PASS');
}
main().catch(error=>{console.error(JSON.stringify({file:error.sqlFile,code:error.code,message:error.message},null,2));process.exitCode=1;});
