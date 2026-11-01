const { PGlite } = require('@electric-sql/pglite');
const fs = require('node:fs');
async function isolatedDatabase(dataDir) {
  const db = new PGlite(dataDir);
  await db.exec(`
    create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create schema storage;
    create function auth.jwt() returns jsonb language sql stable as $$
      select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb
    $$;
    create table auth.users(id uuid primary key, raw_app_meta_data jsonb);
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text references storage.buckets(id),name text not null);
    alter table storage.objects enable row level security;
    grant usage on schema public,auth,storage to anon,authenticated,service_role;
    grant select,insert,update,delete on storage.objects to anon,authenticated,service_role;
  `);
  return db;
}
async function executeFiles(db, files) {
  for (const file of files) {
    try { await db.exec(fs.readFileSync(file, 'utf8')); }
    catch (error) { try { await db.exec('rollback'); } catch {} error.sqlFile = file; throw error; }
  }
}
module.exports = { isolatedDatabase, executeFiles };
