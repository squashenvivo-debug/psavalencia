/* ==========================================================
   CLOUD STORE (SUPABASE)
   Tabla esperada: public.site_content
   - content_key text primary key
   - content_value jsonb not null
   - updated_at timestamptz default now()
    Compatibilidad legacy:
    - key text primary key
    - value jsonb not null
========================================================== */

window.PSACloudStore = (() => {
    const TABLE_NAME = "site_content";
     let schemaCache = null;

    function getClient() {
        return window.AdminSupabase?.getClient?.() || null;
    }

    function isReady() {
        return !!getClient();
    }

    function safeParseJson(raw) {
        if (typeof raw !== "string") return raw;
        try {
            return JSON.parse(raw);
        } catch (error) {
            return raw;
        }
    }

    function safeStringify(value) {
        try {
            return JSON.stringify(value);
        } catch (error) {
            return JSON.stringify(null);
        }
    }

    async function resolveSchema(client) {
        if (schemaCache) return schemaCache;

        const primary = { keyCol: "content_key", valueCol: "content_value" };
        const legacy = { keyCol: "key", valueCol: "value" };

        const primaryProbe = await client
            .from(TABLE_NAME)
            .select(`${primary.keyCol}, ${primary.valueCol}`)
            .limit(1);

        if (!primaryProbe.error) {
            schemaCache = primary;
            return schemaCache;
        }

        const legacyProbe = await client
            .from(TABLE_NAME)
            .select(`${legacy.keyCol}, ${legacy.valueCol}`)
            .limit(1);

        if (!legacyProbe.error) {
            schemaCache = legacy;
            return schemaCache;
        }

        // Fallback para no romper flujo; devolvemos el esquema nuevo.
        schemaCache = primary;
        return schemaCache;
    }

    async function pullKeys(keys = []) {
        const client = getClient();
        if (!client) {
            return { ok: false, reason: "missing-client", values: {} };
        }

        if (!Array.isArray(keys) || keys.length === 0) {
            return { ok: true, values: {} };
        }

        const schema = await resolveSchema(client);
        const uniqueKeys = Array.from(new Set(keys.filter(Boolean)));
        const { data, error } = await client
            .from(TABLE_NAME)
            .select(`${schema.keyCol}, ${schema.valueCol}`)
            .in(schema.keyCol, uniqueKeys);

        if (error) {
            return { ok: false, reason: error.message, values: {} };
        }

        const values = {};
        (data || []).forEach((row) => {
            if (!row || !row[schema.keyCol]) return;
            values[row[schema.keyCol]] = row[schema.valueCol];
        });

        return { ok: true, values };
    }

    async function pushKey(key, value) {
        const client = getClient();
        if (!client) {
            return { ok: false, reason: "missing-client" };
        }

        if (!key) {
            return { ok: false, reason: "missing-key" };
        }

        const schema = await resolveSchema(client);
        const row = {
            [schema.keyCol]: key,
            [schema.valueCol]: value
        };

        const { error } = await client
            .from(TABLE_NAME)
            .upsert(row, { onConflict: schema.keyCol });

        if (error) {
            return { ok: false, reason: error.message };
        }

        return { ok: true };
    }

    async function deleteKey(key) {
        const client = getClient();
        if (!client) {
            return { ok: false, reason: "missing-client" };
        }

        if (!key) {
            return { ok: false, reason: "missing-key" };
        }

        const schema = await resolveSchema(client);

        const { error } = await client
            .from(TABLE_NAME)
            .delete()
            .eq(schema.keyCol, key);

        if (error) {
            return { ok: false, reason: error.message };
        }

        return { ok: true };
    }

    async function syncLocalStorageFromCloud(keys = []) {
        const result = await pullKeys(keys);
        if (!result.ok) return result;

        const values = result.values || {};
        Object.entries(values).forEach(([key, value]) => {
            localStorage.setItem(key, safeStringify(value));
        });

        return { ok: true, loaded: Object.keys(values).length };
    }

    async function saveLocalStorageKeyToCloud(key) {
        if (!key) return { ok: false, reason: "missing-key" };

        const raw = localStorage.getItem(key);
        if (raw === null || raw === undefined) {
            return deleteKey(key);
        }

        const parsed = safeParseJson(raw);
        return pushKey(key, parsed);
    }

    async function removeLocalStorageKeyFromCloud(key) {
        return deleteKey(key);
    }

    return {
        isReady,
        pullKeys,
        pushKey,
        deleteKey,
        syncLocalStorageFromCloud,
        saveLocalStorageKeyToCloud,
        removeLocalStorageKeyFromCloud
    };
})();
