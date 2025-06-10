const fs = require('fs');
const { DOMParser } = require('@xmldom/xmldom');

const owlPath = 'Innovation0_gi2mo.owl';
const xml = fs.readFileSync(owlPath, 'utf8');
const doc = new DOMParser().parseFromString(xml, 'application/xml');

const base = doc.documentElement.getAttribute('xml:base') || '';

function getFullUri(id) {
  if (!id) return null;
  return base.replace(/#?$/, '#') + id;
}

const classes = Array.from(doc.getElementsByTagName('owl:Class'));
const map = {};

for (const el of classes) {
  const id = el.getAttribute('rdf:ID');
  const about = el.getAttribute('rdf:about');
  let name = null;
  let iri = null;

  if (id) {
    name = id;
    iri = getFullUri(id);
  } else if (about) {
    const match = about.match(/#([^#]+)$/);
    name = match ? match[1] : about.split('/').pop();
    iri = about;
  }

  if (name && iri && !map[name]) {
    map[name] = iri;
  }
}

const output = `const GI2MO = ${JSON.stringify(map, null, 2)};\n`;
fs.writeFileSync('webapp/js/ontology.js', output);
console.log('Generated webapp/js/ontology.js');
