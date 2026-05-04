const { GoogleAdsApi, enums } = require('google-ads-api');

const client = new GoogleAdsApi({
  client_id: process.env.GOOGLE_ADS_CLIENT_ID,
  client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
  developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN
});

async function run() {
  try {
    const customer = client.Customer({
      customer_id: "7851963450",
      login_customer_id: "4652679511",
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN
    });
    
    const { results: budgetResult } = await customer.campaignBudgets.create([{
        amount_micros: 300000000,
        delivery_method: enums.BudgetDeliveryMethod.STANDARD,
        explicitly_shared: false
    }]);
    const budgetName = budgetResult[0].resource_name;

    const { results: campaignResult } = await customer.campaigns.create([{
        name: 'AI Proaktiv: AW Nästa Vecka - ' + Date.now(),
        status: enums.CampaignStatus.ENABLED,
        advertising_channel_type: enums.AdvertisingChannelType.SEARCH,
        campaign_budget: budgetName,
        network_settings: {
            target_google_search: true,
            target_search_network: false,
            target_content_network: false,
            target_partner_search_network: false
        },
        manual_cpc: { enhanced_cpc_enabled: false },
        contains_eu_political_advertising: 3 // FALSE
    }]);
    const campaignName = campaignResult[0].resource_name;

    const { results: adGroupResult } = await customer.adGroups.create([{
      campaign: campaignName,
      name: 'AW Proaktiv - ' + Date.now(),
      status: enums.AdGroupStatus.ENABLED,
      type: enums.AdGroupType.SEARCH_STANDARD,
      cpc_bid_micros: 20000000 // 20 kr max
    }]);
    const adGroupName = adGroupResult[0].resource_name;

    await customer.adGroupCriteria.create([{
      ad_group: adGroupName,
      status: enums.AdGroupCriterionStatus.ENABLED,
      keyword: { text: 'after work göteborg', match_type: enums.KeywordMatchType.EXACT }
    }, {
      ad_group: adGroupName,
      status: enums.AdGroupCriterionStatus.ENABLED,
      keyword: { text: 'teambuilding göteborg', match_type: enums.KeywordMatchType.PHRASE }
    }]);

    await customer.adGroupAds.create([{
      ad_group: adGroupName,
      status: enums.AdGroupAdStatus.ENABLED,
      ad: {
        final_urls: ['https://www.starkaraoke.se/#boka'],
        responsive_search_ad: {
          headlines: [
            { text: 'Boka Teambuilding i Göteborg', pinned_field: enums.ServedAssetFieldType.HEADLINE_1 },
            { text: 'Star Karaoke Göteborg' },
            { text: 'Privat Studio & Mat' },
            { text: 'Sjung loss med kollegorna!' },
            { text: '120k låtar & Room Service' },
            { text: 'Boka Nästa After Work Nu' },
            { text: 'Maxa Er AW hos oss' }
          ],
          descriptions: [
            { text: 'Överraska kontoret med privat studio nästa vecka! Mat & dryck direkt i rummet.' },
            { text: 'Boka stans roligaste AW från 199 kr/pers. Unika studios & proffsljud.' },
            { text: 'Släpp loss med kollegorna! Privat studio, över 120 000 låtar och fantastisk stämning.' },
            { text: 'Säkra nästa veckas after work nu innan våra mest populära tider försvinner.' }
          ]
        }
      }
    }]);

    const oldCamps = await customer.query(`
      SELECT campaign.id FROM campaign WHERE campaign.name LIKE 'AI Blixtinsats Sök%' AND campaign.status = 'ENABLED'
    `);
    if(oldCamps.length > 0) {
      await customer.campaigns.update([{
        resource_name: `customers/7851963450/campaigns/${oldCamps[0].campaign.id}`,
        status: enums.CampaignStatus.PAUSED
      }]);
    }

    console.log("✅ Google Ads proaktiv kampanj aktiverad och gammal pausad!");
  } catch (err) {
    console.error("Fel:", err.errors ? JSON.stringify(err.errors, null, 2) : err);
  }
}
run();
