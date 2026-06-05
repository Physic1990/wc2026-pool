// WC 2026 notable players with position (GK = goalkeeper, F = forward/midfielder)
// Updated via Admin → Fetch Squads when API data is available
export const WC_PLAYERS = [
  // France
  { name: 'Kylian Mbappé',       team: 'France',      pos: 'F' },
  { name: 'Antoine Griezmann',   team: 'France',      pos: 'F' },
  { name: 'Ousmane Dembélé',     team: 'France',      pos: 'F' },
  { name: 'Marcus Thuram',       team: 'France',      pos: 'F' },
  { name: 'Mike Maignan',        team: 'France',      pos: 'GK' },
  // Spain
  { name: 'Pedri',               team: 'Spain',       pos: 'F' },
  { name: 'Lamine Yamal',        team: 'Spain',       pos: 'F' },
  { name: 'Álvaro Morata',       team: 'Spain',       pos: 'F' },
  { name: 'Rodri',               team: 'Spain',       pos: 'F' },
  { name: 'Unai Simón',          team: 'Spain',       pos: 'GK' },
  // Argentina
  { name: 'Lionel Messi',        team: 'Argentina',   pos: 'F' },
  { name: 'Lautaro Martínez',    team: 'Argentina',   pos: 'F' },
  { name: 'Julián Álvarez',      team: 'Argentina',   pos: 'F' },
  { name: 'Enzo Fernández',      team: 'Argentina',   pos: 'F' },
  { name: 'Emiliano Martínez',   team: 'Argentina',   pos: 'GK' },
  // England
  { name: 'Harry Kane',          team: 'England',     pos: 'F' },
  { name: 'Jude Bellingham',     team: 'England',     pos: 'F' },
  { name: 'Phil Foden',          team: 'England',     pos: 'F' },
  { name: 'Bukayo Saka',         team: 'England',     pos: 'F' },
  { name: 'Jordan Pickford',     team: 'England',     pos: 'GK' },
  // Portugal
  { name: 'Cristiano Ronaldo',   team: 'Portugal',    pos: 'F' },
  { name: 'Bruno Fernandes',     team: 'Portugal',    pos: 'F' },
  { name: 'Bernardo Silva',      team: 'Portugal',    pos: 'F' },
  { name: 'Rafael Leão',         team: 'Portugal',    pos: 'F' },
  { name: 'Rui Patrício',        team: 'Portugal',    pos: 'GK' },
  // Netherlands
  { name: 'Virgil van Dijk',     team: 'Netherlands', pos: 'F' },
  { name: 'Cody Gakpo',          team: 'Netherlands', pos: 'F' },
  { name: 'Memphis Depay',       team: 'Netherlands', pos: 'F' },
  { name: 'Xavi Simons',         team: 'Netherlands', pos: 'F' },
  { name: 'Bart Verbruggen',     team: 'Netherlands', pos: 'GK' },
  // Brazil
  { name: 'Vinícius Jr.',        team: 'Brazil',      pos: 'F' },
  { name: 'Rodrygo',             team: 'Brazil',      pos: 'F' },
  { name: 'Raphinha',            team: 'Brazil',      pos: 'F' },
  { name: 'Endrick',             team: 'Brazil',      pos: 'F' },
  { name: 'Alisson',             team: 'Brazil',      pos: 'GK' },
  // Morocco
  { name: 'Achraf Hakimi',       team: 'Morocco',     pos: 'F' },
  { name: 'Hakim Ziyech',        team: 'Morocco',     pos: 'F' },
  { name: 'Youssef En-Nesyri',   team: 'Morocco',     pos: 'F' },
  { name: 'Yassine Bounou',      team: 'Morocco',     pos: 'GK' },
  // Belgium
  { name: 'Kevin De Bruyne',     team: 'Belgium',     pos: 'F' },
  { name: 'Romelu Lukaku',       team: 'Belgium',     pos: 'F' },
  { name: 'Jeremy Doku',         team: 'Belgium',     pos: 'F' },
  { name: 'Koen Casteels',       team: 'Belgium',     pos: 'GK' },
  // Germany
  { name: 'Florian Wirtz',       team: 'Germany',     pos: 'F' },
  { name: 'Jamal Musiala',       team: 'Germany',     pos: 'F' },
  { name: 'Kai Havertz',         team: 'Germany',     pos: 'F' },
  { name: 'Manuel Neuer',        team: 'Germany',     pos: 'GK' },
  // Croatia
  { name: 'Luka Modrić',         team: 'Croatia',     pos: 'F' },
  { name: 'Ivan Perišić',        team: 'Croatia',     pos: 'F' },
  { name: 'Andrej Kramarić',     team: 'Croatia',     pos: 'F' },
  { name: 'Dominik Livaković',   team: 'Croatia',     pos: 'GK' },
  // Colombia
  { name: 'Luis Díaz',           team: 'Colombia',    pos: 'F' },
  { name: 'James Rodríguez',     team: 'Colombia',    pos: 'F' },
  { name: 'Jhon Córdoba',        team: 'Colombia',    pos: 'F' },
  { name: 'Camilo Vargas',       team: 'Colombia',    pos: 'GK' },
  // Senegal
  { name: 'Sadio Mané',          team: 'Senegal',     pos: 'F' },
  { name: 'Ismaïla Sarr',        team: 'Senegal',     pos: 'F' },
  { name: 'Édouard Mendy',       team: 'Senegal',     pos: 'GK' },
  // Mexico
  { name: 'Hirving Lozano',      team: 'Mexico',      pos: 'F' },
  { name: 'Santiago Giménez',    team: 'Mexico',      pos: 'F' },
  { name: 'Guillermo Ochoa',     team: 'Mexico',      pos: 'GK' },
  // USA
  { name: 'Christian Pulisic',   team: 'USA',         pos: 'F' },
  { name: 'Gio Reyna',           team: 'USA',         pos: 'F' },
  { name: 'Folarin Balogun',     team: 'USA',         pos: 'F' },
  { name: 'Matt Turner',         team: 'USA',         pos: 'GK' },
  // Uruguay
  { name: 'Darwin Núñez',        team: 'Uruguay',     pos: 'F' },
  { name: 'Federico Valverde',   team: 'Uruguay',     pos: 'F' },
  { name: 'Sebastián Coates',    team: 'Uruguay',     pos: 'F' },
  { name: 'Sergio Rochet',       team: 'Uruguay',     pos: 'GK' },
  // Japan
  { name: 'Kaoru Mitoma',        team: 'Japan',       pos: 'F' },
  { name: 'Takumi Minamino',     team: 'Japan',       pos: 'F' },
  { name: 'Ritsu Doan',          team: 'Japan',       pos: 'F' },
  { name: 'Shuichi Gonda',       team: 'Japan',       pos: 'GK' },
  // Switzerland
  { name: 'Granit Xhaka',        team: 'Switzerland', pos: 'F' },
  { name: 'Breel Embolo',        team: 'Switzerland', pos: 'F' },
  { name: 'Yann Sommer',         team: 'Switzerland', pos: 'GK' },
  // Norway
  { name: 'Erling Haaland',      team: 'Norway',      pos: 'F' },
  { name: 'Martin Ødegaard',     team: 'Norway',      pos: 'F' },
  { name: 'Ørjan Nyland',        team: 'Norway',      pos: 'GK' },
  // Ecuador
  { name: 'Enner Valencia',      team: 'Ecuador',     pos: 'F' },
  { name: 'Moisés Caicedo',      team: 'Ecuador',     pos: 'F' },
  { name: 'Hernán Galíndez',     team: 'Ecuador',     pos: 'GK' },
  // Austria
  { name: 'Marcel Sabitzer',     team: 'Austria',     pos: 'F' },
  { name: 'Christoph Baumgartner', team: 'Austria',   pos: 'F' },
  { name: 'Patrick Pentz',       team: 'Austria',     pos: 'GK' },
  // Canada
  { name: 'Alphonso Davies',     team: 'Canada',      pos: 'F' },
  { name: 'Jonathan David',      team: 'Canada',      pos: 'F' },
  { name: 'Milan Borjan',        team: 'Canada',      pos: 'GK' },
  // Sweden
  { name: 'Viktor Gyökeres',     team: 'Sweden',      pos: 'F' },
  { name: 'Alexander Isak',      team: 'Sweden',      pos: 'F' },
  { name: 'Robin Olsen',         team: 'Sweden',      pos: 'GK' },
  // Turkey
  { name: 'Hakan Çalhanoğlu',    team: 'Türkiye',     pos: 'F' },
  { name: 'Arda Güler',          team: 'Türkiye',     pos: 'F' },
  { name: 'Mert Günok',          team: 'Türkiye',     pos: 'GK' },
  // Korea Republic
  { name: 'Son Heung-min',       team: 'Korea Republic', pos: 'F' },
  { name: 'Lee Kang-in',         team: 'Korea Republic', pos: 'F' },
  { name: 'Kim Seung-gyu',       team: 'Korea Republic', pos: 'GK' },
  // Australia
  { name: 'Mitchell Duke',       team: 'Australia',   pos: 'F' },
  { name: 'Mat Leckie',          team: 'Australia',   pos: 'F' },
  { name: 'Mathew Ryan',         team: 'Australia',   pos: 'GK' },
  // Iran
  { name: 'Mehdi Taremi',        team: 'IR Iran',     pos: 'F' },
  { name: 'Alireza Jahanbakhsh', team: 'IR Iran',     pos: 'F' },
  { name: 'Alireza Beiranvand',  team: 'IR Iran',     pos: 'GK' },
  // Paraguay
  { name: 'Miguel Almirón',      team: 'Paraguay',    pos: 'F' },
  { name: 'Antony Silva',        team: 'Paraguay',    pos: 'GK' },
  // Scotland
  { name: 'Andy Robertson',      team: 'Scotland',    pos: 'F' },
  { name: 'Scott McTominay',     team: 'Scotland',    pos: 'F' },
  { name: 'Angus Gunn',          team: 'Scotland',    pos: 'GK' },
  // Egypt
  { name: 'Mohamed Salah',       team: 'Egypt',       pos: 'F' },
  { name: 'Omar Marmoush',       team: 'Egypt',       pos: 'F' },
  { name: 'Mohamed El-Shenawy',  team: 'Egypt',       pos: 'GK' },
  // Algeria
  { name: 'Riyad Mahrez',        team: 'Algeria',     pos: 'F' },
  { name: 'Islam Slimani',       team: 'Algeria',     pos: 'F' },
  { name: 'Raïs M\'Bolhi',       team: 'Algeria',     pos: 'GK' },
  // Czechia
  { name: 'Patrik Schick',       team: 'Czechia',     pos: 'F' },
  { name: 'Tomáš Souček',        team: 'Czechia',     pos: 'F' },
  { name: 'Jiří Pavlenka',       team: 'Czechia',     pos: 'GK' },
  // Bosnia
  { name: 'Edin Džeko',          team: 'Bosnia and Herzegovina', pos: 'F' },
  { name: 'Jasmin Handanović',   team: 'Bosnia and Herzegovina', pos: 'GK' },
  // Ghana
  { name: 'Thomas Partey',       team: 'Ghana',       pos: 'F' },
  { name: 'Jordan Ayew',         team: 'Ghana',       pos: 'F' },
  { name: 'Lawrence Ati-Zigi',   team: 'Ghana',       pos: 'GK' },
  // Tunisia
  { name: 'Wahbi Khazri',        team: 'Tunisia',     pos: 'F' },
  { name: 'Aymen Dahmen',        team: 'Tunisia',     pos: 'GK' },
  // Ivory Coast
  { name: 'Sébastien Haller',    team: "Côte d'Ivoire", pos: 'F' },
  { name: 'Franck Kessié',       team: "Côte d'Ivoire", pos: 'F' },
  { name: 'Yahia Fofana',        team: "Côte d'Ivoire", pos: 'GK' },
  // Uzbekistan
  { name: 'Eldor Shomurodov',    team: 'Uzbekistan',  pos: 'F' },
  { name: 'Hamza Karimov',       team: 'Uzbekistan',  pos: 'GK' },
  // Qatar
  { name: 'Akram Afif',          team: 'Qatar',       pos: 'F' },
  { name: 'Meshaal Barsham',     team: 'Qatar',       pos: 'GK' },
  // Saudi Arabia
  { name: 'Salem Al-Dawsari',    team: 'Saudi Arabia', pos: 'F' },
  { name: 'Mohammed Al-Owais',   team: 'Saudi Arabia', pos: 'GK' },
  // Panama
  { name: 'Rolando Blackburn',   team: 'Panama',      pos: 'F' },
  { name: 'Luis Mejía',          team: 'Panama',      pos: 'GK' },
  // New Zealand
  { name: 'Chris Wood',          team: 'New Zealand', pos: 'F' },
  { name: 'Oliver Sail',         team: 'New Zealand', pos: 'GK' },
  // Jordan
  { name: 'Mousa Al-Taamari',    team: 'Jordan',      pos: 'F' },
  { name: 'Amer Shafi',          team: 'Jordan',      pos: 'GK' },
  // Iraq
  { name: 'Amjed Attwan',        team: 'Iraq',        pos: 'F' },
  { name: 'Jalal Hassan',        team: 'Iraq',        pos: 'GK' },
  // Cabo Verde
  { name: 'Garry Rodrigues',     team: 'Cabo Verde',  pos: 'F' },
  { name: 'Vozinha',             team: 'Cabo Verde',  pos: 'GK' },
  // South Africa
  { name: 'Percy Tau',           team: 'South Africa', pos: 'F' },
  { name: 'Ronwen Williams',     team: 'South Africa', pos: 'GK' },
  // DR Congo
  { name: 'Yannick Bolasie',     team: 'Congo DR',    pos: 'F' },
  { name: 'Joël Kiassumbua',     team: 'Congo DR',    pos: 'GK' },
  // Curaçao
  { name: 'Leandro Bacuna',      team: 'Curaçao',     pos: 'F' },
  { name: 'Eloy Room',           team: 'Curaçao',     pos: 'GK' },
  // Haiti
  { name: 'Frantzdy Pierrot',    team: 'Haiti',       pos: 'F' },
  { name: 'Josué Duverger',      team: 'Haiti',       pos: 'GK' },
].sort((a, b) => a.name.localeCompare(b.name))

export const GOALKEEPERS = WC_PLAYERS.filter(p => p.pos === 'GK')
export const OUTFIELD_PLAYERS = WC_PLAYERS.filter(p => p.pos !== 'GK')
