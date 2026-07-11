# Spicey — Complete Migration Package Index
Generated: 2026-07-01

## Files in this package

| File | Contents |
|---|---|
| `01_entity_schemas.json` | All 20 Base44 entity schemas as JSON |
| `02_supabase_schema.sql` | Full Supabase PostgreSQL schema (already at src/supabase/schema.sql) |
| `03_data_export_scripts.js` | Browser console scripts to export all live data from Base44 |
| `04_supabase_import_scripts.js` | Node.js scripts to import exported data into Supabase |
| `05_backend_functions_inventory.md` | All 90+ backend functions with descriptions and migration status |
| `06_integrations_config.md` | All third-party integrations, env vars, and Supabase equivalents |
| `07_storage_buckets.md` | Storage bucket structure and migration instructions |
| `08_cannot_export_automatically.md` | What requires Base44 support to obtain |

## Quick Start

1. Run `03_data_export_scripts.js` in your browser console while logged into the app
2. Save each exported JSON file
3. Set SUPABASE_URL and SUPABASE_SERVICE_KEY in your environment
4. Run `04_supabase_import_scripts.js` with Node.js
5. Follow `06_integrations_config.md` to re-configure all third-party services
6. Create storage buckets per `07_storage_buckets.md