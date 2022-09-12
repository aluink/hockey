import fs from 'fs';
import { XMLParser } from 'fast-xml-parser';
import fetch from 'node-fetch';
import prompts from 'prompts';

const REGEX_EXCLUDE = /Youth/;

async function run() {
  const response = await prompts({
    type: 'text',
    name: 'url',
    message: 'Enter the RSS URL:'
  });
  const outResponse = await prompts({
    type: 'text',
    name: 'outfile',
    initial: 'output.csv',
    message: 'Choose and output file:'
  })
  const data = await fetch(response.url)
  const text = await data.text();

  const xml = new XMLParser().parse(text).rss.channel.item.filter(x => !x.title.match(REGEX_EXCLUDE))
    .sort((a,b) => new Date(a.pubDate) - new Date(b.pubDate))
    .map(x => ({
      home: x.title.split(":")[1].split(" at ")[1].trim(),
      away: x.title.split(":")[1].split(" at ")[0].trim(),
      pubDate: x.pubDate
    }))
    .map(x => `${new Date(x.pubDate).toLocaleDateString('en-US')}, ${new Date(x.pubDate).toLocaleTimeString('en-US')}, ${x.home}, ${x.away}`)
    .join('\n');

  fs.writeFileSync(outResponse.outfile, xml);
  console.log(`Wrote to ${outResponse.outfile}`);
  process.exit(0);
}

run();