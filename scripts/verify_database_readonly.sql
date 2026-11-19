BEGIN TRANSACTION READ ONLY;
SELECT jsonb_build_object('section','health','version',version(),'database',current_database(),'encoding',current_setting('server_encoding'),'timezone',current_setting('TimeZone'),'size_bytes',pg_database_size(current_database()),'connections',(SELECT count(*) FROM pg_stat_activity WHERE datname=current_database()));
SELECT jsonb_build_object('section','tables','rows',jsonb_agg(t)) FROM (SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name) t;
SELECT jsonb_build_object('section','columns','rows',jsonb_agg(t)) FROM (SELECT table_name,column_name,data_type,udt_name,is_nullable,column_default FROM information_schema.columns WHERE table_schema='public' ORDER BY table_name,ordinal_position) t;
SELECT jsonb_build_object('section','constraints','rows',jsonb_agg(t)) FROM (SELECT conrelid::regclass::text AS table_name,conname,contype,pg_get_constraintdef(oid) AS definition FROM pg_constraint WHERE connamespace='public'::regnamespace ORDER BY conrelid::regclass::text,conname) t;
SELECT jsonb_build_object('section','indexes','rows',jsonb_agg(t)) FROM (SELECT tablename,indexname,indexdef FROM pg_indexes WHERE schemaname='public' ORDER BY tablename,indexname) t;
SELECT jsonb_build_object('section','applied_migrations','rows',jsonb_agg(t)) FROM alembic_version t;
SELECT format('SELECT jsonb_build_object(''section'',''count'',''table'',%L,''rows'',count(*)) FROM %I.%I;',table_name,table_schema,table_name) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name
\gexec
COMMIT;

