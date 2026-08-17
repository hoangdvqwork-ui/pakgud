// Vercel serverless function: receives PakGud contact-form submissions
// (lien-he.html) and writes each one as a new row into the "PakGud
// Inquiries" Notion data source. The Notion integration token stays
// server-side only (env var NOTION_TOKEN) -- never exposed to the browser.
//
// Requires a Vercel project env var:
//   NOTION_TOKEN — secret from a dedicated Notion internal integration
//                  that has been shared with the "PakGud Inquiries"
//                  data source (and nothing else).

const NOTION_DATA_SOURCE_ID = '3bf10156-bbda-802f-81fe-000bdc95d1cb';
const NOTION_VERSION = '2025-09-03';

function titleProp(value) {
  return { title: [{ text: { content: String(value) } }] };
}
function textProp(value) {
  return { rich_text: [{ text: { content: String(value) } }] };
}
function selectProp(value) {
  return { select: { name: String(value) } };
}
function multiSelectProp(values) {
  return { multi_select: values.map((v) => ({ name: String(v) })) };
}
function dateProp(value) {
  return { date: { start: String(value) } };
}
function urlProp(value) {
  return { url: String(value) };
}

// Builds the Notion properties payload, omitting any field the visitor
// left blank rather than sending explicit nulls.
function buildProperties(data) {
  const properties = {
    'Contact Name': titleProp(data.contactName),
    'Contact Info': textProp(data.contactInfo),
  };

  const selectFields = {
    'Event Type': 'eventType',
    'Guest Count': 'guestCount',
    'Venue Status': 'venueStatus',
    'Venue Days': 'venueDays',
    'Close Contact': 'closeContact',
    'Entry Control': 'entryControl',
    'Merch Booth': 'merchBooth',
    Region: 'region',
    'Merch Qty': 'merchQty',
    Language: 'lang',
  };
  for (const [notionName, fieldName] of Object.entries(selectFields)) {
    if (data[fieldName]) properties[notionName] = selectProp(data[fieldName]);
  }

  if (data.artistOrigin) properties['Artist Origin'] = textProp(data.artistOrigin);
  if (Array.isArray(data.addons) && data.addons.length) {
    properties['Add-ons'] = multiSelectProp(data.addons);
  }
  if (data.eventDate) properties['Event Date'] = dateProp(data.eventDate);
  if (data.pageUrl) properties['Page URL'] = urlProp(data.pageUrl);

  return properties;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!process.env.NOTION_TOKEN) {
    console.error('submit-inquiry: missing NOTION_TOKEN env var');
    res.status(500).json({ error: 'Server misconfigured' });
    return;
  }

  let data;
  try {
    data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (err) {
    res.status(400).json({ error: 'Invalid JSON body' });
    return;
  }

  if (!data || !data.contactName || !data.contactInfo) {
    res.status(400).json({ error: 'contactName and contactInfo are required' });
    return;
  }

  try {
    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent: { type: 'data_source_id', data_source_id: NOTION_DATA_SOURCE_ID },
        properties: buildProperties(data),
      }),
    });

    const body = await notionRes.json();

    if (!notionRes.ok) {
      console.error('Notion API error:', body);
      res.status(502).json({ error: 'Failed to save submission' });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Notion request failed:', err);
    res.status(502).json({ error: 'Failed to save submission' });
  }
};
