
const API = "http://localhost:5000";

async function debug() {
    try {
        console.log("--- RAW VIDEOS (First 3) ---");
        const resV = await fetch(`${API}/api/videos`);
        const videos = await resV.json();
        const vList = Array.isArray(videos) ? videos : (videos.value || []);
        console.log(JSON.stringify(vList.slice(0, 3), null, 2));

        console.log("\n--- RAW USERS (First 3) ---");
        const resU = await fetch(`${API}/api/users`);
        const users = await resU.json();
        const uList = Array.isArray(users) ? users : (users.value || []);
        console.log(JSON.stringify(uList.slice(0, 3), null, 2));
    } catch (e) {
        console.error("DEBUG FAILED:", e);
    }
}

debug();
