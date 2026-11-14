// IDs are taken from cities.all.updated.json: its first 34 records are
// Vietnamese provinces/cities and the remaining records are international destinations.
const DOMESTIC_CITY_IDS = new Set([
  '6959ef83de936435761443f4', '6959ef83de936435761443f7', '6959ef83de936435761443f8',
  '6959ef83de936435761443fb', '6959ef83de93643576144400', '6959ef83de93643576144401',
  '6959ef83de93643576144403', '6959ef83de93643576144407', '6959ef83de9364357614440e',
  '6959ef83de93643576144411', '6959ef83de936435761443f5', '6959ef83de936435761443f6',
  '6959ef83de93643576144404', '6959ef83de93643576144409', '6959ef83de9364357614440b',
  '6959ef83de93643576144410', '6959ef83de93643576144414', '6959ef83de936435761443f9',
  '6959ef83de936435761443fd', '6959ef83de936435761443ff', '6959ef83de93643576144402',
  '6959ef83de93643576144405', '6959ef83de93643576144408', '6959ef83de9364357614440c',
  '6959ef83de9364357614440f', '6959ef83de93643576144412', '6959ef83de936435761443fa',
  '6959ef83de936435761443fc', '6959ef83de936435761443fe', '6959ef83de93643576144406',
  '6959ef83de9364357614440a', '6959ef83de9364357614440d', '6959ef83de93643576144413',
  '6959ef83de93643576144415'
]);

const sortByVietnameseName = (locations) => locations.sort((a, b) =>
  a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' })
);

const isDomesticLocation = (location) => DOMESTIC_CITY_IDS.has(String(location._id));

module.exports = { isDomesticLocation, sortByVietnameseName };
