/* ==========================================================
   SUPABASE CLIENT (ADMIN)
   Rellena URL y anon key para activar login en admin
========================================================== */

window.AdminSupabase = (() => {
    const config = {
        url: "",
        anonKey: ""
    };

    let client = null;

    function isConfigured() {
        return Boolean(config.url && config.anonKey);
    }

    function getClient() {
        if (!isConfigured()) return null;
        if (client) return client;

        if (!window.supabase || typeof window.supabase.createClient !== "function") {
            return null;
        }

        client = window.supabase.createClient(config.url, config.anonKey, {
            auth: {
                persistSession: true,
                autoRefreshToken: true
            }
        });

        return client;
    }

    return {
        getClient,
        isConfigured
    };
})();
