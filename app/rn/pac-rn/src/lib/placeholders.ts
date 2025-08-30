// Frontend placeholder logic - simplified version
export interface PlaceholderInfo {
  placeholder: string;
  original: string;
  category: string;
}

export function buildPlaceholders(text: string, categories: string[]): {
  sanitized: string;
  placeholders: PlaceholderInfo[];
} {
  const placeholders: PlaceholderInfo[] = [];
  let sanitized = text;
  
  // Simple regex patterns for demo
  const patterns = {
    EMAIL: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,
    PHONE: /\b(?:\+?\d{1,3}[- ]?)?(?:\d{3,4}[- ]?){2,3}\b/g,
    ADDRESS: /\b\d+\s+[A-Za-z][A-Za-z\s]+(?:Road|Rd|Street|St|Ave|Avenue|Boulevard|Blvd|Lane|Ln|Drive|Dr)[\.;,]?\b/g,
    NAME: /\b([A-Z][a-z]+)\s+(?!Road\b|Rd\b|Street\b|St\b|Ave\b|Avenue\b|Boulevard\b|Blvd\b|Lane\b|Ln\b|Drive\b|Dr\b)[A-Z][a-z]+\b/g,
  };
  
  categories.forEach(category => {
    const pattern = patterns[category as keyof typeof patterns];
    if (!pattern) return;
    
    let match;
    let count = 1;
    while ((match = pattern.exec(text)) !== null) {
      const placeholder = `[${category}_${count}]`;
      placeholders.push({
        placeholder,
        original: match[0],
        category,
      });
      sanitized = sanitized.replace(match[0], placeholder);
      count++;
    }
  });
  
  return { sanitized, placeholders };
}

export function reinsertPlaceholders(text: string, placeholders: PlaceholderInfo[]): string {
  let result = text;
  // Sort by descending length to avoid partial replacements
  const sorted = [...placeholders].sort((a, b) => b.placeholder.length - a.placeholder.length);
  
  sorted.forEach(({ placeholder, original }) => {
    result = result.replace(placeholder, original);
  });
  
  return result;
}
