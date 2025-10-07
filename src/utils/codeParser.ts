export interface ParsedCode {
  html: string;
  css: string;
  js: string;
  text: string;
  confidence: 'high' | 'medium' | 'low';
}

// Helper to remove extra quotes and clean strings
const cleanString = (str: string): string => {
  if (!str) return '';
  // Remove leading/trailing quotes and escaped quotes
  return str.replace(/^["']|["']$/g, '').replace(/\\"/g, '"').trim();
};

// Helper to check if string contains actual code vs plain text
const isActualHTML = (content: string): boolean => {
  if (!content || content.length < 10) return false;
  // Must have actual HTML structure tags
  const htmlTagPattern = /<(html|head|body|div|section|header|footer|nav|main|article|aside|p|h[1-6]|ul|ol|li|a|img|form|input|button|table|tr|td|th|script|style|meta|link|title)\b[^>]*>/i;
  return htmlTagPattern.test(content);
};

const isActualCSS = (content: string): boolean => {
  if (!content || content.length < 10) return false;
  // Must have CSS selectors and property declarations
  const cssPattern = /[.#]?[\w-]+\s*\{[^}]*[\w-]+\s*:\s*[^;]+;/;
  return cssPattern.test(content);
};

const isActualJS = (content: string): boolean => {
  if (!content || content.length < 15) return false;
  // Ignore placeholder comments
  const trimmed = content.trim();
  if (trimmed === '// Interactive features will be added here' || 
      trimmed === '/* Interactive features will be added here */' ||
      trimmed.startsWith('// ') && trimmed.length < 50) {
    return false;
  }
  // Must have actual JS syntax
  const jsPattern = /(function\s*\(|const\s+\w+|let\s+\w+|var\s+\w+|document\.|addEventListener|console\.|=>|if\s*\(|for\s*\(|while\s*\(|\}\s*\))/;
  return jsPattern.test(content);
};

export function parseAndSeparateCode(input: any): ParsedCode {
  // Handle JSON response
  if (typeof input === 'object' && input !== null) {
    const rawHtml = cleanString(input.html || '');
    const rawCss = cleanString(input.css || '');
    const rawJs = cleanString(input.js || '');
    const rawText = cleanString(input.text || input.message || '');
    
    // Check if each field contains actual code
    const hasActualHTML = isActualHTML(rawHtml);
    const hasActualCSS = isActualCSS(rawCss);
    const hasActualJS = isActualJS(rawJs);
    
    let html = hasActualHTML ? rawHtml : '';
    let css = hasActualCSS ? rawCss : '';
    let js = hasActualJS ? rawJs : '';
    let text = '';
    
    // Collect plain text from fields that aren't actual code
    const textParts = [];
    if (rawText) textParts.push(rawText);
    if (!hasActualHTML && rawHtml) textParts.push(rawHtml);
    if (!hasActualCSS && rawCss && rawCss !== rawHtml) textParts.push(rawCss);
    if (!hasActualJS && rawJs && rawJs !== rawHtml && rawJs !== rawCss) textParts.push(rawJs);
    
    // Remove duplicates and combine
    text = [...new Set(textParts)].filter(Boolean).join('\n\n').trim();
    
    // If we found actual code, use it
    if (html || css || js) {
      const confidence = (html && css && js) ? 'high' : (html || css) ? 'medium' : 'low';
      return {
        html,
        css,
        js,
        text,
        confidence
      };
    }
    
    // If no code found, try parsing the text as a string
    if (text) {
      return parseStringContent(text);
    }
    
    // Fallback: stringify and parse
    input = JSON.stringify(input);
  }

  // Handle string input
  return parseStringContent(String(input));
}

function parseStringContent(content: string): ParsedCode {
  let html = '';
  let css = '';
  let js = '';
  let text = '';

  // Extract HTML (look for HTML tags)
  const htmlRegex = /(<(!DOCTYPE|html|head|body|div|p|h[1-6]|section|header|footer|nav|main|article|aside|span|a|img|ul|ol|li|table|tr|td|th|form|input|button|label|select|textarea)[^>]*>[\s\S]*?<\/\2>)|(<[^>]+\/>)/gi;
  const htmlMatches = content.match(htmlRegex);
  if (htmlMatches) {
    html = htmlMatches.join('\n');
  }

  // Extract CSS (look for CSS rules)
  const cssRegex = /([.#]?[\w-]+\s*\{[^}]+\})|(@media[^{]+\{[\s\S]+?\}\s*\})/gi;
  const cssMatches = content.match(cssRegex);
  if (cssMatches) {
    css = cssMatches.join('\n');
  }

  // Extract JavaScript (look for functions, const/let/var declarations)
  const jsRegex = /(function\s+\w+\s*\([^)]*\)\s*\{[\s\S]*?\})|(const|let|var)\s+\w+\s*=[\s\S]*?;|(document\.\w+[\s\S]*?;)|(addEventListener\([^)]+\)[\s\S]*?\})/gi;
  const jsMatches = content.match(jsRegex);
  if (jsMatches) {
    js = jsMatches.join('\n');
  }

  // Extract plain text (remove all code)
  text = content
    .replace(htmlRegex, '')
    .replace(cssRegex, '')
    .replace(jsRegex, '')
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .trim();

  // Determine confidence
  let confidence: 'high' | 'medium' | 'low' = 'low';
  if ((html && css) || (html && js)) {
    confidence = 'high';
  } else if (html || css || js) {
    confidence = 'medium';
  }

  return {
    html,
    css,
    js,
    text,
    confidence
  };
}
