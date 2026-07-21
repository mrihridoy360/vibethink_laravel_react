/**
 * Converts Markdown or raw text content with line breaks into beautifully formatted,
 * styled HTML tags with auto-generated heading IDs for Table of Contents navigation.
 * 
 * @param {string} content - The raw content or markdown text
 * @returns {string} The formatted HTML string
 */
export function parseMarkdownToHtml(content) {
    return formatBlogContent(content);
}

export function formatBlogContent(content) {
    if (!content) return '';

    let text = content.trim();

    // Check if it's mostly HTML (contains <p>, <h2>, <h3>, <ul>, <ol>, <div>)
    const hasHtmlBlocks = /<(p|h[1-6]|ul|ol|li|blockquote|div|section|article)\b[^>]*>/i.test(text);

    if (hasHtmlBlocks) {
        // If it's HTML, inject id attributes into h2/h3 tags if missing and format linebreaks
        let headingIndex = 0;
        text = text.replace(/<h([23])([^>]*)>(.*?)<\/h\1>/gi, (match, level, attrs, innerText) => {
            if (/id=["\']/i.test(attrs)) {
                return match;
            }
            const cleanText = innerText.replace(/<[^>]+>/g, '').trim();
            const slug = 'heading-' + (cleanText.toLowerCase().replace(/[^\w\u0980-\u09FF]+/g, '-') || ++headingIndex);
            return `<h${level}${attrs} id="${slug}">${innerText}</h${level}>`;
        });

        // Ensure paragraph tags have proper line-height and spacing
        text = text.replace(/<p(\s+class="([^"]*)")?>/gi, (match, classAttr, existingClasses) => {
            if (existingClasses && existingClasses.includes('leading-relaxed')) {
                return match;
            }
            const newClasses = existingClasses 
                ? `${existingClasses} mb-5 leading-relaxed` 
                : 'mb-5 leading-relaxed text-slate-700 font-normal';
            return `<p class="${newClasses}">`;
        });

        return text;
    }

    // Otherwise, parse as Markdown / Text with line breaks!
    let headingIdx = 0;

    // Fenced Code Blocks (```code```)
    text = text.replace(/```([a-z]*)\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre class="bg-slate-900 text-emerald-400 p-4 rounded-2xl overflow-x-auto text-sm font-mono my-6"><code>${escapeHtml(code.trim())}</code></pre>`;
    });

    // Inline code (`code`)
    text = text.replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-purple-700 px-2 py-0.5 rounded text-sm font-mono border border-slate-200">$1</code>');

    // Headings: ###, ##, #
    text = text.replace(/^### (.*?)$/gm, (match, title) => {
        const slug = 'heading-' + (title.toLowerCase().replace(/[^\w\u0980-\u09FF]+/g, '-') || ++headingIdx);
        return `<h3 id="${slug}" class="text-xl font-bold text-slate-900 mt-8 mb-4 flex items-center gap-2">${title}</h3>`;
    });

    text = text.replace(/^## (.*?)$/gm, (match, title) => {
        const slug = 'heading-' + (title.toLowerCase().replace(/[^\w\u0980-\u09FF]+/g, '-') || ++headingIdx);
        return `<h2 id="${slug}" class="text-2xl font-extrabold text-slate-900 mt-10 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">${title}</h2>`;
    });

    text = text.replace(/^# (.*?)$/gm, (match, title) => {
        const slug = 'heading-' + (title.toLowerCase().replace(/[^\w\u0980-\u09FF]+/g, '-') || ++headingIdx);
        return `<h1 id="${slug}" class="text-3xl font-extrabold text-slate-900 mt-12 mb-5">${title}</h1>`;
    });

    // Blockquotes (> Quote)
    text = text.replace(/^>\s+(.*?)$/gm, '<blockquote class="border-l-4 border-purple-500 bg-purple-50/40 p-4 rounded-r-2xl my-6 text-slate-700 italic font-medium">$1</blockquote>');

    // Horizontal Rule (--- or ***)
    text = text.replace(/^(---|\*\*\*)$/gm, '<hr class="my-8 border-slate-200" />');

    // Bold (**text** or __text__)
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
    text = text.replace(/__(.*?)__/g, '<strong class="font-bold text-slate-900">$1</strong>');

    // Italic (*text* or _text_)
    text = text.replace(/\*(.*?)\*/g, '<em class="italic text-slate-800">$1</em>');

    // Links ([text](url))
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-purple-650 font-bold hover:underline">$1</a>');

    // Bullet list items (- item, * item, • item)
    text = text.replace(/^[•\-\*]\s+(.*?)$/gm, '<li class="ml-4 pl-1 text-slate-700 font-normal">$1</li>');

    // Numbered list items (1. item)
    text = text.replace(/^\d+\.\s+(.*?)$/gm, '<li class="ml-4 pl-1 text-slate-700 font-normal">$1</li>');

    // Group list items into <ul> or <ol>
    text = text.replace(/(<li class="ml-4 pl-1 text-slate-700 font-normal">.*?<\/li>\n?)+/g, (match) => {
        return `<ul class="space-y-2 my-5 list-disc pl-6 text-slate-700 font-normal">${match}</ul>`;
    });

    // Split by double newlines into paragraphs
    const paragraphs = text.split(/\n{2,}/);
    const formatted = paragraphs.map(block => {
        const trimmed = block.trim();
        if (!trimmed) return '';
        // If it already starts with a block tag, return as is
        if (/^<(h[1-6]|ul|ol|blockquote|pre|hr|div|figure)/i.test(trimmed)) {
            return trimmed;
        }
        // Convert single newlines inside paragraph to <br />
        const withBreaks = trimmed.replace(/\n/g, '<br />');
        return `<p class="text-slate-700 text-base md:text-lg font-normal leading-relaxed mb-6">${withBreaks}</p>`;
    });

    return formatted.filter(Boolean).join('\n');
}

function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
