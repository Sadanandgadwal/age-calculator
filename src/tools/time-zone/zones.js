const zone = (id, label) => ({ id, label });

export const ZONE_GROUPS = [
  {
    name: 'Universal',
    zones: [zone('UTC', 'UTC – Coordinated Universal Time'), zone('Etc/GMT', 'GMT – Greenwich Mean Time')],
  },
  {
    name: 'Asia and Middle East',
    zones: [
      zone('Asia/Kolkata', 'India – Delhi, Mumbai, Kolkata (IST)'),
      zone('Asia/Dubai', 'UAE – Dubai, Abu Dhabi'),
      zone('Asia/Riyadh', 'Saudi Arabia – Riyadh'),
      zone('Asia/Tehran', 'Iran – Tehran'),
      zone('Asia/Karachi', 'Pakistan – Karachi'),
      zone('Asia/Kathmandu', 'Nepal – Kathmandu'),
      zone('Asia/Dhaka', 'Bangladesh – Dhaka'),
      zone('Asia/Colombo', 'Sri Lanka – Colombo'),
      zone('Asia/Bangkok', 'Thailand – Bangkok'),
      zone('Asia/Jakarta', 'Indonesia – Jakarta'),
      zone('Asia/Singapore', 'Singapore'),
      zone('Asia/Kuala_Lumpur', 'Malaysia – Kuala Lumpur'),
      zone('Asia/Hong_Kong', 'Hong Kong'),
      zone('Asia/Shanghai', 'China – Beijing, Shanghai'),
      zone('Asia/Manila', 'Philippines – Manila'),
      zone('Asia/Seoul', 'South Korea – Seoul'),
      zone('Asia/Tokyo', 'Japan – Tokyo'),
    ],
  },
  {
    name: 'Europe',
    zones: [
      zone('Europe/London', 'UK – London'),
      zone('Europe/Dublin', 'Ireland – Dublin'),
      zone('Europe/Paris', 'France – Paris'),
      zone('Europe/Berlin', 'Germany – Berlin'),
      zone('Europe/Madrid', 'Spain – Madrid'),
      zone('Europe/Rome', 'Italy – Rome'),
      zone('Europe/Amsterdam', 'Netherlands – Amsterdam'),
      zone('Europe/Athens', 'Greece – Athens'),
      zone('Europe/Istanbul', 'Turkey – Istanbul'),
      zone('Europe/Moscow', 'Russia – Moscow'),
    ],
  },
  {
    name: 'Americas',
    zones: [
      zone('America/New_York', 'US Eastern – New York (EST/EDT)'),
      zone('America/Chicago', 'US Central – Chicago (CST/CDT)'),
      zone('America/Denver', 'US Mountain – Denver (MST/MDT)'),
      zone('America/Phoenix', 'US Arizona – Phoenix (MST)'),
      zone('America/Los_Angeles', 'US Pacific – Los Angeles (PST/PDT)'),
      zone('America/Anchorage', 'US Alaska – Anchorage'),
      zone('Pacific/Honolulu', 'US Hawaii – Honolulu'),
      zone('America/Toronto', 'Canada – Toronto'),
      zone('America/Vancouver', 'Canada – Vancouver'),
      zone('America/Mexico_City', 'Mexico – Mexico City'),
      zone('America/Sao_Paulo', 'Brazil – São Paulo'),
      zone('America/Argentina/Buenos_Aires', 'Argentina – Buenos Aires'),
    ],
  },
  {
    name: 'Africa',
    zones: [
      zone('Africa/Cairo', 'Egypt – Cairo'),
      zone('Africa/Johannesburg', 'South Africa – Johannesburg'),
      zone('Africa/Lagos', 'Nigeria – Lagos'),
      zone('Africa/Nairobi', 'Kenya – Nairobi'),
    ],
  },
  {
    name: 'Oceania',
    zones: [
      zone('Australia/Perth', 'Australia – Perth'),
      zone('Australia/Brisbane', 'Australia – Brisbane'),
      zone('Australia/Sydney', 'Australia – Sydney, Melbourne'),
      zone('Pacific/Auckland', 'New Zealand – Auckland'),
    ],
  },
];

export const ALL_ZONES = ZONE_GROUPS.flatMap(({ zones }) => zones);
