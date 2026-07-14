/**
 * Converts basic Markdown elements (headers, bold text, bullet points, horizontal rules,
 * paragraphs, and line breaks) into styled HTML tags.
 * 
 * @param {string} markdown - The raw markdown text
 * @returns {string} The parsed HTML string
 */
export function parseMarkdownToHtml(markdown) {
    if (!markdown) return '';
    
    // Escape HTML first to prevent XSS
    let html = markdown
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Parse headers (### Header, ## Header, # Header)
    html = html.replace(/^### (.*?)$/gm, '<h3 class="text-lg font-extrabold text-slate-900 mt-5 mb-2.5">$1</h3>');
    html = html.replace(/^## (.*?)$/gm, '<h2 class="text-xl font-black text-slate-900 mt-7 mb-3.5">$1</h2>');
    html = html.replace(/^# (.*?)$/gm, '<h1 class="text-2xl font-black text-slate-900 mt-9 mb-4.5">$1</h1>');

    // Parse bold (**bold**)
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-slate-900">$1</strong>');

    // Parse bullet points (•, -, or *)
    html = html.replace(/^[•\-\*]\s+(.*?)$/gm, '<li class="ml-5 list-disc pl-1 py-0.5 text-slate-600 font-normal">$1</li>');

    // Parse horizontal rules (---)
    html = html.replace(/^---$/gm, '<hr class="my-6 border-slate-200" />');

    // Parse paragraphs and double newlines
    const lines = html.split(/\n{2,}/);
    const processedLines = lines.map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '';
        if (trimmed.startsWith('<h') || trimmed.startsWith('<li') || trimmed.startsWith('<hr') || trimmed.startsWith('<ul') || trimmed.startsWith('<ol')) {
            if (trimmed.startsWith('<li')) {
                return `<ul class="space-y-1 my-3">${trimmed}</ul>`;
            }
            return trimmed;
        }
        // Replace single newlines within paragraph with <br />
        const withLineBreaks = trimmed.replace(/\n/g, '<br />');
        return `<p class="text-slate-600 text-base font-normal leading-relaxed mb-4">${withLineBreaks}</p>`;
    });

    return processedLines.join('\n');
}
