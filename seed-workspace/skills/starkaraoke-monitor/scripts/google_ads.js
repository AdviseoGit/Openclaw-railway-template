const { GoogleAdsApi, enums } = require('google-ads-api');

const CUSTOMER_ID = '7851963450';
const LOGIN_CUSTOMER_ID = '4652679511';

function getCustomer() {
  const client = new GoogleAdsApi({
    client_id: process.env.GOOGLE_ADS_CLIENT_ID,
    client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN
  });
  return client.Customer({
    customer_id: CUSTOMER_ID,
    login_customer_id: LOGIN_CUSTOMER_ID,
    refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN
  });
}

function budgetMicros(sek) {
  return sek * 1_000_000;
}

async function pauseOldCampaigns(customer, namePattern) {
  const rows = await customer.query(
    `SELECT campaign.id FROM campaign WHERE campaign.name LIKE '${namePattern}' AND campaign.status = 'ENABLED'`
  );
  for (const row of rows) {
    await customer.campaigns.update([{
      resource_name: `customers/${CUSTOMER_ID}/campaigns/${row.campaign.id}`,
      status: enums.CampaignStatus.PAUSED
    }]);
  }
  return rows.length;
}

async function createSearchCampaign(customer, { name, budgetSek, keywords, headlines, descriptions }) {
  const { results: budgetResult } = await customer.campaignBudgets.create([{
    amount_micros: budgetMicros(budgetSek),
    delivery_method: enums.BudgetDeliveryMethod.STANDARD,
    explicitly_shared: false
  }]);

  const { results: campaignResult } = await customer.campaigns.create([{
    name,
    status: enums.CampaignStatus.ENABLED,
    advertising_channel_type: enums.AdvertisingChannelType.SEARCH,
    campaign_budget: budgetResult[0].resource_name,
    network_settings: { target_google_search: true, target_search_network: true, target_content_network: false, target_partner_search_network: false },
    manual_cpc: { enhanced_cpc_enabled: false },
    contains_eu_political_advertising: 3
  }]);
  const campaignRN = campaignResult[0].resource_name;

  const { results: adGroupResult } = await customer.adGroups.create([{
    campaign: campaignRN,
    name: name + ' - AdGroup',
    status: enums.AdGroupStatus.ENABLED,
    type: enums.AdGroupType.SEARCH_STANDARD,
    cpc_bid_micros: 20_000_000
  }]);
  const adGroupRN = adGroupResult[0].resource_name;

  await customer.adGroupCriteria.create(keywords.map(({ text, matchType }) => ({
    ad_group: adGroupRN,
    status: enums.AdGroupCriterionStatus.ENABLED,
    keyword: { text, match_type: matchType || enums.KeywordMatchType.PHRASE }
  })));

  await customer.adGroupAds.create([{
    ad_group: adGroupRN,
    status: enums.AdGroupAdStatus.ENABLED,
    ad: {
      final_urls: ['https://www.starkaraoke.se/#boka'],
      responsive_search_ad: {
        headlines: headlines.map(text => ({ text })),
        descriptions: descriptions.map(text => ({ text }))
      }
    }
  }]);

  return campaignRN;
}

async function runFlash(action) {
  const customer = getCustomer();
  const { targetDate, dayName, daysAway, occupancyPct } = action;

  const paused = await pauseOldCampaigns(customer, 'AI Blixt%');

  const isWeekend = ['Fre', 'Lör'].includes(dayName);
  const urgency = daysAway === 0 ? 'Ikväll' : daysAway === 1 ? 'Imorgon' : `${dayName} ${targetDate.slice(5)}`;

  const keywords = isWeekend
    ? [
        { text: `karaoke göteborg ${dayName.toLowerCase()}`, matchType: enums.KeywordMatchType.EXACT },
        { text: 'karaoke göteborg helg', matchType: enums.KeywordMatchType.PHRASE },
        { text: 'aktivitet göteborg kväll', matchType: enums.KeywordMatchType.PHRASE }
      ]
    : [
        { text: 'after work göteborg', matchType: enums.KeywordMatchType.EXACT },
        { text: 'karaoke göteborg', matchType: enums.KeywordMatchType.PHRASE },
        { text: 'teambuilding göteborg', matchType: enums.KeywordMatchType.PHRASE }
      ];

  const headlines = isWeekend
    ? [`Karaoke ${urgency}`, 'Star Karaoke Göteborg', 'Privat Studio till 03:00', 'Boka Nu – Sena Luckor', '120k Låtar & Room Service', 'Från 199kr/pers']
    : [`AW ${urgency}`, 'Boka After Work Göteborg', 'Privat Studio & Mat', 'Star Karaoke AW', 'Från 149kr/pers Ons–Tor', '120k Låtar'];

  const descriptions = isWeekend
    ? [
        `Lediga studios ${urgency.toLowerCase()} hos Star Karaoke Göteborg! Privat studio, room service & nattöppet till 03.`,
        'Boka snabbt! 120 000 låtar, proffsmickar, pizzabuffé & dryck direkt till rummet.'
      ]
    : [
        `Perfekt AW ${urgency.toLowerCase()}! Privat karaokestudio med mat & dryck. Boka online direkt.`,
        'Teambuilding eller AW – sjung loss i privat studio. Från 149kr/pers. Boka nu!'
      ];

  const campaignRN = await createSearchCampaign(customer, {
    name: `AI Blixt ${dayName} ${targetDate} - ${Date.now()}`,
    budgetSek: 250,
    keywords,
    headlines,
    descriptions
  });

  return `Google Ads blixt skapad (${paused} gamla pausade). Kampanj: ${campaignRN}`;
}

async function runProactive(action) {
  const customer = getCustomer();
  const { targetDate, dayName, daysAway } = action;

  const paused = await pauseOldCampaigns(customer, 'AI Proaktiv%');

  const isWeekend = ['Fre', 'Lör'].includes(dayName);
  const weeksOut = Math.ceil(daysAway / 7);
  const horizonLabel = weeksOut <= 1 ? 'Nästa Vecka' : `Om ${weeksOut} Veckor`;

  const keywords = isWeekend
    ? [
        { text: 'karaoke göteborg helg', matchType: enums.KeywordMatchType.PHRASE },
        { text: 'aktivitet göteborg', matchType: enums.KeywordMatchType.PHRASE }
      ]
    : [
        { text: 'after work göteborg', matchType: enums.KeywordMatchType.EXACT },
        { text: 'teambuilding göteborg', matchType: enums.KeywordMatchType.PHRASE },
        { text: 'aw göteborg', matchType: enums.KeywordMatchType.PHRASE }
      ];

  const headlines = isWeekend
    ? [`Planera Helgen ${horizonLabel}`, 'Privat Karaokestudio', 'Star Karaoke Göteborg', 'Boka i Förväg', 'Sällskapsaktivitet Göteborg', '120k Låtar & Room Service']
    : [`Boka AW ${horizonLabel}`, 'Teambuilding i Göteborg', 'Privat Studio & Mat', 'After Work Göteborg', 'Från 149kr/pers', 'Sjung Loss Med Kollegorna'];

  const descriptions = isWeekend
    ? [
        `Säkra er helgkväll ${horizonLabel.toLowerCase()} hos Star Karaoke! Privat studio med room service.`,
        'Boka nu för bäst urval av studios. 120 000 låtar, proffsmickar & nattöppet till 03:00.'
      ]
    : [
        `Planera nästa AW nu! Privat karaokestudio med mat & dryck. Boka ${horizonLabel.toLowerCase()} innan tiderna tar slut.`,
        'Teambuilding med twist – sjung loss i privat studio. Från 149kr ons–tor. Boka online direkt.'
      ];

  const campaignRN = await createSearchCampaign(customer, {
    name: `AI Proaktiv ${dayName} ${targetDate} - ${Date.now()}`,
    budgetSek: 300,
    keywords,
    headlines,
    descriptions
  });

  return `Google Ads proaktiv kampanj skapad (${paused} gamla pausade). Kampanj: ${campaignRN}`;
}

module.exports = { runFlash, runProactive };
