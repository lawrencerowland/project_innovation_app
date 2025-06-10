const fs = require('fs');
const { DOMParser } = require('@xmldom/xmldom');

const owlPath = 'Innovation0_gi2mo.owl';
const xml = fs.readFileSync(owlPath, 'utf8');
const doc = new DOMParser().parseFromString(xml, 'application/xml');

function extractIds(tagName) {
  return Array.from(doc.getElementsByTagName(tagName)).map(el => el.getAttribute('rdf:ID')).filter(Boolean);
}

const ideaStatuses = extractIds('gi2mo:IdeaStatus');
const contestStatuses = extractIds('gi2mo:IdeaContestStatus');
const accessTypes = extractIds('gi2mo:AccessType');

fs.writeFileSync('webapp/data/statuses.json', JSON.stringify({ideaStatuses, contestStatuses, accessTypes}, null, 2));
console.log('Generated webapp/data/statuses.json');
