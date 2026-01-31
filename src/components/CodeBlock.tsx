import Prism from 'prismjs'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-markup'
import 'prismjs/components/prism-yaml'
import './CodeBlock.css'

// Custom RAC grammar: YAML structure + Python formula expressions
Prism.languages['rac'] = {
  'comment': /#.*/,
  'section-keyword': {
    pattern: /^(text|parameter|variable|input|enum|function|versions)\b/m,
    alias: 'keyword',
  },
  'attribute-key': {
    pattern: /^[ \t]+(description|unit|source|reference|values|imports|entity|period|dtype|label|default|formula|tests|name|inputs|expect|metadata|enacted_by|reverts_to|parameters|threshold|cap)\b/m,
    alias: 'attr-name',
  },
  'declaration-name': {
    pattern: /(?<=^(?:parameter|variable|input|enum|function)\s+)\w+(?=\s*:)/m,
    alias: 'function',
  },
  'date': {
    pattern: /\b\d{4}-\d{2}-\d{2}\b/,
    alias: 'number',
  },
  'import-path': {
    pattern: /(?<=[-\s]\s*)\d+\/[\w/]+#\w+(?:\s+as\s+\w+)?/,
    alias: 'string',
  },
  'python-keyword': {
    pattern: /\b(?:if|else|elif|return|for|break|and|or|not|in|as|True|False|None)\b/,
    alias: 'keyword',
  },
  'python-builtin': {
    pattern: /\b(?:max|min|abs|round|sum|len|interpolate)\b/,
    alias: 'builtin',
  },
  'entity-type': {
    pattern: /\b(?:Person|TaxUnit|Household|Family|Year|Month|Day|Money|Rate|Boolean|Integer|USD)\b/,
    alias: 'class-name',
  },
  'string': {
    pattern: /(["'])(?:\\.|(?!\1)[^\\\n])*\1/,
  },
  'block-scalar': {
    pattern: /[|>][-+]?\s*$/m,
    alias: 'punctuation',
  },
  'number': /\b(?:0[xX][\dA-Fa-f]+|0[oO][0-7]+|0[bB][01]+|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b/,
  'boolean': /\b(?:true|false)\b/i,
  'punctuation': /[{}[\]:,]/,
  'operator': /[=<>!+\-*/%]=?|&&|\|\||[~^]/,
}

// Catala grammar: literate legal programming
Prism.languages['catala'] = {
  'title': {
    pattern: /@@.*?@@/,
    alias: 'important',
  },
  'comment': [
    /\/\*[\s\S]*?\*\//,
    /#.*/,
  ],
  'keyword': /\b(?:declaration|scope|input|output|internal|content|equals|if|then|else|let|in|definition)\b/,
  'type-name': {
    pattern: /\b(?:money|decimal|integer|boolean|date)\b/,
    alias: 'class-name',
  },
  'scope-name': {
    pattern: /(?<=(?:scope|declaration\s+scope)\s+)\w+/,
    alias: 'function',
  },
  'variable': {
    pattern: /\b[a-z_]\w*\b/,
  },
  'number': /\b\d+(?:\.\d+)?%?|\$\d+/,
  'operator': /[=<>!+\-*/%]=?|&&|\|\|/,
  'punctuation': /[{}[\]:,()]/,
  'string': /(["'])(?:\\.|(?!\1)[^\\\n])*\1/,
}

type Language = 'rac' | 'xml' | 'python' | 'yaml' | 'catala' | 'plain'

const prismLang: Record<Language, string> = {
  rac: 'rac',
  xml: 'markup',
  python: 'python',
  yaml: 'yaml',
  catala: 'catala',
  plain: '',
}

interface CodeBlockProps {
  code: string
  language: Language
  className?: string
}

export default function CodeBlock({ code, language, className }: CodeBlockProps) {
  if (language === 'plain' || !Prism.languages[prismLang[language]]) {
    return (
      <pre className={className}>
        <code>{code}</code>
      </pre>
    )
  }

  const html = Prism.highlight(
    code,
    Prism.languages[prismLang[language]],
    prismLang[language],
  )

  return (
    <pre className={className}>
      <code dangerouslySetInnerHTML={{ __html: html }} />
    </pre>
  )
}
