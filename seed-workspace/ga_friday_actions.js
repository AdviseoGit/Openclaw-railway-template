const { GoogleAdsApi, enums } = require('google-ads-api');

const client = new GoogleAdsApi({
  client_id: process.env.GOOGLE_ADS_CLIENT_ID,
  client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
  developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN
});

async function run() {
  const customer = client.Customer({
    customer_id: "7851963450",
    login_customer_id: "4652679511",
    refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN
  });

  // Pausa alla tidigare AI-blixtkampanjer
  const oldCamps = await customer.query(`
    SELECT campaign.id FROM campaign WHERE campaign.name LIKE 'AI Blixt%' AND campaign.status = 'ENABLED'
  `);
  for(let c of oldCamps) {
    await customer.campaigns.update([{
      resource_name: `customers/7851963450/campaigns/${c.campaign.id}`,
      status: enums.CampaignStatus.PAUSED
    }]);
    console.log(`Pausade gammal kampanj: ${c.campaign.id}`);
  }

  // Skapa ny kortvarig fredags/lördags-kampanj (endast om de är dåligt bokade)
  // Vi tar 250 kr budget per dag för fredag och lördag.
  const budgetAmount = 250000000; // 250 SEK

  const { results: budgetResult } = await customer.campaignBudgets.create([{
    amount_micros: budgetAmount,
    delivery_method: enums.BudgetDeliveryMethod.STANDARD,
    explicitly_shared: false
  }]);
  const budgetName = budgetResult[0].resource_name;

  // Fredagskampanj
  const { results: campaignFridayResult } = await customer.campaigns.create([{
    name: 'AI Kortsiktigt: Fredag - ' + Date.now(),
    status: enums.CampaignStatus.ENABLED,
    advertising_channel_type: enums.AdvertisingChannelType.SEARCH,
    campaign_budget: budgetName,
    network_settings: {
      target_google_search: true, target_search_network: true, target_content_network: false, target_partner_search_network: false
    },
    manual_cpc: { enhanced_cpc_enabled: false },
    contains_eu_political_advertising: 3
  }]);
  const campaignFridayName = campaignFridayResult[0].resource_name;

  const { results: adGroupFridayResult } = await customer.adGroups.create([{
    campaign: campaignFridayName, name: 'Sena Fredagsbokningar', status: enums.AdGroupStatus.ENABLED, type: enums.AdGroupType.SEARCH_STANDARD, cpc_bid_micros: 20000000
  }]);
  const adGroupFridayName = adGroupFridayResult[0].resource_name;

  await customer.adGroupCriteria.create([{
    ad_group: adGroupFridayName, status: enums.AdGroupCriterionStatus.ENABLED, keyword: { text: 'karaoke göteborg fredag', match_type: enums.KeywordMatchType.EXACT }
  }, {
    ad_group: adGroupFridayName, status: enums.AdGroupCriterionStatus.ENABLED, keyword: { text: 'aw göteborg fredag', match_type: enums.KeywordMatchType.PHRASE }
  }, {
    ad_group: adGroupFridayName, status: enums.AdGroupCriterionStatus.ENABLED, keyword: { text: 'ledig studio ikväll', match_type: enums.KeywordMatchType.PHRASE }
  }]);

  await customer.adGroupAds.create([{
    ad_group: adGroupFridayName, status: enums.AdGroupAdStatus.ENABLED,
    ad: {
      final_urls: ['https://www.starkaraoke.se/#boka'],
      responsive_search_ad: {
        headlines: [
          { text: 'Sena Fredagstider' }, { text: 'Boka Karaoke Ikväll' }, { text: 'Starta Helgen Här' }, { text: 'Från 199kr/pers' }, { text: 'Pizzabuffé & Dryck' }, { text: 'Privat Studio till 03' }
        ],
        descriptions: [
          { text: 'Vi har några sena karaoketider kvar ikväll. Perfekt start på helgen med vännerna!' },
          { text: 'Njut av privat studio, 120k låtar, room service och nattöppet till 03:00.' }
        ]
      }
    }
  }]);
  console.log("✅ Google Ads Fredags-kampanj aktiverad!");

  // Lördagskampanj
  const { results: campaignSaturdayResult } = await customer.campaigns.create([{
    name: 'AI Kortsiktigt: Lördag - ' + Date.now(),
    status: enums.CampaignStatus.ENABLED,
    advertising_channel_type: enums.AdvertisingChannelType.SEARCH,
    campaign_budget: budgetName,
    network_settings: {
      target_google_search: true, target_search_network: true, target_content_network: false, target_partner_search_network: false
    },
    manual_cpc: { enhanced_cpc_enabled: false },
    contains_eu_political_advertising: 3
  }]);
  const campaignSaturdayName = campaignSaturdayResult[0].resource_name;

  const { results: adGroupSaturdayResult } = await customer.adGroups.create([{
    campaign: campaignSaturdayName, name: 'Sena Lördagsbokningar', status: enums.AdGroupStatus.ENABLED, type: enums.AdGroupType.SEARCH_STANDARD, cpc_bid_micros: 20000000
  }]);
  const adGroupSaturdayName = adGroupSaturdayResult[0].resource_name;

  await customer.adGroupCriteria.create([{
    ad_group: adGroupSaturdayName, status: enums.AdGroupCriterionStatus.ENABLED, keyword: { text: 'karaoke göteborg lördag', match_type: enums.KeywordMatchType.EXACT }
  }, {
    ad_group: adGroupSaturdayName, status: enums.AdGroupCriterionStatus.ENABLED, keyword: { text: 'aktivitet göteborg lördag', match_type: enums.KeywordMatchType.PHRASE }
  }, {
    ad_group: adGroupSaturdayName, status: enums.AdGroupCriterionStatus.ENABLED, keyword: { text: 'fest göteborg lördag', match_type: enums.KeywordMatchType.PHRASE }
  }]);

  await customer.adGroupAds.create([{
    ad_group: adGroupSaturdayName, status: enums.AdGroupAdStatus.ENABLED,
    ad: {
      final_urls: ['https://www.starkaraoke.se/#boka'],
      responsive_search_ad: {
        headlines: [
          { text: 'Lördagskväll i Göteborg' }, { text: 'Boka Karaoke Idag' }, { text: 'Egen Studio till 03' }, { text: 'Perfekt Förfest' }, { text: 'Pizzabuffé & Dryck' }, { text: 'Boka Star Karaoke' }
        ],
        descriptions: [
          { text: 'Maxa lördagkvällen med vännerna! Privata karaokestudios, nattöppet till 03:00.' },
          { text: 'Sjung loss till 120k låtar. Beställ mat & dryck via room service direkt till rummet.' }
        ]
      }
    }
  }]);
  console.log("✅ Google Ads Lördags-kampanj aktiverad!");
}
run();
