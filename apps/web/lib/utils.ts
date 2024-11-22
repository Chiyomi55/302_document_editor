import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { LANG, LANG_SHORT } from "./language";

export const locales = ["zh"] as const;

export const getHref = process.env.NEXT_PUBLIC_REGION ? process.env.NEXT_PUBLIC_OFFICIAL_WEBSITE_URL_GLOBAL : process.env.NEXT_PUBLIC_OFFICIAL_WEBSITE_URL_CHINA;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getLocalStorage(Item: string) {
  const data = localStorage.getItem(Item);
  return data;
}

export function setLocalStorage(key: string, value: string) {
  localStorage.setItem(key, value);
}

export function setAuthLocalStorage(window: Window, objects: any) {
  if (window) {
    let existedData = JSON.parse(
      window.localStorage.getItem("DATA") || '{}'
    )
    existedData = {
      ...existedData,
      ...objects
    }
    window.localStorage.setItem("DATA", JSON.stringify(existedData))
  }
}

export function getAuthLocalStorage(window: Window, key: string) {
  if (window) {
    const data = JSON.parse(window.localStorage.getItem("DATA") || '{}')
    return data[key]
  }
  return null
}


export const detectLocale = (locale: string): (typeof locales)[number] => {
  const detectedLocale = locale.split("-")[0];
  if (["en", "zh", "ja"].includes(detectedLocale as (typeof locales)[number])) {
    return detectedLocale as (typeof locales)[number];
  }
  return locales[0];
};


export const setPageLanguage = () => {
  const windowLanguage = window.navigator.language;
  let lang = 'en';
  if (["en-US", "zh-CN", "ja-JP"].includes(windowLanguage)) {
    lang = LANG[windowLanguage]
  }
  if (["en", "zh", "ja"].includes(windowLanguage)) {
    lang = LANG_SHORT[windowLanguage]
  }
  const localStorageLanguage = localStorage.getItem('lang')
  if (localStorageLanguage) lang = localStorageLanguage as 'chinese' | 'english' | 'japanese';
  const locale = window.location.pathname.split('/')[1]
  if (locale) {
    if (["en", "zh", "ja"].includes(locale)) lang = LANG_SHORT[locale]
    else lang = 'english'
  }
  const searchLang = new URLSearchParams(window.location.search).get('lang')
  if (searchLang) {
    if (["en-US", "zh-CN", "ja-JP"].includes(searchLang)) lang = LANG[searchLang];
    else lang = 'english'
  }
  localStorage.setItem('lang', lang)
  return lang;
}

export function removeColgroupTags(htmlString) {
  // Create a DOMParser instance
  const parser = new DOMParser();
  // Parse HTML string into a Document object
  const doc = parser.parseFromString(htmlString, 'text/html');

  // Query all<table>elements
  const tables = doc.querySelectorAll('table');

  tables.forEach(table => {
    // Delete the<colgroup>element, if it exists
    const colgroup = table.querySelector('colgroup');
    if (colgroup) {
      colgroup.parentNode.removeChild(colgroup);
    }

    // Find the first<tbody>and its first<tr>
    const tbody = table.querySelector('tbody');
    if (tbody) {
      const firstTr = tbody.querySelector('tr');
      if (firstTr) {
        //Create<thead>element
        const thead = document.createElement('thead');
        // Move the first<tr>to<thead>
        thead.appendChild(firstTr);
        // Insert<thead>at the beginning of<table>
        table.insertBefore(thead, tbody);

        // Change each<th>in<thead>to<td>
        firstTr.querySelectorAll('th').forEach(th => {
          const td = document.createElement('td');
          // Copy the attributes and content of the original<th>to<td>
          Array.from(th.attributes).forEach(attr => {
            td.setAttribute(attr.name, attr.value);
          });
          td.innerHTML = th.innerHTML;
          th.replaceWith(td);
        });
      }
    }
  });

  // Return the processed complete HTML string
  return doc.documentElement.outerHTML;
}

export function convertHtmlTablesToMarkdown(htmlString) {
  // Using DOMParser to parse HTML strings into a Document object
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');

  // Find all<table>elements
  const tables = doc.querySelectorAll('table');

  tables.forEach(table => {
    let markdownTable = '';
    let headersProcessed = false;

    // Get all rows
    const rows = table.querySelectorAll('tr');

    rows.forEach((row, rowIndex) => {
      const cells = Array.from(row.children);
      const isHeader = (rowIndex === 0) || row.parentElement.tagName.toLowerCase() === 'thead';

      //Build Markdown for each line
      const rowMarkdown = cells.map(cell => {
        const textContent = cell.textContent.trim();
        return `| ${textContent || ' '} `;
      }).join('') + '|';

      markdownTable += `${rowMarkdown}\n`;

      // Add Separate Rows: Only added after the first row to represent the header
      if (isHeader && !headersProcessed) {
        const separator = cells.map(() => '| --- ').join('') + '|';
        markdownTable += `${separator}\n`;
        headersProcessed = true;
      }
    });

    // Replace the generated Markdown table with the original HTML
    table.outerHTML = `\n${markdownTable}\n`;
  });

  return doc.body.innerHTML;
}


export function analyzeMarkdown(markdown) {
  // Remove Markdown syntax tags (#, *, _, etc.)
  const cleanText = markdown.replace(/[#*_`]/g, '');
  // Remove all image syntax first! [xxx](xxx)
  const cleanMarkdown = cleanText.replace(/!\[([^\]]*)\]\([^)]*\)/g, '');

  // Remove excess blank lines
  const trimmedMarkdown = cleanMarkdown.replace(/\n\s*\n/g, '\n\n').trim();

  // Calculate the number of paragraphs (separated by blank lines)
  const paragraphs = trimmedMarkdown.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const paragraphCount = paragraphs.length as number;

  // Calculate the number of sentences (separated by.!?.!?)
  const sentences = trimmedMarkdown.split(/[。！？.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length as number;

  // Calculate the number of words (English words)
  const words = trimmedMarkdown.match(/[a-zA-Z]+/g) || [];
  const wordCount = words.length as number;

  // Calculate Chinese word count (matching Chinese characters)
  const chineseChars = trimmedMarkdown.match(/[\u4e00-\u9fa5]/g) || [];
  const chineseCharCount = chineseChars.length as number;

  // Calculate the total number of characters (excluding spaces and line breaks)
  const characters = trimmedMarkdown.replace(/\s+/g, '').length as number;

  return {
    characters: characters,        // Total word count
    chineseChars: chineseCharCount, // Number of characters
    words: wordCount,             // Number of words
    sentences: sentenceCount,      // Number of sentences
    paragraphs: paragraphCount,    // paragraphs 
  };
}