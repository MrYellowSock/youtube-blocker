const FILTER_ENDPOINT = 'http://localhost:3000/check';

function extractYouTubeID(url) {
	const patterns = [
		/^(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,                    // watch?v=VIDEO_ID
		/^(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?&]+)/,                    // embed/VIDEO_ID
		/^(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([^?&]+)/,                   // shorts/VIDEO_ID
		/^(?:https?:\/\/)?(?:www\.)?youtube\.com\/live\/([^?&]+)/,                     // live/VIDEO_ID
		/^(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?&]+)/                                // youtu.be/VIDEO_ID
	];

	for (const pattern of patterns) {
		const match = url.match(pattern);
		if (match) return match[1];
	}
	return null;
}

async function checkAndBlock() {
	console.log("Goona check")
	const currentVidId = extractYouTubeID(location.href);
	if (currentVidId == null) {
		console.error("video id not recognized");
		return;
	}
	// check video whitelist
	if (localStorage.getItem(currentVidId) == null) {
		try {
			window.stop();
			// replace page contents with a “blocked” message
			document.documentElement.innerHTML = `
        <div style="
          display:flex;
          align-items:center;
          justify-content:center;
          height:100vh;
          font-family:sans-serif;
          font-size:1.5rem;
          text-align:center;
          padding:1rem;
        ">
		  Checking video content . . .
        </div>`;

			const resp = await fetch(FILTER_ENDPOINT, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url: location.href })
			});
			if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
			const { block } = await resp.json();
			if (block) {
				// replace page contents with a “blocked” message
				document.documentElement.innerHTML = `
					<div style="
					  display:flex;
					  align-items:center;
					  justify-content:center;
					  height:100vh;
					  font-family:sans-serif;
					  font-size:1.5rem;
					  text-align:center;
					  padding:1rem;
					">
					  ⚠️ This video has been blocked by your filter.
					</div>`;
			}
			else {
				localStorage.setItem(currentVidId, true)
				location.reload();
			}
		} catch (err) {
			// if the filter API fails, we let the video load—
			// or you could choose to block by default on error
			console.error('Filter‑API error:', err);
		}
	}

}

let prevUrl = null;
const inter = setInterval(() => {
	if (prevUrl != location.href) {
		prevUrl = location.href
		// initial run on full load
		checkAndBlock();

	}
}, 300)
