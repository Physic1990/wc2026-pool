// Notable WC 2026 players — used for Golden Boot / Golden Glove / Golden Ball picks
export const WC_PLAYERS = [
  // France
  { name: 'Kylian Mbappé',       team: 'France' },
  { name: 'Antoine Griezmann',   team: 'France' },
  { name: 'Ousmane Dembélé',     team: 'France' },
  { name: 'Marcus Thuram',       team: 'France' },
  { name: 'Mike Maignan',        team: 'France' },
  // Spain
  { name: 'Pedri',               team: 'Spain' },
  { name: 'Lamine Yamal',        team: 'Spain' },
  { name: 'Álvaro Morata',       team: 'Spain' },
  { name: 'Rodri',               team: 'Spain' },
  { name: 'Unai Simón',          team: 'Spain' },
  // Argentina
  { name: 'Lionel Messi',        team: 'Argentina' },
  { name: 'Lautaro Martínez',    team: 'Argentina' },
  { name: 'Julián Álvarez',      team: 'Argentina' },
  { name: 'Enzo Fernández',      team: 'Argentina' },
  // England
  { name: 'Harry Kane',          team: 'England' },
  { name: 'Jude Bellingham',     team: 'England' },
  { name: 'Phil Foden',          team: 'England' },
  { name: 'Bukayo Saka',         team: 'England' },
  { name: 'Jordan Pickford',     team: 'England' },
  // Portugal
  { name: 'Cristiano Ronaldo',   team: 'Portugal' },
  { name: 'Bruno Fernandes',     team: 'Portugal' },
  { name: 'Bernardo Silva',      team: 'Portugal' },
  { name: 'Rafael Leão',         team: 'Portugal' },
  // Netherlands
  { name: 'Virgil van Dijk',     team: 'Netherlands' },
  { name: 'Cody Gakpo',          team: 'Netherlands' },
  { name: 'Memphis Depay',       team: 'Netherlands' },
  { name: 'Xavi Simons',         team: 'Netherlands' },
  // Brazil
  { name: 'Vinícius Jr.',        team: 'Brazil' },
  { name: 'Rodrygo',             team: 'Brazil' },
  { name: 'Raphinha',            team: 'Brazil' },
  { name: 'Endrick',             team: 'Brazil' },
  { name: 'Alisson',             team: 'Brazil' },
  // Morocco
  { name: 'Achraf Hakimi',       team: 'Morocco' },
  { name: 'Hakim Ziyech',        team: 'Morocco' },
  { name: 'Youssef En-Nesyri',   team: 'Morocco' },
  // Belgium
  { name: 'Kevin De Bruyne',     team: 'Belgium' },
  { name: 'Romelu Lukaku',       team: 'Belgium' },
  { name: 'Jeremy Doku',         team: 'Belgium' },
  // Germany
  { name: 'Florian Wirtz',       team: 'Germany' },
  { name: 'Jamal Musiala',       team: 'Germany' },
  { name: 'Kai Havertz',         team: 'Germany' },
  { name: 'Manuel Neuer',        team: 'Germany' },
  // Croatia
  { name: 'Luka Modrić',         team: 'Croatia' },
  { name: 'Ivan Perišić',        team: 'Croatia' },
  { name: 'Andrej Kramarić',     team: 'Croatia' },
  // Colombia
  { name: 'Luis Díaz',           team: 'Colombia' },
  { name: 'James Rodríguez',     team: 'Colombia' },
  { name: 'Falcao',              team: 'Colombia' },
  // Senegal
  { name: 'Sadio Mané',          team: 'Senegal' },
  { name: 'Ismaïla Sarr',        team: 'Senegal' },
  { name: 'Édouard Mendy',       team: 'Senegal' },
  // Mexico
  { name: 'Hirving Lozano',      team: 'Mexico' },
  { name: 'Santiago Giménez',    team: 'Mexico' },
  { name: 'Guillermo Ochoa',     team: 'Mexico' },
  // USA
  { name: 'Christian Pulisic',   team: 'USA' },
  { name: 'Gio Reyna',           team: 'USA' },
  { name: 'Folarin Balogun',     team: 'USA' },
  { name: 'Matt Turner',         team: 'USA' },
  // Uruguay
  { name: 'Darwin Núñez',        team: 'Uruguay' },
  { name: 'Federico Valverde',   team: 'Uruguay' },
  { name: 'Luis Suárez',         team: 'Uruguay' },
  // Japan
  { name: 'Takumi Minamino',     team: 'Japan' },
  { name: 'Kaoru Mitoma',        team: 'Japan' },
  { name: 'Ritsu Doan',          team: 'Japan' },
  // Switzerland
  { name: 'Granit Xhaka',        team: 'Switzerland' },
  { name: 'Xherdan Shaqiri',     team: 'Switzerland' },
  { name: 'Breel Embolo',        team: 'Switzerland' },
  // Norway
  { name: 'Erling Haaland',      team: 'Norway' },
  { name: 'Martin Ødegaard',     team: 'Norway' },
  // Ecuador
  { name: 'Enner Valencia',      team: 'Ecuador' },
  { name: 'Moisés Caicedo',      team: 'Ecuador' },
  // Austria
  { name: 'David Alaba',         team: 'Austria' },
  { name: 'Marcel Sabitzer',     team: 'Austria' },
  // Canada
  { name: 'Alphonso Davies',     team: 'Canada' },
  { name: 'Jonathan David',      team: 'Canada' },
  // Korea Republic
  { name: 'Son Heung-min',       team: 'Korea Republic' },
  { name: 'Lee Kang-in',         team: 'Korea Republic' },
  // Iran
  { name: 'Mehdi Taremi',        team: 'IR Iran' },
  // Australia
  { name: 'Mathew Ryan',         team: 'Australia' },
  { name: 'Mitchell Duke',       team: 'Australia' },
  // Paraguay
  { name: 'Miguel Almirón',      team: 'Paraguay' },
  // Scotland
  { name: 'Andy Robertson',      team: 'Scotland' },
  { name: 'Scott McTominay',     team: 'Scotland' },
  { name: 'Che Adams',           team: 'Scotland' },
  // Sweden
  { name: 'Viktor Gyökeres',     team: 'Sweden' },
  { name: 'Alexander Isak',      team: 'Sweden' },
  // Turkey
  { name: 'Hakan Çalhanoğlu',    team: 'Türkiye' },
  { name: 'Arda Güler',          team: 'Türkiye' },
  // Egypt
  { name: 'Mohamed Salah',       team: 'Egypt' },
  { name: 'Omar Marmoush',       team: 'Egypt' },
  // Algeria
  { name: 'Riyad Mahrez',        team: 'Algeria' },
  { name: 'Islam Slimani',       team: 'Algeria' },
  // Panama
  { name: 'Rolando Blackburn',   team: 'Panama' },
  // Ghana
  { name: 'Jordan Ayew',         team: 'Ghana' },
  { name: 'Thomas Partey',       team: 'Ghana' },
  // Croatia (extra)
  { name: 'Dominik Livaković',   team: 'Croatia' },
  // Czechia
  { name: 'Patrik Schick',       team: 'Czechia' },
  { name: 'Tomáš Souček',        team: 'Czechia' },
  // Bosnia
  { name: 'Edin Džeko',          team: 'Bosnia and Herzegovina' },
  // Uzbekistan
  { name: 'Eldor Shomurodov',    team: 'Uzbekistan' },
  // Qatar
  { name: 'Akram Afif',          team: 'Qatar' },
  // Saudi Arabia
  { name: 'Salem Al-Dawsari',    team: 'Saudi Arabia' },
  // Jordan
  { name: 'Mousa Al-Taamari',    team: 'Jordan' },
  // New Zealand
  { name: 'Chris Wood',          team: 'New Zealand' },
  // Cape Verde
  { name: 'Gelson Fernandes',    team: 'Cabo Verde' },
  // Iraq
  { name: 'Amjed Attwan',        team: 'Iraq' },
  // Curaçao
  { name: 'Cuco Martina',        team: 'Curaçao' },
  // Haiti
  { name: 'Frantzdy Pierrot',    team: 'Haiti' },
  // South Africa
  { name: 'Percy Tau',           team: 'South Africa' },
  // DR Congo
  { name: 'Yannick Bolasie',     team: 'Congo DR' },
  // Tunisia
  { name: 'Wahbi Khazri',        team: 'Tunisia' },
  // Ivory Coast
  { name: 'Sébastien Haller',    team: "Côte d'Ivoire" },
  { name: 'Franck Kessié',       team: "Côte d'Ivoire" },
].sort((a, b) => a.name.localeCompare(b.name))
