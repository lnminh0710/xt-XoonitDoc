import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Country } from '@app/models/country.model';

@Component({
    selector: 'xn-used-countries',
    styleUrls: ['./used-countries.component.scss'],
    templateUrl: './used-countries.component.html'
})
export class XnUsedCountryComponent implements OnInit, OnDestroy {
    public isRendered = false;
    public mainList: any = [];
    private defaultRowNo = 5;
    public defaulWidthColumn = 270;
    private quantSubCols = 1;
    public isShowedSubList = false;
    public perfectScrollbarConfig: any = {};

    @Input() set data(data: any) {
        data = this.createFakeData();
        this.initCountriesData(data);
    }

    constructor(
    ) { }

    public ngOnInit() {
        this.perfectScrollbarConfig = {
            suppressScrollX: false,
            suppressScrollY: false
        }
    }

    private initCountriesData(countriesData: any) {
        if (!countriesData) { return; }
        const data = {
            mainList: countriesData.slice(0)
        };
        let array: Country[];
        (<Country[]>data.mainList).forEach((item, index) => {
            if (index % this.defaultRowNo === 0)
                array = [];
            const newItem: Country = new Country();
            Object.assign(newItem, item);
            newItem.isActive = true;
            array.push(newItem);
            if (index % this.defaultRowNo === this.defaultRowNo - 1)
                this.mainList.push(array);
        });

        this.isRendered = true;
    }

    ngOnDestroy() {
    }

    private createFakeData() {
        return [
            {
                'countryCode': 'Switzerland',
                'idRepIsoCountryCode': 204,
                'isoCode': 'CH'
            },
            {
                'countryCode': 'Canada',
                'idRepIsoCountryCode': 38,
                'isoCode': 'CA'
            },
            {
                'countryCode': 'Falkland Islands (Malvinas)',
                'idRepIsoCountryCode': 69,
                'isoCode': 'FK'
            },
            {
                'countryCode': 'Ethiopia',
                'idRepIsoCountryCode': 68,
                'isoCode': 'ET'
            },
            {
                'countryCode': 'Estonia',
                'idRepIsoCountryCode': 67,
                'isoCode': 'EE'
            },
            {
                'countryCode': 'Eritrea',
                'idRepIsoCountryCode': 66,
                'isoCode': 'ER'
            },
            {
                'countryCode': 'Equatorial Guinea',
                'idRepIsoCountryCode': 65,
                'isoCode': 'GQ'
            },
            {
                'countryCode': 'El Salvador',
                'idRepIsoCountryCode': 64,
                'isoCode': 'SV'
            },
            {
                'countryCode': 'Egypt',
                'idRepIsoCountryCode': 63,
                'isoCode': 'EG'
            },
            {
                'countryCode': 'East Timor',
                'idRepIsoCountryCode': 61,
                'isoCode': 'TL'
            },
            {
                'countryCode': 'Dominican Republic',
                'idRepIsoCountryCode': 60,
                'isoCode': 'DO'
            },
            {
                'countryCode': 'Dominica',
                'idRepIsoCountryCode': 59,
                'isoCode': 'DM'
            },
            {
                'countryCode': 'Djibouti',
                'idRepIsoCountryCode': 58,
                'isoCode': 'DJ'
            },
            {
                'countryCode': 'Denmark',
                'idRepIsoCountryCode': 57,
                'isoCode': 'DK'
            },
            {
                'countryCode': 'Czech Republic',
                'idRepIsoCountryCode': 56,
                'isoCode': 'CZ'
            },
            {
                'countryCode': 'Cyprus',
                'idRepIsoCountryCode': 55,
                'isoCode': 'CY'
            },
            {
                'countryCode': 'Cuba',
                'idRepIsoCountryCode': 54,
                'isoCode': 'CU'
            },
            {
                'countryCode': 'Croatia',
                'idRepIsoCountryCode': 53,
                'isoCode': 'HR'
            },
            {
                'countryCode': 'Cote d´Ivoire',
                'idRepIsoCountryCode': 52,
                'isoCode': 'CI'
            },
            {
                'countryCode': 'Costa Rica',
                'idRepIsoCountryCode': 51,
                'isoCode': 'CR'
            },
            {
                'countryCode': 'Cook Islands',
                'idRepIsoCountryCode': 50,
                'isoCode': 'CK'
            },
            {
                'countryCode': 'Rep. of the Congo',
                'idRepIsoCountryCode': 49,
                'isoCode': 'CG'
            },
            {
                'countryCode': 'Comoros',
                'idRepIsoCountryCode': 48,
                'isoCode': 'KM'
            },
            {
                'countryCode': 'Colombia',
                'idRepIsoCountryCode': 47,
                'isoCode': 'CO'
            },
            {
                'countryCode': 'Cocos (Keeling) Islands',
                'idRepIsoCountryCode': 46,
                'isoCode': 'CC'
            },
            {
                'countryCode': 'Christmas Island',
                'idRepIsoCountryCode': 45,
                'isoCode': 'CX'
            },
            {
                'countryCode': 'China',
                'idRepIsoCountryCode': 44,
                'isoCode': 'CN'
            },
            {
                'countryCode': 'Chile',
                'idRepIsoCountryCode': 43,
                'isoCode': 'CL'
            },
            {
                'countryCode': 'Chad',
                'idRepIsoCountryCode': 42,
                'isoCode': 'TD'
            },
            {
                'countryCode': 'Central African Republic',
                'idRepIsoCountryCode': 41,
                'isoCode': 'CF'
            },
            {
                'countryCode': 'Cayman Islands',
                'idRepIsoCountryCode': 40,
                'isoCode': 'KY'
            },
            {
                'countryCode': 'Cape Verde',
                'idRepIsoCountryCode': 39,
                'isoCode': 'CV'
            },
            {
                'countryCode': 'Cameroon',
                'idRepIsoCountryCode': 37,
                'isoCode': 'CM'
            },
            {
                'countryCode': 'Cambodia',
                'idRepIsoCountryCode': 36,
                'isoCode': 'KH'
            },
            {
                'countryCode': 'Burundi',
                'idRepIsoCountryCode': 35,
                'isoCode': 'BI'
            },
            {
                'countryCode': 'Burkina Faso',
                'idRepIsoCountryCode': 34,
                'isoCode': 'BF'
            },
            {
                'countryCode': 'Bulgaria',
                'idRepIsoCountryCode': 33,
                'isoCode': 'BG'
            },
            {
                'countryCode': 'Brunei Darussalam',
                'idRepIsoCountryCode': 32,
                'isoCode': 'BN'
            },
            {
                'countryCode': 'British Indian Ocean Territory',
                'idRepIsoCountryCode': 31,
                'isoCode': 'IO'
            },
            {
                'countryCode': 'Brazil',
                'idRepIsoCountryCode': 30,
                'isoCode': 'BR'
            },
            {
                'countryCode': 'Bouvet Island',
                'idRepIsoCountryCode': 29,
                'isoCode': 'BV'
            },
            {
                'countryCode': 'Botswana',
                'idRepIsoCountryCode': 28,
                'isoCode': 'BW'
            },
            {
                'countryCode': 'Bosnia And Herzegowina',
                'idRepIsoCountryCode': 27,
                'isoCode': 'BA'
            },
            {
                'countryCode': 'Bolivia',
                'idRepIsoCountryCode': 26,
                'isoCode': 'BO'
            },
            {
                'countryCode': 'Bhutan',
                'idRepIsoCountryCode': 25,
                'isoCode': 'BT'
            },
            {
                'countryCode': 'Bermuda',
                'idRepIsoCountryCode': 24,
                'isoCode': 'BM'
            },
            {
                'countryCode': 'Benin',
                'idRepIsoCountryCode': 23,
                'isoCode': 'BJ'
            },
            {
                'countryCode': 'Belize',
                'idRepIsoCountryCode': 22,
                'isoCode': 'BZ'
            },
            {
                'countryCode': 'Belgium',
                'idRepIsoCountryCode': 21,
                'isoCode': 'BE'
            },
            {
                'countryCode': 'Belarus',
                'idRepIsoCountryCode': 20,
                'isoCode': 'BY'
            },
            {
                'countryCode': 'Norfolk Island',
                'idRepIsoCountryCode': 158,
                'isoCode': 'NF'
            },
            {
                'countryCode': 'Niue',
                'idRepIsoCountryCode': 157,
                'isoCode': 'NU'
            },
            {
                'countryCode': 'Nigeria',
                'idRepIsoCountryCode': 156,
                'isoCode': 'NG'
            },
            {
                'countryCode': 'Niger',
                'idRepIsoCountryCode': 155,
                'isoCode': 'NE'
            },
            {
                'countryCode': 'Nicaragua',
                'idRepIsoCountryCode': 154,
                'isoCode': 'NI'
            },
            {
                'countryCode': 'New Zealand',
                'idRepIsoCountryCode': 153,
                'isoCode': 'NZ'
            },
            {
                'countryCode': 'New Caledonia',
                'idRepIsoCountryCode': 152,
                'isoCode': 'NC'
            },
            {
                'countryCode': 'Netherlands Antilles',
                'idRepIsoCountryCode': 151,
                'isoCode': 'AN'
            },
            {
                'countryCode': 'Netherlands',
                'idRepIsoCountryCode': 150,
                'isoCode': 'NL'
            },
            {
                'countryCode': 'Nepal',
                'idRepIsoCountryCode': 149,
                'isoCode': 'NP'
            },
            {
                'countryCode': 'Nauru',
                'idRepIsoCountryCode': 148,
                'isoCode': 'NR'
            },
            {
                'countryCode': 'Namibia',
                'idRepIsoCountryCode': 147,
                'isoCode': 'NA'
            },
            {
                'countryCode': 'Myanmar',
                'idRepIsoCountryCode': 146,
                'isoCode': 'MM'
            },
            {
                'countryCode': 'Mozambique',
                'idRepIsoCountryCode': 145,
                'isoCode': 'MZ'
            },
            {
                'countryCode': 'Morocco',
                'idRepIsoCountryCode': 144,
                'isoCode': 'MA'
            },
            {
                'countryCode': 'Montserrat',
                'idRepIsoCountryCode': 143,
                'isoCode': 'MS'
            },
            {
                'countryCode': 'Mongolia',
                'idRepIsoCountryCode': 142,
                'isoCode': 'MN'
            },
            {
                'countryCode': 'Monaco',
                'idRepIsoCountryCode': 141,
                'isoCode': 'MC'
            },
            {
                'countryCode': 'Moldova',
                'idRepIsoCountryCode': 140,
                'isoCode': 'MD'
            },
            {
                'countryCode': 'Micronesia, Federated States O',
                'idRepIsoCountryCode': 139,
                'isoCode': 'FM'
            },
            {
                'countryCode': 'Mexico',
                'idRepIsoCountryCode': 138,
                'isoCode': 'MX'
            },
            {
                'countryCode': 'Mayotte',
                'idRepIsoCountryCode': 137,
                'isoCode': 'YT'
            },
            {
                'countryCode': 'Mauritius',
                'idRepIsoCountryCode': 136,
                'isoCode': 'MU'
            },
            {
                'countryCode': 'Mauritania',
                'idRepIsoCountryCode': 135,
                'isoCode': 'MR'
            },
            {
                'countryCode': 'Martinique',
                'idRepIsoCountryCode': 134,
                'isoCode': 'MQ'
            },
            {
                'countryCode': 'Marshall Islands',
                'idRepIsoCountryCode': 133,
                'isoCode': 'MH'
            },
            {
                'countryCode': 'Malta',
                'idRepIsoCountryCode': 132,
                'isoCode': 'MT'
            },
            {
                'countryCode': 'Mali',
                'idRepIsoCountryCode': 131,
                'isoCode': 'ML'
            },
            {
                'countryCode': 'Maldives',
                'idRepIsoCountryCode': 130,
                'isoCode': 'MV'
            },
            {
                'countryCode': 'Malaysia',
                'idRepIsoCountryCode': 129,
                'isoCode': 'MY'
            },
            {
                'countryCode': 'Malawi',
                'idRepIsoCountryCode': 128,
                'isoCode': 'MW'
            },
            {
                'countryCode': 'Madagascar',
                'idRepIsoCountryCode': 127,
                'isoCode': 'MG'
            },
            {
                'countryCode': 'Macedonia',
                'idRepIsoCountryCode': 126,
                'isoCode': 'MK'
            },
            {
                'countryCode': 'Macau',
                'idRepIsoCountryCode': 125,
                'isoCode': 'MO'
            },
            {
                'countryCode': 'Luxembourg',
                'idRepIsoCountryCode': 124,
                'isoCode': 'LU'
            },
            {
                'countryCode': 'Lithuania',
                'idRepIsoCountryCode': 123,
                'isoCode': 'LT'
            },
            {
                'countryCode': 'Liechtenstein',
                'idRepIsoCountryCode': 122,
                'isoCode': 'LI'
            },
            {
                'countryCode': 'Libyan Arab Jamahiriya',
                'idRepIsoCountryCode': 121,
                'isoCode': 'LY'
            },
            {
                'countryCode': 'Liberia',
                'idRepIsoCountryCode': 120,
                'isoCode': 'LR'
            },
            {
                'countryCode': 'Zimbabwe',
                'idRepIsoCountryCode': 239,
                'isoCode': 'ZW'
            },
            {
                'countryCode': 'Zambia',
                'idRepIsoCountryCode': 238,
                'isoCode': 'ZM'
            },
            {
                'countryCode': 'Zaire',
                'idRepIsoCountryCode': 237,
                'isoCode': 'ZR'
            },
            {
                'countryCode': 'Yemen',
                'idRepIsoCountryCode': 235,
                'isoCode': 'YE'
            },
            {
                'countryCode': 'Sahrawi Arab Democratic Republic',
                'idRepIsoCountryCode': 234,
                'isoCode': 'EH'
            },
            {
                'countryCode': 'Wallis And Futuna Islands',
                'idRepIsoCountryCode': 233,
                'isoCode': 'WF'
            },
            {
                'countryCode': 'Virgin Islands (U.S.)',
                'idRepIsoCountryCode': 232,
                'isoCode': 'VI'
            },
            {
                'countryCode': 'Virgin Islands (British)',
                'idRepIsoCountryCode': 231,
                'isoCode': 'VG'
            },
            {
                'countryCode': 'Viet Nam',
                'idRepIsoCountryCode': 230,
                'isoCode': 'VN'
            },
            {
                'countryCode': 'Venezuela',
                'idRepIsoCountryCode': 229,
                'isoCode': 'VE'
            },
            {
                'countryCode': 'Vatican City State (Holy See)',
                'idRepIsoCountryCode': 228,
                'isoCode': 'VA'
            },
            {
                'countryCode': 'Vanuatu',
                'idRepIsoCountryCode': 227,
                'isoCode': 'VU'
            },
            {
                'countryCode': 'Uzbekistan',
                'idRepIsoCountryCode': 226,
                'isoCode': 'UZ'
            },
            {
                'countryCode': 'Uruguay',
                'idRepIsoCountryCode': 225,
                'isoCode': 'UY'
            },
            {
                'countryCode': 'United States Minor Outlying I',
                'idRepIsoCountryCode': 224,
                'isoCode': 'UM'
            },
            {
                'countryCode': 'United States',
                'idRepIsoCountryCode': 223,
                'isoCode': 'US'
            },
            {
                'countryCode': 'United Kingdom',
                'idRepIsoCountryCode': 222,
                'isoCode': 'GB'
            },
            {
                'countryCode': 'United Arab Emirates',
                'idRepIsoCountryCode': 221,
                'isoCode': 'AE'
            },
            {
                'countryCode': 'Ukraine',
                'idRepIsoCountryCode': 220,
                'isoCode': 'UA'
            },
            {
                'countryCode': 'Uganda',
                'idRepIsoCountryCode': 219,
                'isoCode': 'UG'
            },
            {
                'countryCode': 'Tuvalu',
                'idRepIsoCountryCode': 218,
                'isoCode': 'TV'
            },
            {
                'countryCode': 'Turks And Caicos Islands',
                'idRepIsoCountryCode': 217,
                'isoCode': 'TC'
            },
            {
                'countryCode': 'Turkmenistan',
                'idRepIsoCountryCode': 216,
                'isoCode': 'TM'
            },
            {
                'countryCode': 'Turkey',
                'idRepIsoCountryCode': 215,
                'isoCode': 'TR'
            },
            {
                'countryCode': 'Tunisia',
                'idRepIsoCountryCode': 214,
                'isoCode': 'TN'
            },
            {
                'countryCode': 'Trinidad And Tobago',
                'idRepIsoCountryCode': 213,
                'isoCode': 'TT'
            },
            {
                'countryCode': 'Tonga',
                'idRepIsoCountryCode': 212,
                'isoCode': 'TO'
            },
            {
                'countryCode': 'Tokelau',
                'idRepIsoCountryCode': 211,
                'isoCode': 'TK'
            },
            {
                'countryCode': 'Togo',
                'idRepIsoCountryCode': 210,
                'isoCode': 'TG'
            },
            {
                'countryCode': 'Thailand',
                'idRepIsoCountryCode': 209,
                'isoCode': 'TH'
            },
            {
                'countryCode': 'Tanzania, United Republic Of',
                'idRepIsoCountryCode': 208,
                'isoCode': 'TZ'
            },
            {
                'countryCode': 'Tajikistan',
                'idRepIsoCountryCode': 207,
                'isoCode': 'TJ'
            },
            {
                'countryCode': 'Taiwan, Province Of China',
                'idRepIsoCountryCode': 206,
                'isoCode': 'TW'
            },
            {
                'countryCode': 'Syrian Arab Republic',
                'idRepIsoCountryCode': 205,
                'isoCode': 'SY'
            },
            {
                'countryCode': 'Sweden',
                'idRepIsoCountryCode': 203,
                'isoCode': 'SE'
            },
            {
                'countryCode': 'Swaziland',
                'idRepIsoCountryCode': 202,
                'isoCode': 'SZ'
            },
            {
                'countryCode': 'Svalbard And Jan Mayen Islands',
                'idRepIsoCountryCode': 201,
                'isoCode': 'SJ'
            },
            {
                'countryCode': 'Suriname',
                'idRepIsoCountryCode': 200,
                'isoCode': 'SR'
            },
            {
                'countryCode': 'Sudan',
                'idRepIsoCountryCode': 199,
                'isoCode': 'SD'
            },
            {
                'countryCode': 'St. Pierre And Miquelon',
                'idRepIsoCountryCode': 198,
                'isoCode': 'PM'
            },
            {
                'countryCode': 'St. Helena',
                'idRepIsoCountryCode': 197,
                'isoCode': 'SH'
            },
            {
                'countryCode': 'Sri Lanka',
                'idRepIsoCountryCode': 196,
                'isoCode': 'LK'
            },
            {
                'countryCode': 'Spain',
                'idRepIsoCountryCode': 195,
                'isoCode': 'ES'
            },
            {
                'countryCode': 'South Georgia and the South Sandwich Islands',
                'idRepIsoCountryCode': 194,
                'isoCode': 'GS'
            },
            {
                'countryCode': 'South Africa',
                'idRepIsoCountryCode': 193,
                'isoCode': 'ZA'
            },
            {
                'countryCode': 'Somalia',
                'idRepIsoCountryCode': 192,
                'isoCode': 'SO'
            },
            {
                'countryCode': 'Solomon Islands',
                'idRepIsoCountryCode': 191,
                'isoCode': 'SB'
            },
            {
                'countryCode': 'Slovenia',
                'idRepIsoCountryCode': 190,
                'isoCode': 'SI'
            },
            {
                'countryCode': 'Slovakia',
                'idRepIsoCountryCode': 189,
                'isoCode': 'SK'
            },
            {
                'countryCode': 'Singapore',
                'idRepIsoCountryCode': 188,
                'isoCode': 'SG'
            },
            {
                'countryCode': 'Sierra Leone',
                'idRepIsoCountryCode': 187,
                'isoCode': 'SL'
            },
            {
                'countryCode': 'Seychelles',
                'idRepIsoCountryCode': 186,
                'isoCode': 'SC'
            },
            {
                'countryCode': 'Senegal',
                'idRepIsoCountryCode': 185,
                'isoCode': 'SN'
            },
            {
                'countryCode': 'Saudi Arabia',
                'idRepIsoCountryCode': 184,
                'isoCode': 'SA'
            },
            {
                'countryCode': 'Sao Tome And Principe',
                'idRepIsoCountryCode': 183,
                'isoCode': 'ST'
            },
            {
                'countryCode': 'San Marino',
                'idRepIsoCountryCode': 182,
                'isoCode': 'SM'
            },
            {
                'countryCode': 'Samoa',
                'idRepIsoCountryCode': 181,
                'isoCode': 'WS'
            },
            {
                'countryCode': 'Saint Vincent And The Grenadin',
                'idRepIsoCountryCode': 180,
                'isoCode': 'VC'
            },
            {
                'countryCode': 'Saint Lucia',
                'idRepIsoCountryCode': 179,
                'isoCode': 'LC'
            },
            {
                'countryCode': 'Saint Kitts And Nevis',
                'idRepIsoCountryCode': 178,
                'isoCode': 'KN'
            },
            {
                'countryCode': 'Rwanda',
                'idRepIsoCountryCode': 177,
                'isoCode': 'RW'
            },
            {
                'countryCode': 'Russian Federation',
                'idRepIsoCountryCode': 176,
                'isoCode': 'RU'
            },
            {
                'countryCode': 'Romania',
                'idRepIsoCountryCode': 175,
                'isoCode': 'RO'
            },
            {
                'countryCode': 'Reunion',
                'idRepIsoCountryCode': 174,
                'isoCode': 'RE'
            },
            {
                'countryCode': 'Qatar',
                'idRepIsoCountryCode': 173,
                'isoCode': 'QA'
            },
            {
                'countryCode': 'Puerto Rico',
                'idRepIsoCountryCode': 172,
                'isoCode': 'PR'
            },
            {
                'countryCode': 'Portugal',
                'idRepIsoCountryCode': 171,
                'isoCode': 'PT'
            },
            {
                'countryCode': 'Poland',
                'idRepIsoCountryCode': 170,
                'isoCode': 'PL'
            },
            {
                'countryCode': 'Pitcairn',
                'idRepIsoCountryCode': 169,
                'isoCode': 'PN'
            },
            {
                'countryCode': 'Philippines',
                'idRepIsoCountryCode': 168,
                'isoCode': 'PH'
            },
            {
                'countryCode': 'Peru',
                'idRepIsoCountryCode': 167,
                'isoCode': 'PE'
            },
            {
                'countryCode': 'Paraguay',
                'idRepIsoCountryCode': 166,
                'isoCode': 'PY'
            },
            {
                'countryCode': 'Papua New Guinea',
                'idRepIsoCountryCode': 165,
                'isoCode': 'PG'
            },
            {
                'countryCode': 'Panama',
                'idRepIsoCountryCode': 164,
                'isoCode': 'PA'
            },
            {
                'countryCode': 'Palau',
                'idRepIsoCountryCode': 163,
                'isoCode': 'PW'
            },
            {
                'countryCode': 'Pakistan',
                'idRepIsoCountryCode': 162,
                'isoCode': 'PK'
            },
            {
                'countryCode': 'Oman',
                'idRepIsoCountryCode': 161,
                'isoCode': 'OM'
            },
            {
                'countryCode': 'Norway',
                'idRepIsoCountryCode': 160,
                'isoCode': 'NO'
            },
            {
                'countryCode': 'Northern Mariana Islands',
                'idRepIsoCountryCode': 159,
                'isoCode': 'MP'
            },
            {
                'countryCode': 'Barbados',
                'idRepIsoCountryCode': 19,
                'isoCode': 'BB'
            },
            {
                'countryCode': 'Bangladesh',
                'idRepIsoCountryCode': 18,
                'isoCode': 'BD'
            },
            {
                'countryCode': 'Bahrain',
                'idRepIsoCountryCode': 17,
                'isoCode': 'BH'
            },
            {
                'countryCode': 'Bahamas',
                'idRepIsoCountryCode': 16,
                'isoCode': 'BS'
            },
            {
                'countryCode': 'Azerbaijan',
                'idRepIsoCountryCode': 15,
                'isoCode': 'AZ'
            },
            {
                'countryCode': 'Austria',
                'idRepIsoCountryCode': 14,
                'isoCode': 'AT'
            },
            {
                'countryCode': 'Australia',
                'idRepIsoCountryCode': 13,
                'isoCode': 'AU'
            },
            {
                'countryCode': 'Aruba',
                'idRepIsoCountryCode': 12,
                'isoCode': 'AW'
            },
            {
                'countryCode': 'Armenia',
                'idRepIsoCountryCode': 11,
                'isoCode': 'AM'
            },
            {
                'countryCode': 'Argentina',
                'idRepIsoCountryCode': 10,
                'isoCode': 'AR'
            },
            {
                'countryCode': 'Antigua And Barbuda',
                'idRepIsoCountryCode': 9,
                'isoCode': 'AG'
            },
            {
                'countryCode': 'Antarctica',
                'idRepIsoCountryCode': 8,
                'isoCode': 'AQ'
            },
            {
                'countryCode': 'Anguilla',
                'idRepIsoCountryCode': 7,
                'isoCode': 'AI'
            },
            {
                'countryCode': 'Angola',
                'idRepIsoCountryCode': 6,
                'isoCode': 'AO'
            },
            {
                'countryCode': 'Andorra',
                'idRepIsoCountryCode': 5,
                'isoCode': 'AD'
            },
            {
                'countryCode': 'American Samoa',
                'idRepIsoCountryCode': 4,
                'isoCode': 'AS'
            },
            {
                'countryCode': 'Algeria',
                'idRepIsoCountryCode': 3,
                'isoCode': 'DZ'
            },
            {
                'countryCode': 'Albania',
                'idRepIsoCountryCode': 2,
                'isoCode': 'AL'
            },
            {
                'countryCode': 'Afghanistan',
                'idRepIsoCountryCode': 1,
                'isoCode': 'AF'
            },
            {
                'countryCode': 'Lesotho',
                'idRepIsoCountryCode': 119,
                'isoCode': 'LS'
            },
            {
                'countryCode': 'Lebanon',
                'idRepIsoCountryCode': 118,
                'isoCode': 'LB'
            },
            {
                'countryCode': 'Latvia',
                'idRepIsoCountryCode': 117,
                'isoCode': 'LV'
            },
            {
                'countryCode': 'Lao People´s Democratic Republ',
                'idRepIsoCountryCode': 116,
                'isoCode': 'LA'
            },
            {
                'countryCode': 'Kyrgyzstan',
                'idRepIsoCountryCode': 115,
                'isoCode': 'KG'
            },
            {
                'countryCode': 'Kuwait',
                'idRepIsoCountryCode': 114,
                'isoCode': 'KW'
            },
            {
                'countryCode': 'Korea, Democratic People´s Rep',
                'idRepIsoCountryCode': 113,
                'isoCode': 'KP'
            },
            {
                'countryCode': 'Korea',
                'idRepIsoCountryCode': 112,
                'isoCode': 'KR'
            },
            {
                'countryCode': 'Kiribati',
                'idRepIsoCountryCode': 111,
                'isoCode': 'KI'
            },
            {
                'countryCode': 'Kenya',
                'idRepIsoCountryCode': 110,
                'isoCode': 'KE'
            },
            {
                'countryCode': 'Kazakhstan',
                'idRepIsoCountryCode': 109,
                'isoCode': 'KZ'
            },
            {
                'countryCode': 'Jordan',
                'idRepIsoCountryCode': 108,
                'isoCode': 'JO'
            },
            {
                'countryCode': 'Japan',
                'idRepIsoCountryCode': 107,
                'isoCode': 'JP'
            },
            {
                'countryCode': 'Jamaica',
                'idRepIsoCountryCode': 106,
                'isoCode': 'JM'
            },
            {
                'countryCode': 'Italy',
                'idRepIsoCountryCode': 105,
                'isoCode': 'IT'
            },
            {
                'countryCode': 'Israel',
                'idRepIsoCountryCode': 104,
                'isoCode': 'IL'
            },
            {
                'countryCode': 'Ireland',
                'idRepIsoCountryCode': 103,
                'isoCode': 'IE'
            },
            {
                'countryCode': 'Iraq',
                'idRepIsoCountryCode': 102,
                'isoCode': 'IQ'
            },
            {
                'countryCode': 'Iran',
                'idRepIsoCountryCode': 101,
                'isoCode': 'IR'
            },
            {
                'countryCode': 'Indonesia',
                'idRepIsoCountryCode': 100,
                'isoCode': 'ID'
            },
            {
                'countryCode': 'India',
                'idRepIsoCountryCode': 99,
                'isoCode': 'IN'
            },
            {
                'countryCode': 'Iceland',
                'idRepIsoCountryCode': 98,
                'isoCode': 'IS'
            },
            {
                'countryCode': 'Hungary',
                'idRepIsoCountryCode': 97,
                'isoCode': 'HU'
            },
            {
                'countryCode': 'Hong Kong',
                'idRepIsoCountryCode': 96,
                'isoCode': 'HK'
            },
            {
                'countryCode': 'Honduras',
                'idRepIsoCountryCode': 95,
                'isoCode': 'HN'
            },
            {
                'countryCode': 'Heard And Mc Donald Islands',
                'idRepIsoCountryCode': 94,
                'isoCode': 'HM'
            },
            {
                'countryCode': 'Haiti',
                'idRepIsoCountryCode': 93,
                'isoCode': 'HT'
            },
            {
                'countryCode': 'Guyana',
                'idRepIsoCountryCode': 92,
                'isoCode': 'GY'
            },
            {
                'countryCode': 'Guinea-Bissau',
                'idRepIsoCountryCode': 91,
                'isoCode': 'GW'
            },
            {
                'countryCode': 'Guinea',
                'idRepIsoCountryCode': 90,
                'isoCode': 'GN'
            },
            {
                'countryCode': 'Guatemala',
                'idRepIsoCountryCode': 89,
                'isoCode': 'GT'
            },
            {
                'countryCode': 'Guam',
                'idRepIsoCountryCode': 88,
                'isoCode': 'GU'
            },
            {
                'countryCode': 'Guadeloupe',
                'idRepIsoCountryCode': 87,
                'isoCode': 'GP'
            },
            {
                'countryCode': 'Grenada',
                'idRepIsoCountryCode': 86,
                'isoCode': 'GD'
            },
            {
                'countryCode': 'Greenland',
                'idRepIsoCountryCode': 85,
                'isoCode': 'GL'
            },
            {
                'countryCode': 'Greece',
                'idRepIsoCountryCode': 84,
                'isoCode': 'GR'
            },
            {
                'countryCode': 'Gibraltar',
                'idRepIsoCountryCode': 83,
                'isoCode': 'GI'
            },
            {
                'countryCode': 'Ghana',
                'idRepIsoCountryCode': 82,
                'isoCode': 'GH'
            },
            {
                'countryCode': 'Germany',
                'idRepIsoCountryCode': 81,
                'isoCode': 'DE'
            },
            {
                'countryCode': 'Georgia',
                'idRepIsoCountryCode': 80,
                'isoCode': 'GE'
            },
            {
                'countryCode': 'Gambia',
                'idRepIsoCountryCode': 79,
                'isoCode': 'GM'
            },
            {
                'countryCode': 'Gabon',
                'idRepIsoCountryCode': 78,
                'isoCode': 'GA'
            },
            {
                'countryCode': 'French Southern Territories',
                'idRepIsoCountryCode': 77,
                'isoCode': 'TF'
            },
            {
                'countryCode': 'French Polynesia',
                'idRepIsoCountryCode': 76,
                'isoCode': 'PF'
            },
            {
                'countryCode': 'French Guiana',
                'idRepIsoCountryCode': 75,
                'isoCode': 'GF'
            },
            {
                'countryCode': 'France, Metropolitan',
                'idRepIsoCountryCode': 74,
                'isoCode': 'FX'
            },
            {
                'countryCode': 'France',
                'idRepIsoCountryCode': 73,
                'isoCode': 'FR'
            },
            {
                'countryCode': 'Finland',
                'idRepIsoCountryCode': 72,
                'isoCode': 'FI'
            },
            {
                'countryCode': 'Fiji',
                'idRepIsoCountryCode': 71,
                'isoCode': 'FJ'
            },
            {
                'countryCode': 'Faroe Islands',
                'idRepIsoCountryCode': 70,
                'isoCode': 'FO'
            },
            {
                'countryCode': 'Curaçao',
                'idRepIsoCountryCode': 242,
                'isoCode': 'CW'
            },
            {
                'countryCode': 'Åland Islands',
                'idRepIsoCountryCode': 243,
                'isoCode': 'AX'
            },
            {
                'countryCode': 'Montenegro',
                'idRepIsoCountryCode': 245,
                'isoCode': 'ME'
            },
            {
                'countryCode': 'Serbia',
                'idRepIsoCountryCode': 246,
                'isoCode': 'RS'
            },
            {
                'countryCode': 'Isle of Man',
                'idRepIsoCountryCode': 247,
                'isoCode': 'IM'
            },
            {
                'countryCode': 'Guernsey',
                'idRepIsoCountryCode': 248,
                'isoCode': 'GG'
            },
            {
                'countryCode': 'Jersey',
                'idRepIsoCountryCode': 249,
                'isoCode': 'JE'
            },
            {
                'countryCode': 'State of Palestine',
                'idRepIsoCountryCode': 250,
                'isoCode': 'PS'
            },
            {
                'countryCode': 'Democratic Republic of the Congo',
                'idRepIsoCountryCode': 251,
                'isoCode': 'CD'
            },
            {
                'countryCode': 'Rest Of The World',
                'idRepIsoCountryCode': 240,
                'isoCode': 'RO'
            },
            {
                'countryCode': 'Eurolandia',
                'idRepIsoCountryCode': 241,
                'isoCode': 'EU'
            },
            {
                'countryCode': 'Republic Of Kosovo',
                'idRepIsoCountryCode': 253,
                'isoCode': 'XK'
            },
            {
                'countryCode': 'Ecuador',
                'idRepIsoCountryCode': 62,
                'isoCode': 'EC'
            },
            {
                'countryCode': 'South Sudan',
                'idRepIsoCountryCode': 252,
                'isoCode': 'SS'
            }
        ]
    }
}
