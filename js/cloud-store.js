/* ==========================================================
   CLOUD STORE (SUPABASE)
   Tabla esperada: public.site_content
   - content_key text primary key
   - content_value jsonb not null
   - updated_at timestamptz default now()
========================================================== */

window.PSACloudStore = (() => {
    const TABLE_NAME = "site_content";

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

    async function pullKeys(keys = []) {
        const client = getClient();
        if (!client) {
            return { ok: false, reason: "missing-client", values: {} };
        }

        if (!Array.isArray(keys) || keys.length === 0) {
            return { ok: true, values: {} };
        }

        const uniqueKeys = Array.from(new Set(keys.filter(Boolean)));
        const { data, error } = await client
            .from(TABLE_NAME)
            .select("content_key, content_value")
            .in("content_key", uniqueKeys);

        if (error) {
            return { ok: false, reason: error.message, values: {} };
        }

        const values = {};
        (data || []).forEach((row) => {
            if (!row || !row.content_key) return;
            values[row.content_key] = row.content_value;
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

        const row = {
            content_key: key,
            content_value: value,
            updated_at: new Date().toISOString()
        };

        const { error } = await client
            .from(TABLE_NAME)
            .upsert(row, { onConflict: "content_key" });

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

        const { error } = await client
            .from(TABLE_NAME)
            .delete()
            .eq("content_key", key);

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
