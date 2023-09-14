import { promises as fsAsync } from 'fs';
import { XMLParser } from 'fast-xml-parser';
import fetch from 'node-fetch';
import prompts from 'prompts';

const REGEX_EXCLUDE = /.*:.*at.*/;

async function run() {
  const { url } = await prompts({
    type: 'text',
    name: 'url',
    message: 'Enter the RSS URL:'
  });
  const { outfile } = await prompts({
    type: 'text',
    name: 'outfile',
    initial: 'output.csv',
    message: 'Choose an output file:'
  })
  const data = await fetch(url.trim())
  const text = await data.text();

  const xml = new XMLParser().parse(text).rss.channel.item
    .filter(x => x.title.match(REGEX_EXCLUDE))
    .sort((a,b) => new Date(a.pubDate) - new Date(b.pubDate))
    .map(x => ({
      home: x.title.split(":")[1].split(" at ")[1].trim(),
      away: x.title.split(":")[1].split(" at ")[0].trim(),
      pubDate: x.pubDate
    }))
    .map(x => `${new Date(x.pubDate).toLocaleDateString('en-US')}, ${new Date(x.pubDate).toLocaleTimeString('en-US')}, ${x.home}, ${x.away}`)
    .join('\n');

  await fsAsync.writeFile(outfile.trim(), xml);
  console.log(`Wrote to ${outfile.trim()}`);
  process.exit(0);
}

run().catch(e => console.dir(e));

