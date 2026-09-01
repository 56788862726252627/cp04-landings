# Lead Data Model — ADV-08

## Lead Shape

```js
{
  id:                   'string',        // UUID-like
  businessName:         'string',
  vertical:             'string',        // dental, fisio, legal, veterinary, beauty, padel, education, restaurant, default
  location:             'string',
  website:              'string',
  domain:               'string',        // extracted from website
  publicEmail:          'string',
  publicPhone:          'string',
  source:               LEAD_SOURCE_TYPE,
  sourceType:           LEAD_SOURCE_TYPE,
  sourceUrl:            'string',
  externalId:           'string',        // e.g. Google Maps placeId
  discoveredAt:         'ISO string',
  lastUpdatedAt:        'ISO string',
  estimatedSize:        BUSINESS_SIZE,   // MICRO/SMALL/MEDIUM/LARGE/UNKNOWN
  multiLocation:        boolean,
  digitalSignals:       string[],        // DIGITAL_SIGNAL enum values
  painSignals:          string[],        // PAIN_SIGNAL_TYPE enum values
  socialProfiles:       { [network]: url },
  status:               LEAD_STATUS,
  duplicateStatus:      DUPLICATE_STATUS,
  temperature:          LEAD_TEMPERATURE,
  opportunityScore:     number,          // 0-100
  fitScore:             number,          // 0-100
  urgencyScore:         number,          // 0-100
  valueScore:           number,          // 0-100
  easeScore:            number,          // 0-100
  confidence:           number,          // 0-100
  dataQualityScore:     number,          // 0-100
  digitalMaturityScore: number,          // 0-100
  digitalMaturityLevel: string,
  recommendedServices:  string[],
  recommendedService:   string,
  recommendedNextAction:string,
  isReal:               false,           // ALWAYS false in non-production
}
```

## Lead Status Enum

```
RAW → NORMALIZED → ENRICHED → SCORED → QUALIFIED → DISQUALIFIED
                                           ↕
                                        DUPLICATE
                                        STALE
                                        ARCHIVED
```

## LEAD_SOURCE_TYPE

| Value | Description |
|---|---|
| MANUAL | Hand-entered |
| CSV | Imported from CSV file |
| PUBLIC_WEB | Public web scrape |
| GOOGLE_MAPS_FOUNDATION | Google Maps dataset |
| APIFY | Apify actor result |
| DIRECTORY | Industry directory |
| SOCIAL_PUBLIC | Public social profile |
| REFERRAL | Referral from contact |
| CRM_IMPORT | Imported from existing CRM |
| CUSTOM | Custom provider |
| FIXTURE | Test fixture (never real) |

## BUSINESS_SIZE

| Value | Rough staff range |
|---|---|
| MICRO | 1–4 |
| SMALL | 5–20 |
| MEDIUM | 21–100 |
| LARGE | 100+ |
| UNKNOWN | Not determined |

## Digital Signals (13)

`WEBSITE_PRESENT`, `MOBILE_FRIENDLY`, `BOOKING_SYSTEM`, `ONLINE_FORMS`, `CRM_SIGNALS`, `AUTOMATION_SIGNALS`, `CHAT_PRESENT`, `AI_SIGNALS`, `SOCIAL_PRESENCE`, `RESPONSE_CHANNELS`, `REVIEWS_ACTIVE`, `ONLINE_PAYMENTS`, `CLIENT_PORTAL`

## Pain Signal Types (15)

`NO_BOOKING`, `MANUAL_APPOINTMENTS`, `NO_AUTOMATION`, `OUTDATED_WEBSITE`, `NO_CRM`, `BROKEN_CTA`, `SLOW_RESPONSE`, `LOW_REVIEWS`, `NO_ONLINE_PRESENCE`, `COMPETITOR_PRESSURE`, `STAFF_OVERLOAD`, `NO_CLIENT_PORTAL`, `NO_PAYMENTS_ONLINE`, `SEASONAL_DROPS`, `HIGH_NO_SHOW`

## LeadSource Shape

```js
{
  provider:    'string',
  sourceType:  LEAD_SOURCE_TYPE,
  fetchedAt:   'ISO string',
  query:       'string',
  datasetId:   'string',
  isReal:      false,
}
```
