export interface ParsedCode {
  html: string;
  css: string;
  js: string;
  text: string;
  confidence: 'high' | 'medium' | 'low';
}

export function parseAndSeparateCode(input: any): ParsedCode {
  // Handle JSON response
  if (typeof input === 'object' && input !== null) {
    if (input.html || input.css || input.js) {
      return {
        html: input.html || '',
        css: input.css || '',
        js: input.js || '',
        text: input.text || input.message || '',
        confidence: 'high'
      };
    }
    // If it's an object but doesn't have expected fields, stringify and parse
    input = JSON.stringify(input);
  }

  const content = String(input);
  
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
