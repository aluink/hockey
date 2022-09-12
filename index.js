import fs from 'fs';
import { XMLParser } from 'fast-xml-parser';

const REGEX_EXCLUDE = /Youth/;

const parser = new XMLParser();

const f = fs.readFileSync('Fall22B.RSS', 'utf-8');

const xml = parser.parse(f).rss.channel.item.filter(x => !x.title.match(REGEX_EXCLUDE))
  .sort((a,b) => new Date(a.pubDate) - new Date(b.pubDate))
  .map(x => ({
    home: x.title.split(":")[1].split(" at ")[1].trim(),
    away: x.title.split(":")[1].split(" at ")[0].trim(),
    pubDate: x.pubDate
  }))
  .map(x => `${new Date(x.pubDate).toLocaleDateString('en-US')}, ${new Date(x.pubDate).toLocaleTimeString('en-US')}, ${x.home}, ${x.away}`)
  .join('\n');

fs.writeFileSync('out.csv', xml);