const resource = [
  { name: 'Allie Sloan', hasChild: false, isFile: true },
  { name: 'Bender Stephens', hasChild: false, isFile: true },
  { name: 'Celeste Lambert', hasChild: true, isFile: true },
  { name: 'Conrad English', hasChild: true, isFile: true },
  { name: 'Dillon West', hasChild: false, isFile: true },
  { name: 'Hancock Abbott', hasChild: true, isFile: true },
  { name: 'Jeri Jordan', hasChild: false, isFile: true },
  { name: 'Lillian Gilmore', hasChild: false, isFile: true },
  { name: 'Lily Cline', hasChild: false, isFile: true },
  { name: 'Lucia Butler', hasChild: false, isFile: true },
  { name: 'Lucile Gutierrez', hasChild: true, isFile: true },
  { name: 'Minerva Key', hasChild: false, isFile: true },
  { name: 'Odessa Harris', hasChild: false, isFile: true },
  { name: 'Olivia Burke', hasChild: false, isFile: true },
  { name: 'Pennington Adkins', hasChild: false, isFile: true },
  { name: 'Rhea Booker', hasChild: false, isFile: true },
  { name: 'Rosalie Buck', hasChild: true, isFile: true },
  { name: 'Sanders Cain', hasChild: true, isFile: true },
  { name: 'Santiago Sawyer', hasChild: true, isFile: true },
  { name: 'Summers Thomas', hasChild: false, isFile: true },
  { name: 'Tia Duran', hasChild: true, isFile: true },
  { name: 'Tyler Lyons', hasChild: false, isFile: true },
  { name: 'Whitehead Stanton', hasChild: true, isFile: true },
  { name: 'Wong Brennan', hasChild: true, isFile: true },
  { name: 'Araceli Rosario', hasChild: false, isFile: false },
  { name: 'Barber Davis', hasChild: true, isFile: false },
  { name: 'Bolton Brewer', hasChild: true, isFile: false },
  { name: 'Carole Barton', hasChild: true, isFile: false },
  { name: 'Christian Hurst', hasChild: false, isFile: false },
  { name: 'Consuelo Bullock', hasChild: false, isFile: false },
  { name: 'Eve Copeland', hasChild: false, isFile: false },
  { name: 'Freeman Cobb', hasChild: true, isFile: false },
  { name: 'Gardner Little', hasChild: true, isFile: false },
  { name: 'Genevieve Sampson', hasChild: true, isFile: false },
  { name: 'Glass Nieves', hasChild: false, isFile: false },
  { name: 'Grace Aguilar', hasChild: false, isFile: false },
  { name: 'Hamilton Donovan', hasChild: false, isFile: false },
  { name: 'Hernandez Wagner', hasChild: false, isFile: false },
  { name: 'Herring Odonnell', hasChild: false, isFile: false },
  { name: 'Hess Nelson', hasChild: true, isFile: false },
  { name: 'Jasmine Herring', hasChild: false, isFile: false },
  { name: 'Jeannette Bentley', hasChild: false, isFile: false },
  { name: 'Josefa Pratt', hasChild: true, isFile: false },
  { name: 'Langley Norman', hasChild: false, isFile: false },
  { name: 'Leanna Whitney', hasChild: false, isFile: false },
  { name: 'Marjorie Berry', hasChild: false, isFile: false },
  { name: 'Medina Haynes', hasChild: true, isFile: false },
  { name: 'Melinda Walsh', hasChild: false, isFile: false },
  { name: 'Merritt Dillon', hasChild: false, isFile: false },
  { name: 'Meyer Carpenter', hasChild: false, isFile: false },
  { name: 'Moore George', hasChild: true, isFile: false },
  { name: 'Myers Floyd', hasChild: false, isFile: false },
  { name: 'Olive Herman', hasChild: false, isFile: false },
  { name: 'Oliver Baird', hasChild: false, isFile: false },
  { name: 'Ortega Berg', hasChild: true, isFile: false },
  { name: 'Rhodes Gomez', hasChild: false, isFile: false },
  { name: 'Roy Gibbs', hasChild: false, isFile: false },
  { name: 'Sanchez Case', hasChild: true, isFile: false },
  { name: 'Serena Landry', hasChild: false, isFile: false },
  { name: 'Spence Peterson', hasChild: false, isFile: false },
  { name: 'Stacie Hall', hasChild: false, isFile: false },
  { name: 'Stanton Emerson', hasChild: true, isFile: false },
  { name: 'Summer Singleton', hasChild: false, isFile: false },
  { name: 'Tami Britt', hasChild: true, isFile: false },
  { name: 'Tricia Lopez', hasChild: false, isFile: false },
  { name: 'Winnie Osborn', hasChild: true, isFile: false },
];

const treeSource = [
  {
    id: '5d43daf4d939bc4d7c483d3b',
    value: 'Baird Rivera',
    children: [
      {
        id: '5d43daf4d5a78ca510a8f596',
        value: 'Hodge Chang',
        children: [
          {
            id: '5d43daf47eca62b5e248e2a8',
            value: 'Billie Perry',
          },
          {
            id: '5d43daf4458a1fd49de537c2',
            value: 'Lowe Sykes',
          },
          {
            id: '5d43daf4c3ef39c80c8db5ec',
            value: 'Terry Ochoa',
          },
          {
            id: '5d43daf4c8cd373423ca525b',
            value: 'Christie Haynes',
          },
          {
            id: '5d43daf46e011eed7d295f9b',
            value: 'Martin Ball',
          },
          {
            id: '5d43daf45a524b13aa8632a1',
            value: 'Sargent Avila',
          },
          {
            id: '5d43daf4e8b41608a7a7e738',
            value: 'Short Wilkins',
          },
        ],
      },
      {
        id: '5d43daf42501a6432b954941',
        value: 'Holder Gallegos',
        children: [
          {
            id: '5d43daf4c5bddc6a1f6b91fd',
            value: 'Carter Bright',
          },
          {
            id: '5d43daf4ebfc98cb89b5240e',
            value: 'Weber French',
          },
          {
            id: '5d43daf42ef740179cf9fcc6',
            value: 'Poole Klein',
          },
          {
            id: '5d43daf489418604abc656c6',
            value: 'Wall Hinton',
          },
          {
            id: '5d43daf4e06c6d021eb1bb52',
            value: 'Haney Mooney',
          },
          {
            id: '5d43daf4cfd5b5619a841633',
            value: 'Nell Garner',
          },
        ],
      },
      {
        id: '5d43daf49cdf6078cc97b866',
        value: 'Benita Maxwell',
        children: [
          {
            id: '5d43daf4288fd0c81c58d99c',
            value: 'Jeanne Meyer',
          },
          {
            id: '5d43daf4488af315276a1794',
            value: 'Park Patel',
          },
          {
            id: '5d43daf4e5a6db07dc0745f6',
            value: 'Sandy Gamble',
          },
          {
            id: '5d43daf4878a790c6f439bd0',
            value: 'Leigh Meadows',
          },
          {
            id: '5d43daf4da4da5d82f5b97e5',
            value: 'Enid Dickerson',
          },
        ],
      },
      {
        id: '5d43daf4482f4eb7364091ba',
        value: 'Ines Collins',
        children: [
          {
            id: '5d43daf45b5188cef35e44bd',
            value: 'Luz Martin',
          },
          {
            id: '5d43daf44410be5c51ada292',
            value: 'Tanisha Sweeney',
          },
          {
            id: '5d43daf4d179ce8d18823162',
            value: 'Robinson Quinn',
          },
          {
            id: '5d43daf49dd94c4edf6b74d1',
            value: 'Avis Nicholson',
          },
          {
            id: '5d43daf40f096052d5ecd43a',
            value: 'Sophie Herman',
          },
          {
            id: '5d43daf4d511743f1eb179e7',
            value: 'Janet Hodges',
          },
          {
            id: '5d43daf4a05ec2913fb654b1',
            value: 'Horne Alvarez',
          },
        ],
      },
      {
        id: '5d43daf401355e4cef13fb36',
        value: 'Isabella Walter',
        children: [
          {
            id: '5d43daf451f5b79a150b502d',
            value: 'Sandra Rose',
          },
          {
            id: '5d43daf48220e36b677692b6',
            value: 'Cathy Mcmillan',
          },
          {
            id: '5d43daf4413607822add065c',
            value: 'Nannie Odonnell',
          },
          {
            id: '5d43daf472db51ae366920c6',
            value: 'Herring Gentry',
          },
          {
            id: '5d43daf4ae6b1b7637edfac8',
            value: 'Strong Gomez',
          },
          {
            id: '5d43daf401c57e2a22058d0d',
            value: 'Bell Paul',
          },
          {
            id: '5d43daf44a0f3225d954449c',
            value: 'Fields Lancaster',
          },
        ],
      },
      {
        id: '5d43daf4dc1d5ae526e3e059',
        value: 'Reva Owen',
        children: [
          {
            id: '5d43daf4591971811f01514e',
            value: 'Schmidt Stevenson',
          },
          {
            id: '5d43daf4b8b5d133b9a32fab',
            value: 'Rena Marks',
          },
          {
            id: '5d43daf413ab0902f5695b1e',
            value: 'Glenn Goodwin',
          },
          {
            id: '5d43daf45d88528c17062b38',
            value: 'Erin Espinoza',
          },
          {
            id: '5d43daf4805ebb6b2a1cf888',
            value: 'Barrett Flynn',
          },
        ],
      },
      {
        id: '5d43daf48f6fab3cf17cf3b6',
        value: 'Shannon Gould',
        children: [
          {
            id: '5d43daf4125be8593cbf5d85',
            value: 'Elena Ballard',
          },
          {
            id: '5d43daf431d4e60c949d2d58',
            value: 'Bates Taylor',
          },
          {
            id: '5d43daf437aa5732200ba341',
            value: 'Morton Simon',
          },
          {
            id: '5d43daf4a3b62ef761aca39c',
            value: 'Loraine Mclaughlin',
          },
          {
            id: '5d43daf4e873ddd2aa7e87f9',
            value: 'Chang Lucas',
          },
          {
            id: '5d43daf4fe66af6fc508c3cb',
            value: 'Lambert Steele',
          },
        ],
      },
    ],
  },
  {
    id: '5d43daf4163a11248ce2a8cc',
    value: 'Ware Bell',
    children: [
      {
        id: '5d43daf41333a0c922dbede1',
        value: 'Eugenia Fields',
        children: [
          {
            id: '5d43daf486f735c80e618199',
            value: 'Acosta Mullen',
          },
          {
            id: '5d43daf43c16b93dc2af4384',
            value: 'Ramsey Pena',
          },
          {
            id: '5d43daf4992346b02e375ec8',
            value: 'Delores Cooper',
          },
          {
            id: '5d43daf4a5dadf5dc393d9c8',
            value: 'Alissa Spears',
          },
          {
            id: '5d43daf482136347f1b2b1de',
            value: 'Mitzi Hogan',
          },
          {
            id: '5d43daf40053eb1e951d1deb',
            value: 'Odessa Rhodes',
          },
        ],
      },
      {
        id: '5d43daf43fc74c0ca8bc0faa',
        value: 'Maria Byers',
        children: [
          {
            id: '5d43daf4b16ef246383cde7d',
            value: 'Livingston Meyers',
          },
          {
            id: '5d43daf46bf4d081bb07dc4a',
            value: 'Louisa Hopkins',
          },
          {
            id: '5d43daf4c43a453def0b8be0',
            value: 'Hamilton Brewer',
          },
          {
            id: '5d43daf405e2f019826f6183',
            value: 'Caitlin Rodriquez',
          },
          {
            id: '5d43daf4bf41aa046e9172cb',
            value: 'Rosalie Stephens',
          },
          {
            id: '5d43daf4a51348c7e9f5ffda',
            value: 'Kirkland Mathis',
          },
          {
            id: '5d43daf45db492fcd19c7272',
            value: 'Lesley Lynn',
          },
        ],
      },
      {
        id: '5d43daf4231db702cb729643',
        value: 'Chan Morgan',
        children: [
          {
            id: '5d43daf4feab07712b74050a',
            value: 'Jerri Kirkland',
          },
          {
            id: '5d43daf4fd9ddc70c8ef5ed3',
            value: 'Holloway Garza',
          },
          {
            id: '5d43daf4f3a28f815bfde602',
            value: 'Romero Leblanc',
          },
          {
            id: '5d43daf463e52f0c354c48f9',
            value: 'Maricela Bullock',
          },
          {
            id: '5d43daf4a538560eae873ef6',
            value: 'Mattie Fletcher',
          },
        ],
      },
      {
        id: '5d43daf4ae64d3bafea6d652',
        value: 'Lidia Hammond',
        children: [
          {
            id: '5d43daf4f6e5d18d09910fcf',
            value: 'Keri Marsh',
          },
          {
            id: '5d43daf451de2b1b71e66c35',
            value: 'Mcmillan Mosley',
          },
          {
            id: '5d43daf4306490a26ba0eb20',
            value: 'Noble Albert',
          },
          {
            id: '5d43daf46c1bf8edf42f1744',
            value: 'Earline Collier',
          },
          {
            id: '5d43daf41066b69c3de23961',
            value: 'Rhoda Duke',
          },
          {
            id: '5d43daf49b29a33a3f7cb9ec',
            value: 'Whitney Atkinson',
          },
        ],
      },
      {
        id: '5d43daf4dfd33dc55f8f18ed',
        value: 'Dejesus Haley',
        children: [
          {
            id: '5d43daf473e87f86653a8c6a',
            value: 'Misty Avery',
          },
          {
            id: '5d43daf45aed67e52bd0d834',
            value: 'Gamble Lowe',
          },
          {
            id: '5d43daf4e8dfeca554e48691',
            value: 'Holman Todd',
          },
          {
            id: '5d43daf495a0ab413d6948ac',
            value: 'Lewis Baker',
          },
          {
            id: '5d43daf44ede5a6b9194a659',
            value: 'Lopez Holcomb',
          },
          {
            id: '5d43daf43e53d5693fe22010',
            value: 'Katelyn Thomas',
          },
          {
            id: '5d43daf41d11a708caad9c82',
            value: 'Sheppard Atkins',
          },
        ],
      },
      {
        id: '5d43daf41ce07725b41884a2',
        value: 'Gomez Spence',
        children: [
          {
            id: '5d43daf4ea97dc2d339426e5',
            value: 'Jamie Burch',
          },
          {
            id: '5d43daf4170df563236803ae',
            value: 'Crosby Murray',
          },
          {
            id: '5d43daf47e2e4e029cf13468',
            value: 'Blankenship Alexander',
          },
          {
            id: '5d43daf4886ad9d2e976c8a3',
            value: 'Leta Lee',
          },
          {
            id: '5d43daf490263229db56e97a',
            value: 'Maynard Acevedo',
          },
          {
            id: '5d43daf4e47be30e6969d5a8',
            value: 'Howell Santos',
          },
          {
            id: '5d43daf4593092a27dae48e5',
            value: 'Tamra Henry',
          },
        ],
      },
    ],
  },
];

export { resource, treeSource };
