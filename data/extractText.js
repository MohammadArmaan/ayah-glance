function extractArabic(html) {
    // Example: Get content inside <bdi> or first <div>
    const match = html.match(/<bdi[^>]*>(.*?)<\/bdi>/);
    return match ? match[1] : "";
}

function extractTransliteration(html) {
    const match = html.match(/<i[^>]*>(.*?)<\/i>/);
    return match ? match[1] : "";
}

function extractTranslation(html) {
    // Assuming translation is plain text after <i>
    const match = html.match(/<\/i>(.*?)$/);
    return match ? match[1].trim() : "";
}
