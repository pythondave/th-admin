// *** IMPORTANT ***
//This file should be included in the PROTOTYPE ONLY.
//In theory it acts as the server in the absence of the server. It is a mock server.
// *** ********* ***

app.factory('delayResponseInterceptor', function($q, $timeout, config) {
  //Can be used to delay all mock responses by a typical (and occasionally atypical) random amount, or fail entirely at a certain rate
  var serverSpeedMultiplier = _.firstDefined(config.serverSpeedMultiplierOverride, config.requests.serverSpeedMultiplier, 1); //reduce during dev so things work faster (say 0.2), increase (to say 1) when demoing
  config.local = { //configure special values for particular requests here
    //delayLengthMultiplier: standard random server response delay will be multiplied by this (e.g. for requests which are normally longer, say)
    //errorRate: 0: no errors; 1 error every time;
    logRequestsToConsole: false, //change to true to monitor server requests in the console window
    attributeDefaults: { delayLengthMultiplier: 1, errorRate: 0 }, //these will be used if no specific value is found
    '/admin/service/teachers': { delayLengthMultiplier: 2 }, //will takes twice as long (on average)
    '/admin/service/process-teacher': { delayLengthMultiplier: 4, errorRate: 0.05 },
    '/admin/service/process-application': { delayLengthMultiplier: 4, errorRate: 0.05 }
  };
  var getConfigValue = function(requestUrl, attributeName, defaultValue) { //use to ease the process of getting config values
    defaultValue = defaultValue || config.local.attributeDefaults[attributeName];
    if (!config.local[requestUrl]) return defaultValue;
    if (!config.local[requestUrl][attributeName]) return defaultValue;
    return config.local[requestUrl][attributeName];
  };
  var randomLogNormalValue = function(mu, sigma) { //server responses can be roughly modelled by a lognormal distribution
    var z1 = Math.sqrt(-2 * Math.log(1.0 - Math.random())) * Math.sin(2 * Math.PI * Math.random());
    return Math.exp(mu + sigma * z1);
  };
  var getStandardRandomServerResponseDelayLength = function() { //returns a random integer
    var randomInteger = Math.round(1000*randomLogNormalValue(-1.2, 0.5)); //typically 100-1000, occasionally 50-100 or 1000-1700
    return randomInteger * serverSpeedMultiplier;
  };
  var logSampleStandardRandomServerResponseDelayLengths = function(n) { //used for experimentally working out good values for mu and sigma
    var a = [];
    for (var i=0; i<100; i++) {
      a.push(getStandardRandomServerResponseDelayLength());
    }
    a.sort(function(a, b) { return a-b; });
    console.log(a);
  };
  var getRandomServerResponseDelayLengthForRequestUrl = function(requestUrl) { //return a ramdom delay for a given request
    var delayLengthMultiplier = getConfigValue(requestUrl, 'delayLengthMultiplier');
    var delay = getStandardRandomServerResponseDelayLength() * delayLengthMultiplier;
    return delay;
  };
  var delay = function(lengthInMilliSeconds) { //promise which resolves after a delay
    var deferred = $q.defer();
    $timeout(deferred.resolve, lengthInMilliSeconds);
    return deferred.promise;
  };
  var delayedHttpRequest = function(httpRequest) { //takes an httpRequest promise and returns it, delayed by an amount appropriate for that request type
    //note that we need to resolve the httpRequest twice - once to get the url (to get related config values), and then again after the delay
    var responseInfo;
    var getResponseInfo = function(response) {
      if (config.local.logRequestsToConsole && response.config.method === 'POST') {
        console.log('SERVER REQUEST: ', response.config.url, 'PARAMS: ', response.config.data);
      }
      responseInfo = response;
      return httpRequest; //use the same promise
    };
    var delayForRandomDuration = function() {
      var delayLength = getRandomServerResponseDelayLengthForRequestUrl(responseInfo.config.url);
      return delay(delayLength);
    };
    var getHttpRequest = function() {
      var errorRate = getConfigValue(responseInfo.config.url, 'errorRate');
      if (Math.random() < errorRate) { return $q.reject(); } //randomly error according to the errorRate
      return httpRequest;
    };
    return httpRequest.then(getResponseInfo).then(delayForRandomDuration).then(getHttpRequest);
  };

  return delayedHttpRequest;
});

//add the above factory to the responseInterceptors - this calls 'delayedHttpRequest' during every http request
app.config(function($httpProvider) {
  $httpProvider.responseInterceptors.unshift('delayResponseInterceptor');
});

app.factory('serverListsService', function() {
  var o = {};
  o.forenames = ['Terry', 'Terry', 'Terrance', 'Stern', 'Asterix', 'Abbie', 'Adele','Adelina','Alberta','Ali','Aliza','Alleen','Anastacia','Angelic','Angelo','Apryl','Ardelle','Arianna','Arianne','Ashlyn','Assunta','Bari','Belkis','Bell','Bobbi','Brianna','Britta','Brittney','Candice','Candyce','Carlota','Carmen','Celesta','Celia','Chrissy','Christena','Claire','Cristie','Cythia','Dario','Darline','Darren','Dave','Davis','Dawn','Daysi','Deanne','Debi','Denese','Dennise','Dewitt','Diedra','Dillon','Domenica','Eboni','Ellena','Elmo','Elvina','Emma','Emmanuel','Erminia','Ernestina','Flossie','Frances','Francoise','Fredrick','Garnet','Gilbert','Gilda','Gloria','Hershel','Imogene','Ina','Inge','Isabell','Isidro','Janine','Jarred','Javier','Jeanene','Jeanine','Jennell','Jennifer','Jin','Joanna','Joe','Joetta','Johnathon','Jolene','Joni','Jude','Justa','Karen','Kathleen','Kathline','Katlyn','Keeley','Kellie','Kenneth','Kerstin','Kimbery','Kirstin','Kristofer','Kyung','Lael','Lamonica','Lavette','Les','Lessie','Lindsey','Lisabeth','Lissa','Luigi','Lyle','Lynn','Lynsey','Malia','Malika','Manuel','Marcie','Marian','Mariann','Marianna','Marie','Mariela','Marine','Marisol','Marissa','Marquerite','Marvin','Maryann','Mathilde','Mee','Millie','Minnie','Mitch','Mohammed','Mohamed','Mohammad','Mohamad','Myrtie','Natashia','Natisha','Nilsa','Nina','Novella','Ollie','Oneida','Orlando','Pamila','Paul','Penelope','Phoebe','Phung','Rashad','Ray','Reanna','Rebbecca','Reinaldo','Renee','Rex','Rodolfo','Rory','Roselle','Rosemarie','Rosina','Roxanne','Rozella','Rudolph','Sanda','Sanjuana','Savannah','Seema','Shad','Sheba','Shemeka','Sherita','Sherlyn','Sherrie','Shon','Skye','Stephnie','Susann','Suzanne','Tari','Tawnya','Tiffanie','Tora','Tosha','Tuan','Ulrike','Ulysses','Valeria','Valery','Vannessa','Wendy','Wilbert','Wilton','Winifred','Yi','Yolanda','Yolando','Zelda','Zenobia','Zola'];
  o.surnames = ['Terrance', 'Abdallah', 'Abernethy','Alire','Allmond','Amezcua','Anaya','Antunez','Artrip','Arvie','Aust','Balliet','Barber','Berggren','Bezio','Bickley','Birkholz','Blakley','Bochenek','Bonin','Bosh','Bouska','Bowser','Brennen','Bruder','Bryne','Bunyard','Cafferty','Camp','Campos','Cannon','Carballo','Chaisson','Chapin','Cheatham','Ciotti','Clarke','Clendenin','Coloma','Courville','Crick','Cutler','Dahlke','Dally','Dangelo','Davey','Dearmond','Defalco','Delman','Derby','Domingo','Domingues','Dorfman','Draves','Drinnon','Dubiel','Easterwood','Ely','Entwistle','Evers','Febus','Fiorini','Florentino','Fromm','Ginder','Glennon','Glidewell','Godsey','Greenfield','Guidroz','Hail','Haner','Harju','Harman','Harvison','Hathcock','Hayek','Helwig','Henneman','Herdon','Hiner','Holbert','Holding','Hollie','Housley','Hudnall','Hund','Imhoff','Jessie','Judkins','Kenan','Kilbane','Kissner','Knoles','Koen','Kornfeld','Kral','Kromer','Kuhlman','Laber','Lally','Leard','Lease','Leedy','Lennox','Line','Linzy','Llanes','Lobo','Longwell','Lucas','Lunn','Maine','Manthe','Mcgarrah','Meinhardt','Millington','Mohammed','Mohamed','Mohammad','Mohamad','Molino','Naab','Nakamura','Nass','Ory','Parodi','Paschall','Pasquale','Pautz','Paz','Peralta','Persaud','Pfarr','Piccolo','Piscitelli','Pond','Prophet','Ram','Ranallo','Raya','Redfield','Reinert','Remillard','Revelle','Risko','Ritzer','Rochin','Rodriques','Rush','Saltz','Scalia','Schow','Seyfried','Seyler','Shiner','Showman','Slinkard','Smiley','Snay','Solie','Stclaire','Steenbergen','Steier','Steptoe','Stiger','Strine','Stutler','Sugarman','Sykora','Tallon','Tarpley','Taveras','Tee','Tepper','Timlin','Tomlinson','Touchton','Tower','Tubman','Ulmer','Underdahl','Vanduzer','Vannest','Vanscyoc','Vanwagenen','Vierling','Vitale','Wainscott','Wasserman','Weatherman','Weidenbach','Weinmann','Well','Whitchurch','Wigton','Witek','Woodfin','Wray','Yu','Ziemann'];
  o.surnameExtensions = [' Smitheson', ' with a bizarrely long name', '-Tarquinnian', ' Davey Daveson', ' quite long'];
  //o.subjects = ['Archaeology','Arabic','Architecture','Art and Design','Biology','Business Studies','Careers','Chemistry','Computing','Curriculum Manager','Design & Technology','Drama','Early Years/ Kindergarten','Economics','English','English as a Foreign Language','Environmental Systems and Societies (ESS)','Food Technology','Foreign Languages','French','Geography','German','History','Humanities','Information Technology','Italian','Law','Mathematics','Mandarin','Media Studies','Middle School Generalist','Music','Librarian','Not Applicable','Pastoral Manager','Physical Education','Physics','Politics','Portuguese','Primary / Elementary','Psychology','Religious Education','Science','Senior Manager','Social Sciences','Spanish','Special Education Needs (SEN)','Supply Teacher','Teaching Assistant','TOK'];
  //o.roles = ['Classroom teacher','Early Years / Kindergarten Teacher','Head of Department','Primary / Elementary Teacher','Head of School','Counsellor','Curriculum Coordinator','Deputy Head / Vice Principal','Director of Studies','Educational Psychologist','English as a Foreign Language Teacher','Head of Primary / Elementary','Head of Secondary','Head of Section','Head of Year (pastoral)','IB PYP Coordinator','IB MYP Coordinator','IB DP Coordinator','Librarian','Other Position','Special Needs Teacher','Subject Leader','Teaching Assistant'];
  //o.countries = ['United States','United Kingdom','Afghanistan','Albania','Algeria','American Samoa','Andorra','Angola','Anguilla','Antarctica','Antigua and Barbuda','Argentina','Armenia','Aruba','Australia','Austria','Azerbaijan','Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium','Belize','Benin','Bermuda','Bhutan','Bolivia','Bosnia and Herzegovina','Botswana','Bouvet Island','Brazil','British Indian Ocean Territory','Brunei Darussalam','Bulgaria','Burkina Faso','Burundi','Cambodia','Cameroon','Canada','Cape Verde','Cayman Islands','Central African Republic','Chad','Chile','China','Christmas Island','Cocos (Keeling) Islands','Colombia','Comoros','Congo','Congo, The Democratic Republic of The','Cook Islands','Costa Rica','Cote Divoire','Croatia','Cuba','Cyprus','Czech Republic','Denmark','Djibouti','Dominica','Dominican Republic','Ecuador','Egypt','El Salvador','Equatorial Guinea','Eritrea','Estonia','Ethiopia','Falkland Islands (Malvinas)','Faroe Islands','Fiji','Finland','France','French Guiana','French Polynesia','French Southern Territories','Gabon','Gambia','Georgia','Germany','Ghana','Gibraltar','Greece','Greenland','Grenada','Guadeloupe','Guam','Guatemala','Guinea','Guinea-bissau','Guyana','Haiti','Heard Island and Mcdonald Islands','Holy See (Vatican City State)','Honduras','Hong Kong','Hungary','Iceland','India','Indonesia','Iran, Islamic Republic of','Iraq','Ireland','Israel','Italy','Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kiribati','Korea, Democratic People Republic of','Korea, Republic of','Kuwait','Kyrgyzstan','Lao People Democratic Republic','Latvia','Lebanon','Lesotho','Liberia','Libya','Liechtenstein','Lithuania','Luxembourg','Macao','Macedonia, The Former Yugoslav Republic of','Madagascar','Malawi','Malaysia','Maldives','Mali','Malta','Marshall Islands','Martinique','Mauritania','Mauritius','Mayotte','Mexico','Micronesia, Federated States of','Moldova, Republic of','Monaco','Mongolia','Montenegro','Montserrat','Morocco','Mozambique','Myanmar','Namibia','Nauru','Nepal','Netherlands','New Caledonia','New Zealand','Nicaragua','Niger','Nigeria','Niue','Norfolk Island','Northern Mariana Islands','Norway','Oman','Pakistan','Palau','Palestinian Territory, Occupied','Panama','Papua New Guinea','Paraguay','Peru','Philippines','Pitcairn','Poland','Portugal','Puerto Rico','Qatar','Reunion','Romania','Russian Federation','Rwanda','Saint Helena','Saint Kitts and Nevis','Saint Lucia','Saint Pierre and Miquelon','Saint Vincent and The Grenadines','Samoa','San Marino','Sao Tome and Principe','Saudi Arabia','Senegal','Serbia','Seychelles','Sierra Leone','Singapore','Slovakia','Slovenia','Solomon Islands','Somalia','South Africa','South Georgia and The South Sandwich Islands','Spain','Sri Lanka','Sudan','Suriname','Svalbard and Jan Mayen','Swaziland','Sweden','Switzerland','Syrian Arab Republic','Taiwan, Province of China','Tajikistan','Tanzania, United Republic of','Thailand','Timor-leste','Togo','Tokelau','Tonga','Trinidad and Tobago','Tunisia','Turkey','Turkmenistan','Turks and Caicos Islands','Tuvalu','Uganda','Ukraine','United Arab Emirates','United States Minor Outlying Islands','Uruguay','Uzbekistan','Vanuatu','Venezuela','Viet Nam','Virgin Islands, British','Virgin Islands, U.S.','Wallis and Futuna','Western Sahara','Yemen','Zambia','Zimbabwe'];
  o.schoolSuffixes = _(o.forenames).filter(function() { return Math.random()<0.05; }).value();
  o.twitterUsernames = ['kirkouimet','damenleeturks','calebogden','aaronbushnell','rogie','jacobseethaler','daryl','kolage','VinThomas','ShaunMoynihan','zulsdesign','nckjrvs','timothycd','motherfuton','jayrobinson','cameronmoll','jayman','danielhaim','alagoon','andrewpautler','garrettgee','blakesimkins','gilbertglee','ogvidius','manspaugh','ripplemdk','paul_irish','Anotherdagou','ryanleroux','roybarberuk','_joshnh','todd_coleman','russellsmith21','designer_dean','PtiteNoli','walterstephanie','imfine_thankyou','utroda','NastyaVZ','tiagocamargo','mikebeecham','nimaa','sajtoo','AngelZxxWingZ','ariona_rian','OskarLevinson','feliperibeiros','jonsuh','leevigraham','ryanAmurphy','jsngr','axelbouaziz','kristijantaken','decarola','iamlouisbullock','dbox','molovo','Djeje','antoniopratas','matejsudar','mkalalang','WhatTheFerguson','SiskaFlaurensia','deimler','benhowdle','mds','itolmach','MarkusOkur','ckor','Alvaro_Nistal','bradenhamm','gabediaz','ThisIsJohnBrown','benpeck','pizzulata','haibnu','JuliaYunLiu','vctrfrnndz','daniel_love','redkeg','benefritz','jpadilla_','owlfurty','eldelentes','mambows','max9xs','waqar_alamgir','sjoerd_dijkstra','CrafterSama','calvintennant','smharley','sodevious','razvantugui','FreelanceNathan','renbyrd','adn','jjmpsp','Fitehal','meghanglass','acoops_','cibawoman','iamlouisbullock','desaiguddu','brianmaloney','HugoAlbonete','macvhustle','rizwaniqbal','fabioChannel','vehbikilic','kkbethi','poopsplat','wrightmartin','JeffChausse','faridelnasire','devstrong','odaymashalla','Rafa3mil','meddeg','brampitoyo','arjunchetna','toodlenoodle','iamjamie','jcarlosweb','temonehm','gerwitz','neweravin','hvillega','mozato','alek_djuric','mcmieras','zametniy','jwphillips','Fubaruba','luhman','Betraydan','dvidsilva'];
  o.latinWords = ["ab", "aberant", "abscidit", "acervo", "ad", "addidit", "adhuc", "adsiduis", "adspirate", "aequalis", "aer", "aera", "aere", "aeris", "aestu", "aetas", "aethera", "aethere", "agitabilis", "aliis", "aliud", "alta", "altae", "alto", "ambitae", "amphitrite", "animal", "animalia", "animalibus", "animus", "ante", "aquae", "arce", "ardentior", "astra", "aurea", "auroram", "austro", "bene", "boreas", "bracchia", "caeca", "caecoque", "caeleste", "caeli", "caelo", "caelum", "caelumque", "caesa", "calidis", "caligine", "campoque", "campos", "capacius", "carentem", "carmen", "cepit", "certis", "cesserunt", "cetera", "chaos:", "cingebant", "cinxit", "circumdare", "circumfluus", "circumfuso", "coegit", "coeperunt", "coeptis", "coercuit", "cognati", "colebat", "concordi", "congeriem", "congestaque", "consistere", "contraria", "conversa", "convexi", "cornua", "corpora", "corpore", "crescendo", "cum", "cuncta", "cura", "declivia", "dedit", "deducite", "deerat", "dei", "densior", "deorum", "derecti", "descenderat", "deus", "dextra", "di", "dicere", "diffundi", "diremit", "discordia", "dispositam", "dissaepserat", "dissociata", "distinxit", "diu", "diversa", "diverso", "divino", "dixere", "dominari", "duae", "duas", "duris", "effervescere", "effigiem", "egens", "elementaque", "emicuit", "ensis", "eodem", "erant", "erat", "erat:", "erectos", "est", "et", "eurus", "evolvit", "exemit", "extendi", "fabricator", "facientes", "faecis", "fecit", "feras", "fert", "fidem", "figuras", "finxit", "fixo", "flamina", "flamma", "flexi", "fluminaque", "fontes", "foret", "forma", "formaeque", "formas", "fossae", "fratrum", "freta", "frigida", "frigore", "fronde", "fuerant", "fuerat", "fuit", "fulgura", "fulminibus", "galeae", "gentes", "glomeravit", "grandia", "gravitate", "habendum", "habentem", "habentia", "habitabilis", "habitandae", "haec", "hanc", "his", "homini", "hominum", "homo", "horrifer", "humanas", "hunc", "iapeto", "ignea", "igni", "ignotas", "illas", "ille", "illi", "illic", "illis", "imagine", "in", "inclusum", "indigestaque", "induit", "iners", "inmensa", "inminet", "innabilis", "inposuit", "instabilis", "inter", "invasit", "ipsa", "ita", "iudicis", "iuga", "iunctarum", "iussit", "lacusque", "lanient", "lapidosos", "lege", "legebantur", "levitate", "levius", "liberioris", "librata", "ligavit:", "limitibus", "liquidas", "liquidum", "litem", "litora", "locavit", "locis", "locoque", "locum", "longo", "lucis", "lumina", "madescit", "magni", "manebat", "mare", "margine", "matutinis", "mea", "media", "meis", "melior", "melioris", "membra", "mentes", "mentisque", "metusque", "militis", "minantia", "mixta", "mixtam", "moderantum", "modo", "moles", "mollia", "montes", "montibus", "mortales", "motura", "mundi", "mundo", "mundum", "mutastis", "mutatas", "nabataeaque", "nam", "natura", "naturae", "natus", "ne", "nebulas", "nec", "neu", "nisi", "nitidis", "nix", "non", "nondum", "norant", "nova", "nubes", "nubibus", "nullaque", "nulli", "nullo", "nullus", "numero", "nunc", "nuper", "obliquis", "obsistitur", "obstabatque", "occiduo", "omni", "omnia", "onerosior", "onus", "opifex", "oppida", "ora", "orba", "orbe", "orbem", "orbis", "origine", "origo", "os", "otia", "pace", "parte", "partim", "passim", "pendebat", "peragebant", "peregrinum", "permisit", "perpetuum", "persidaque", "perveniunt", "phoebe", "pinus", "piscibus", "plagae", "pluvialibus", "pluviaque", "poena", "pondere", "ponderibus", "pondus", "pontus", "porrexerat", "possedit", "posset:", "postquam", "praebebat", "praecipites", "praeter", "premuntur", "pressa", "prima", "primaque", "principio", "pro", "pronaque", "proxima", "proximus", "pugnabant", "pulsant", "quae", "quam", "quanto", "quarum", "quem", "qui", "quia", "quicquam", "quin", "quinta", "quisque", "quisquis", "quod", "quoque", "radiis", "rapidisque", "recens", "recepta", "recessit", "rectumque", "regat", "regio", "regna", "reparabat", "rerum", "retinebat", "ripis", "rudis", "sanctius", "sata", "satus", "scythiam", "secant", "secrevit", "sectamque", "secuit", "securae", "sed", "seductaque", "semina", "semine", "septemque", "sibi", "sic", "siccis", "sidera", "silvas", "sine", "sinistra", "sive", "sole", "solidumque", "solum", "sorbentur", "speciem", "spectent", "spisso", "sponte", "stagna", "sua", "subdita", "sublime", "subsidere", "sui", "suis", "summaque", "sunt", "super", "supplex", "surgere", "tanta", "tanto", "tegi", "tegit", "tellure", "tellus", "temperiemque", "tempora", "tenent", "tepescunt", "terra", "terrae", "terram", "terrarum", "terras", "terrenae", "terris", "timebat", "titan", "tollere", "tonitrua", "totidem", "totidemque", "toto", "tractu", "traxit", "triones", "tuba", "tum", "tumescere", "turba", "tuti", "ubi", "ulla", "ultima", "umentia", "umor", "unda", "undae", "undas", "undis", "uno", "unus", "usu", "ut", "utque", "utramque", "valles", "ventis", "ventos", "verba", "vesper", "videre", "vindice", "vis", "viseret", "vix", "volucres", "vos", "vultus", "zephyro", "zonae"];

  //basic lists
  var curriculums = [{"id":1,"name":"International Baccalaureate (DP)"},{"id":2,"name":"International Baccalaureate (MYP)"},{"id":3,"name":"International Baccalaureate (PYP)"},{"id":4,"name":"SAT Reasoning Test"},{"id":5,"name":"American College Testing (ACT)"},{"id":6,"name":"A-Levels"},{"id":7,"name":"IGCSE / GCSE"},{"id":8,"name":"French Baccalauréat"},{"id":9,"name":"German Abitur"},{"id":10,"name":"Titulo de Bachiller"},{"id":11,"name":"Australian SSCE"},{"id":12,"name":"Indian School Certificate"},{"id":13,"name":"Advanced Placement"},{"id":14,"name":"Early Years Foundation Stage (EYFS)"},{"id":15,"name":"International Primary (IPC)"},{"id":16,"name":"British Primary"},{"id":17,"name":"American"},{"id":18,"name":"Canadian"},{"id":19,"name":"Australian"},{"id":20,"name":"New Zealand"},{"id":21,"name":"Other"}];
  var educationLevels = [{"id":1,"name":"PhD"},{"id":2,"name":"Bachelors"},{"id":3,"name":"Masters"},{"id":4,"name":"Teaching Qualification / Certification"},{"id":5,"name":"Secondary / High School"},{"id":6,"name":"CELTA / TEFL"},{"id":7,"name":"Other"}];
  var skills = [{"id":1,"type":1,"name":"Word"},{"id":2,"type":1,"name":"Excel"},{"id":3,"type":1,"name":"Powerpoint"},{"id":4,"type":1,"name":"Publisher"},{"id":5,"type":1,"name":"Interactive whiteboards"},{"id":6,"type":1,"name":"Outlook"},{"id":7,"type":1,"name":"MAC"},{"id":8,"type":2,"name":"TOK"},{"id":9,"type":2,"name":"Examiner"},{"id":10,"type":2,"name":"Inquiry based learning"},{"id":11,"type":2,"name":"Behaviour Management"},{"id":12,"type":2,"name":"Different learning styles"},{"id":13,"type":2,"name":"Differentiation"},{"id":14,"type":2,"name":"Project management"},{"id":15,"type":2,"name":"Model UN"},{"id":16,"type":2,"name":"CCF"},{"id":17,"type":2,"name":"Teacher training"},{"id":18,"type":2,"name":"Teacher mentoring"},{"id":19,"type":2,"name":"Personal tutoring"},{"id":20,"type":2,"name":"Young Enterprise"},{"id":21,"type":2,"name":"CELTA/TEFL"},{"id":22,"type":1,"name":"GDCs"},{"id":23,"type":1,"name":"SIMS"},{"id":24,"type":1,"name":"Moodle"},{"id":25,"type":1,"name":"VLEs"},{"id":26,"type":1,"name":"Web development"},{"id":27,"type":1,"name":"Social Media"},{"id":28,"type":1,"name":"Photoshop"},{"id":29,"type":1,"name":"iPads"},{"id":30,"type":2,"name":"Duke of Edinburgh"},{"id":31,"type":2,"name":"IB Category 1"},{"id":32,"type":2,"name":"IB Category 2"},{"id":33,"type":2,"name":"IB Category 3"},{"id":34,"type":2,"name":"Advanced Skills Teacher (AST)"},{"id":35,"type":2,"name":"Supply teaching"}];
  var ageLevels = [{"id":1,"name":"Pre-school"},{"id":2,"name":"Primary"},{"id":3,"name":"Elementary"},{"id":4,"name":"Middle School"},{"id":5,"name":"Secondary"},{"id":6,"name":"High School"}];
  var subjects = [{"id":1,"name":"Accounting"},{"id":2,"name":"Archaeology"},{"id":3,"name":"Architecture"},{"id":4,"name":"Art and Design"},{"id":5,"name":"Biology"},{"id":6,"name":"Business Studies"},{"id":7,"name":"Careers"},{"id":8,"name":"Chemistry"},{"id":33,"name":"Curriculum Manager"},{"id":10,"name":"Design & Technology"},{"id":11,"name":"Drama"},{"id":41,"name":"Early Years / Kindergarten"},{"id":12,"name":"Economics"},{"id":13,"name":"English"},{"id":14,"name":"English as a Foreign Language"},{"id":42,"name":"Environmental Systems and Societies (ESS)"},{"id":15,"name":"Foreign Languages"},{"id":43,"name":"French"},{"id":17,"name":"Geography"},{"id":45,"name":"German"},{"id":18,"name":"History"},{"id":19,"name":"Humanities"},{"id":9,"name":"ICT / Computing"},{"id":20,"name":"Information Technology"},{"id":46,"name":"Italian"},{"id":21,"name":"Law"},{"id":47,"name":"Mandarin"},{"id":23,"name":"Mathematics"},{"id":24,"name":"Media Studies"},{"id":16,"name":"Middle School Specialist"},{"id":25,"name":"Music"},{"id":37,"name":"Not applicable"},{"id":30,"name":"Pastoral Manager"},{"id":26,"name":"Physical Education"},{"id":27,"name":"Physics"},{"id":28,"name":"Politics"},{"id":39,"name":"Primary / Elementary"},{"id":29,"name":"Psychology"},{"id":31,"name":"Religious Education"},{"id":32,"name":"Science"},{"id":40,"name":"Senior Manager"},{"id":22,"name":"Social Sciences"},{"id":44,"name":"Spanish"},{"id":34,"name":"Special Educational Needs (SEN)"},{"id":35,"name":"Supply teacher"},{"id":38,"name":"TOK"},{"id":36,"name":"Unspecified"}];
  var yesNo = [{"name":"Yes","id":1},{"name":"No","id":0}];
  var nationalities = [{"id":198,"name":""},{"id":4,"name":"Afghan"},{"id":5,"name":"Albanian"},{"id":6,"name":"Algerian"},{"id":7,"name":"American"},{"id":8,"name":"Andorran"},{"id":9,"name":"Angolan"},{"id":10,"name":"Antiguans"},{"id":11,"name":"Argentinean"},{"id":12,"name":"Armenian"},{"id":13,"name":"Australian"},{"id":14,"name":"Austrian"},{"id":15,"name":"Azerbaijani"},{"id":16,"name":"Bahamian"},{"id":17,"name":"Bahraini"},{"id":18,"name":"Bangladeshi"},{"id":19,"name":"Barbadian"},{"id":20,"name":"Barbudans"},{"id":21,"name":"Batswana"},{"id":22,"name":"Belarusian"},{"id":23,"name":"Belgian"},{"id":24,"name":"Belizean"},{"id":25,"name":"Beninese"},{"id":26,"name":"Bhutanese"},{"id":27,"name":"Bolivian"},{"id":28,"name":"Bosnian"},{"id":29,"name":"Brazilian"},{"id":30,"name":"British"},{"id":31,"name":"Bruneian"},{"id":32,"name":"Bulgarian"},{"id":33,"name":"Burkinabe"},{"id":34,"name":"Burmese"},{"id":35,"name":"Burundian"},{"id":36,"name":"Cambodian"},{"id":37,"name":"Cameroonian"},{"id":38,"name":"Canadian"},{"id":39,"name":"Cape Verdean"},{"id":40,"name":"Central African"},{"id":41,"name":"Chadian"},{"id":42,"name":"Chilean"},{"id":43,"name":"Chinese"},{"id":44,"name":"Colombian"},{"id":45,"name":"Comoran"},{"id":46,"name":"Congolese"},{"id":47,"name":"Costa Rican"},{"id":48,"name":"Croatian"},{"id":49,"name":"Cuban"},{"id":50,"name":"Cypriot"},{"id":51,"name":"Czech"},{"id":52,"name":"Danish"},{"id":53,"name":"Djibouti"},{"id":54,"name":"Dominican"},{"id":55,"name":"Dutch"},{"id":56,"name":"East Timorese"},{"id":57,"name":"Ecuadorean"},{"id":58,"name":"Egyptian"},{"id":59,"name":"Emirian"},{"id":199,"name":"English"},{"id":60,"name":"Equatorial Guinean"},{"id":61,"name":"Eritrean"},{"id":62,"name":"Estonian"},{"id":63,"name":"Ethiopian"},{"id":64,"name":"Fijian"},{"id":65,"name":"Filipino"},{"id":66,"name":"Finnish"},{"id":67,"name":"French"},{"id":68,"name":"Gabonese"},{"id":69,"name":"Gambian"},{"id":70,"name":"Georgian"},{"id":71,"name":"German"},{"id":72,"name":"Ghanaian"},{"id":73,"name":"Greek"},{"id":197,"name":"Greenlandic"},{"id":74,"name":"Grenadian"},{"id":75,"name":"Guatemalan"},{"id":76,"name":"Guinea-Bissauan"},{"id":77,"name":"Guinean"},{"id":78,"name":"Guyanese"},{"id":79,"name":"Haitian"},{"id":80,"name":"Herzegovinian"},{"id":81,"name":"Honduran"},{"id":82,"name":"Hungarian"},{"id":83,"name":"I-Kiribati"},{"id":84,"name":"Icelander"},{"id":85,"name":"Indian"},{"id":86,"name":"Indonesian"},{"id":87,"name":"Iranian"},{"id":88,"name":"Iraqi"},{"id":89,"name":"Irish"},{"id":90,"name":"Israeli"},{"id":91,"name":"Italian"},{"id":92,"name":"Ivorian"},{"id":93,"name":"Jamaican"},{"id":94,"name":"Japanese"},{"id":95,"name":"Jordanian"},{"id":96,"name":"Kazakhstani"},{"id":97,"name":"Kenyan"},{"id":98,"name":"Kittian and Nevisian"},{"id":99,"name":"Kuwaiti"},{"id":100,"name":"Kyrgyz"},{"id":101,"name":"Laotian"},{"id":102,"name":"Latvian"},{"id":103,"name":"Lebanese"},{"id":104,"name":"Liberian"},{"id":105,"name":"Libyan"},{"id":106,"name":"Liechtensteiner"},{"id":107,"name":"Lithuanian"},{"id":108,"name":"Luxembourger"},{"id":200,"name":"Macedonian"},{"id":109,"name":"Macedonian"},{"id":110,"name":"Malagasy"},{"id":111,"name":"Malawian"},{"id":112,"name":"Malaysian"},{"id":113,"name":"Maldivan"},{"id":114,"name":"Malian"},{"id":115,"name":"Maltese"},{"id":116,"name":"Marshallese"},{"id":117,"name":"Mauritanian"},{"id":118,"name":"Mauritian"},{"id":119,"name":"Mexican"},{"id":120,"name":"Micronesian"},{"id":121,"name":"Moldovan"},{"id":122,"name":"Monacan"},{"id":123,"name":"Mongolian"},{"id":124,"name":"Moroccan"},{"id":125,"name":"Mosotho"},{"id":126,"name":"Motswana"},{"id":127,"name":"Mozambican"},{"id":128,"name":"Namibian"},{"id":129,"name":"Nauruan"},{"id":130,"name":"Nepalese"},{"id":131,"name":"New Zealander"},{"id":132,"name":"Nicaraguan"},{"id":133,"name":"Nigerian"},{"id":134,"name":"Nigerien"},{"id":135,"name":"North Korean"},{"id":136,"name":"Northern Irish"},{"id":137,"name":"Norwegian"},{"id":138,"name":"Omani"},{"id":139,"name":"Pakistani"},{"id":140,"name":"Palauan"},{"id":141,"name":"Panamanian"},{"id":142,"name":"Papua New Guinean"},{"id":143,"name":"Paraguayan"},{"id":144,"name":"Peruvian"},{"id":145,"name":"Polish"},{"id":146,"name":"Portuguese"},{"id":147,"name":"Qatari"},{"id":148,"name":"Romanian"},{"id":149,"name":"Russian"},{"id":150,"name":"Rwandan"},{"id":151,"name":"Saint Lucian"},{"id":152,"name":"Salvadoran"},{"id":153,"name":"Samoan"},{"id":154,"name":"San Marinese"},{"id":155,"name":"Sao Tomean"},{"id":156,"name":"Saudi"},{"id":157,"name":"Scottish"},{"id":158,"name":"Senegalese"},{"id":159,"name":"Serbian"},{"id":160,"name":"Seychellois"},{"id":161,"name":"Sierra Leonean"},{"id":162,"name":"Singaporean"},{"id":163,"name":"Slovakian"},{"id":164,"name":"Slovenian"},{"id":165,"name":"Solomon Islander"},{"id":166,"name":"Somali"},{"id":167,"name":"South African"},{"id":168,"name":"South Korean"},{"id":169,"name":"Spanish"},{"id":170,"name":"Sri Lankan"},{"id":171,"name":"Sudanese"},{"id":172,"name":"Surinamer"},{"id":173,"name":"Swazi"},{"id":174,"name":"Swedish"},{"id":175,"name":"Swiss"},{"id":176,"name":"Syrian"},{"id":177,"name":"Taiwanese"},{"id":178,"name":"Tajik"},{"id":179,"name":"Tanzanian"},{"id":180,"name":"Thai"},{"id":181,"name":"Togolese"},{"id":182,"name":"Tongan"},{"id":183,"name":"Trinidadian or Tobagonian"},{"id":184,"name":"Tunisian"},{"id":185,"name":"Turkish"},{"id":186,"name":"Tuvaluan"},{"id":187,"name":"Ugandan"},{"id":188,"name":"Ukrainian"},{"id":189,"name":"Uruguayan"},{"id":190,"name":"Uzbekistani"},{"id":191,"name":"Venezuelan"},{"id":192,"name":"Vietnamese"},{"id":193,"name":"Welsh"},{"id":194,"name":"Yemenite"},{"id":195,"name":"Zambian"},{"id":196,"name":"Zimbabwean"}];
  var roles = [{"id":23,"type":2,"name":"Board Member / Governor"},{"id":1,"type":1,"name":"Classroom teacher"},{"id":16,"type":1,"name":"Counsellor"},{"id":22,"type":1,"name":"Curriculum Coordinator"},{"id":4,"type":2,"name":"Deputy Head / Vice Principal"},{"id":11,"type":1,"name":"Director of Studies"},{"id":19,"type":1,"name":"Early Years / Kindergarden Teacher"},{"id":34,"type":1,"name":"Educational Psychologist"},{"id":14,"type":1,"name":"ESL Teacher"},{"id":2,"type":2,"name":"Head of Department"},{"id":6,"type":2,"name":"Head of Primary / Elementary"},{"id":17,"type":2,"name":"Head of School / Principal"},{"id":5,"type":2,"name":"Head of Secondary / High School"},{"id":7,"type":1,"name":"Head of Section"},{"id":21,"type":1,"name":"Head of Year (pastoral)"},{"id":10,"type":2,"name":"IB Coordinator"},{"id":15,"type":1,"name":"Librarian"},{"id":32,"type":2,"name":"Other Manager"},{"id":13,"type":1,"name":"Other Position"},{"id":20,"type":1,"name":"Primary / Elementary Teacher"},{"id":12,"type":1,"name":"Special Needs Teacher"},{"id":33,"type":1,"name":"Subject leader"},{"id":18,"type":1,"name":"Unspecified"},{"id":24,"type":1,"name":"Unspecified"},{"id":25,"type":1,"name":"Unspecified"},{"id":26,"type":1,"name":"Year 1 Teacher"},{"id":27,"type":1,"name":"Year 2 Teacher"},{"id":28,"type":1,"name":"Year 3 Teacher"},{"id":29,"type":1,"name":"Year 4 Teacher"},{"id":30,"type":1,"name":"Year 5 Teacher"},{"id":31,"type":1,"name":"Year 6 Teacher"}];
  var languages = [{"id":1,"name":"English"},{"id":2,"name":"Spanish"},{"id":3,"name":"French"},{"id":4,"name":"German"},{"id":5,"name":"Italian"},{"id":6,"name":"Portuguese"},{"id":7,"name":"Chinese"},{"id":8,"name":"Japanese"},{"id":9,"name":"Arabic"},{"id":10,"name":"Other"}];
  var countries = [{"id":151,"name":"Afghanistan","alias":"/Asia/Afghanistan","isoCode":"af","phoneCode":"93"},{"id":1,"name":"Albania","alias":"/Europe/Albania","isoCode":"al","phoneCode":"355"},{"id":2,"name":"Angola","alias":"/Africa/Angola","isoCode":"ao","phoneCode":"244"},{"id":83,"name":"Argentina","alias":"/South_America/Argentina","isoCode":"ar","phoneCode":"54"},{"id":3,"name":"Australia","alias":"/Oceania/Australia","isoCode":"au","phoneCode":"61"},{"id":4,"name":"Austria","alias":"/Europe/Austria","isoCode":"at","phoneCode":"43"},{"id":84,"name":"Azerbaijan","alias":"/Europe/Azerbaijan","isoCode":"az","phoneCode":"994"},{"id":85,"name":"Bahamas","alias":"/Central_America/Bahamas","isoCode":"bs","phoneCode":"1242"},{"id":5,"name":"Bahrain","alias":"/Asia/Bahrain","isoCode":"bh","phoneCode":"973"},{"id":86,"name":"Bangladesh","alias":"/Asia/Bangladesh","isoCode":"bd","phoneCode":"880"},{"id":6,"name":"Barbados","alias":"/Central_America/Barbados","isoCode":"bb","phoneCode":"1246"},{"id":7,"name":"Belgium","alias":"/Europe/Belgium","isoCode":"be","phoneCode":"32"},{"id":87,"name":"Benin","alias":"/Africa/Benin","isoCode":"bj","phoneCode":"229"},{"id":88,"name":"Bolivia","alias":"/South_America/Bolivia","isoCode":"bo","phoneCode":"591"},{"id":89,"name":"Botswana","alias":"/Africa/Botswana","isoCode":"bw","phoneCode":"267"},{"id":90,"name":"Brazil","alias":"/South_America/Brazil","isoCode":"br","phoneCode":"55"},{"id":91,"name":"British Virgin Islands","alias":"/Central_America/British_Virgin_Islands","isoCode":"vg","phoneCode":"1284"},{"id":92,"name":"Brunei","alias":"/Asia/Brunei","isoCode":"bn","phoneCode":"673"},{"id":8,"name":"Bulgaria","alias":"/Europe/Bulgaria","isoCode":"bg","phoneCode":"359"},{"id":93,"name":"Burkina Faso","alias":"/Africa/Burkina_Faso","isoCode":"bf","phoneCode":"226"},{"id":9,"name":"Cambodia","alias":"/Asia/Cambodia","isoCode":"kh","phoneCode":"855"},{"id":94,"name":"Cameroon","alias":"/Africa/Cameroon","isoCode":"cm","phoneCode":"237"},{"id":95,"name":"Canada","alias":"/North_America/Canada","isoCode":"ca","phoneCode":"1"},{"id":10,"name":"Chile","alias":"/South_America/Chile","isoCode":"cl","phoneCode":"56"},{"id":11,"name":"China","alias":"/Asia/China","isoCode":"cn","phoneCode":"86"},{"id":96,"name":"Colombia","alias":"/South_America/Colombia","isoCode":"co","phoneCode":"57"},{"id":97,"name":"Congo","alias":"/Africa/Congo","isoCode":"cg","phoneCode":"242"},{"id":12,"name":"Costa Rica","alias":"/Central_America/Costa_Rica","isoCode":"cr","phoneCode":"506"},{"id":98,"name":"Cote d'Ivoire","alias":"/Africa/Cote_dIvoire","isoCode":"ci","phoneCode":"225"},{"id":13,"name":"Croatia","alias":"/Europe/Croatia","isoCode":"hr","phoneCode":"385"},{"id":14,"name":"Cuba","alias":"/Central_America/Cuba","isoCode":"cu","phoneCode":"53"},{"id":15,"name":"Cyprus","alias":"/Europe/Cyprus","isoCode":"cy","phoneCode":"357"},{"id":16,"name":"Czech Republic","alias":"/Europe/Czech_Republic","isoCode":"cz","phoneCode":"420"},{"id":17,"name":"Democratic Republic of Congo","alias":"/Africa/Democratic_Republic_of_Congo","isoCode":"cd","phoneCode":"243"},{"id":18,"name":"Denmark","alias":"/Europe/Denmark","isoCode":"dk","phoneCode":"45"},{"id":99,"name":"Dominican Republic","alias":"/South_America/Dominican_Republic","isoCode":"do","phoneCode":"1809"},{"id":100,"name":"Ecuador","alias":"/South_America/Ecuador","isoCode":"ec","phoneCode":"593"},{"id":19,"name":"Egypt","alias":"/Africa/Egypt","isoCode":"eg","phoneCode":"20"},{"id":101,"name":"El Salvador","alias":"/Central_America/El_Salvador","isoCode":"sv","phoneCode":"503"},{"id":102,"name":"Eritrea","alias":"/Africa/Eritrea","isoCode":"er","phoneCode":"291"},{"id":20,"name":"Estonia","alias":"/Europe/Estonia","isoCode":"ee","phoneCode":"372"},{"id":103,"name":"Ethiopia","alias":"/Africa/Ethiopia","isoCode":"et","phoneCode":"251"},{"id":21,"name":"Finland","alias":"/Europe/Finland","isoCode":"fi","phoneCode":"358"},{"id":22,"name":"France","alias":"/Europe/France","isoCode":"fr","phoneCode":"33"},{"id":104,"name":"Gabon","alias":"/Africa/Gabon","isoCode":"ga","phoneCode":"241"},{"id":105,"name":"Georgia","alias":"/Europe/Georgia","isoCode":"ge","phoneCode":"995"},{"id":23,"name":"Germany","alias":"/Europe/Germany","isoCode":"de","phoneCode":"49"},{"id":106,"name":"Ghana","alias":"/Africa/Ghana","isoCode":"gh","phoneCode":"233"},{"id":24,"name":"Greece","alias":"/Europe/Greece","isoCode":"gr","phoneCode":"30"},{"id":147,"name":"Greenland","alias":"/North_America/Greenland","isoCode":"gl","phoneCode":"299"},{"id":107,"name":"Guatemala","alias":"/Central_America/Guatemala","isoCode":"gt","phoneCode":"502"},{"id":108,"name":"Guinea","alias":"/Africa/Guinea","isoCode":"gn","phoneCode":"240"},{"id":109,"name":"Guyana","alias":"/Africa/Guyana","isoCode":"gy","phoneCode":"592"},{"id":110,"name":"Haiti","alias":"/Central_America/Haiti","isoCode":"ht","phoneCode":"509"},{"id":25,"name":"Honduras","alias":"/Central_America/Honduras","isoCode":"hn","phoneCode":"504"},{"id":26,"name":"Hong Kong","alias":"/Asia/Hong_Kong","isoCode":"hk","phoneCode":"852"},{"id":27,"name":"Hungary","alias":"/Europe/Hungary","isoCode":"hu","phoneCode":"36"},{"id":28,"name":"Iceland","alias":"/Europe/Iceland","isoCode":"is","phoneCode":"354"},{"id":29,"name":"India","alias":"/Asia/India","isoCode":"in","phoneCode":"91"},{"id":30,"name":"Indonesia","alias":"/Asia/Indonesia","isoCode":"id","phoneCode":"62"},{"id":31,"name":"Iran","alias":"/Asia/Iran","isoCode":"ir","phoneCode":"98"},{"id":153,"name":"Iraq","alias":"/Asia/Iraq","isoCode":"iq","phoneCode":"964"},{"id":32,"name":"Ireland","alias":"/Europe/Ireland","isoCode":"ie","phoneCode":"353"},{"id":157,"name":"Israel","alias":"/Asia/Israel","isoCode":"il","phoneCode":"972"},{"id":33,"name":"Italy","alias":"/Europe/Italy","isoCode":"it","phoneCode":"39"},{"id":111,"name":"Jamaica","alias":"/Central_America/Jamaica","isoCode":"jm","phoneCode":"1876"},{"id":34,"name":"Japan","alias":"/Asia/Japan","isoCode":"jp","phoneCode":"81"},{"id":35,"name":"Jordan","alias":"/Asia/Jordan","isoCode":"jo","phoneCode":"962"},{"id":36,"name":"Kazakhstan","alias":"/Asia/Kazakhstan","isoCode":"kz","phoneCode":"7"},{"id":37,"name":"Kenya","alias":"/Africa/Kenya","isoCode":"ke","phoneCode":"254"},{"id":159,"name":"Kosovo","alias":"/Europe/Kosovo","isoCode":"KO","phoneCode":"381"},{"id":38,"name":"Kuwait","alias":"/Asia/Kuwait","isoCode":"kw","phoneCode":"965"},{"id":39,"name":"Kyrgyzstan","alias":"/Asia/Kyrgyzstan","isoCode":"kg","phoneCode":"996"},{"id":112,"name":"Laos","alias":"/Africa/Laos","isoCode":"la","phoneCode":"856"},{"id":113,"name":"Latvia","alias":"/Europe/Latvia","isoCode":"lv","phoneCode":"371"},{"id":40,"name":"Lebanon","alias":"/Asia/Lebanon","isoCode":"lb","phoneCode":"961"},{"id":114,"name":"Lesotho","alias":"/Africa/Lesotho","isoCode":"ls","phoneCode":"266"},{"id":115,"name":"Liberia","alias":"/Africa/Liberia","isoCode":"lr","phoneCode":"231"},{"id":116,"name":"Libya","alias":"/Africa/Libya","isoCode":"ly","phoneCode":"218"},{"id":41,"name":"Lithuania","alias":"/Europe/Lithuania","isoCode":"lt","phoneCode":"370"},{"id":42,"name":"Luxembourg","alias":"/Europe/Luxembourg","isoCode":"lu","phoneCode":"352"},{"id":148,"name":"Macedonia","alias":"/Europe/Macedonia","isoCode":"mk","phoneCode":"389"},{"id":117,"name":"Madagascar","alias":"/Africa/Madagascar","isoCode":"mg","phoneCode":"261"},{"id":118,"name":"Malawi","alias":"/Africa/Malawi","isoCode":"mw","phoneCode":"265"},{"id":43,"name":"Malaysia","alias":"/Asia/Malaysia","isoCode":"my","phoneCode":"60"},{"id":119,"name":"Mali","alias":"/Africa/Mali","isoCode":"ml","phoneCode":"223"},{"id":44,"name":"Malta","alias":"/Europe/Malta","isoCode":"mt","phoneCode":"356"},{"id":120,"name":"Mauritania","alias":"/Africa/Mauritania","isoCode":"mr","phoneCode":"222"},{"id":121,"name":"Mauritius","alias":"/Africa/Mauritius","isoCode":"mu","phoneCode":"230"},{"id":45,"name":"Mexico","alias":"/Central_America/Mexico","isoCode":"mx","phoneCode":"52"},{"id":46,"name":"Monaco","alias":"/Europe/Monaco","isoCode":"mc","phoneCode":"377"},{"id":47,"name":"Mongolia","alias":"/Asia/Mongolia","isoCode":"mn","phoneCode":"976"},{"id":48,"name":"Morocco","alias":"/Africa/Morocco","isoCode":"ma","phoneCode":"212"},{"id":122,"name":"Mozambique","alias":"/Africa/Mozambique","isoCode":"mz","phoneCode":"258"},{"id":161,"name":"Myanmar","alias":"/Asia/Myanmar","isoCode":"","phoneCode":""},{"id":123,"name":"Namibia","alias":"/Africa/Namibia","isoCode":"na","phoneCode":"264"},{"id":124,"name":"Nepal","alias":"/Asia/Nepal","isoCode":"np","phoneCode":"977"},{"id":49,"name":"Netherlands","alias":"/Europe/Netherlands","isoCode":"nl","phoneCode":"31"},{"id":125,"name":"Netherlands Antilles","alias":"/Central_America/Netherlands_Antilles","isoCode":"an","phoneCode":"599"},{"id":146,"name":"New Zealand","alias":"/Oceania/New_Zealand","isoCode":"nz","phoneCode":"64"},{"id":126,"name":"Nicaragua","alias":"/Central_America/Nicaragua","isoCode":"ni","phoneCode":"505"},{"id":127,"name":"Niger","alias":"/Africa/Niger","isoCode":"ne","phoneCode":"227"},{"id":50,"name":"Nigeria","alias":"/Africa/Nigeria","isoCode":"ng","phoneCode":"234"},{"id":51,"name":"Norway","alias":"/Europe/Norway","isoCode":"no","phoneCode":"47"},{"id":52,"name":"Oman","alias":"/Asia/Oman","isoCode":"om","phoneCode":"968"},{"id":128,"name":"Pakistan","alias":"/Asia/Pakistan","isoCode":"pk","phoneCode":"92"},{"id":129,"name":"Panama","alias":"/Central_America/Panama","isoCode":"pa","phoneCode":"507"},{"id":155,"name":"Papua New Guinea","alias":"/Oceania/Papua_New_Guinea","isoCode":"pg","phoneCode":"675"},{"id":130,"name":"Paraguay","alias":"/South_America/Paraguay","isoCode":"py","phoneCode":"595"},{"id":131,"name":"Peru","alias":"/South_America/Peru","isoCode":"pe","phoneCode":"51"},{"id":132,"name":"Philippines","alias":"/Asia/Philippines","isoCode":"ph","phoneCode":"63"},{"id":53,"name":"Poland","alias":"/Europe/Poland","isoCode":"pl","phoneCode":"48"},{"id":54,"name":"Portugal","alias":"/Europe/Portugal","isoCode":"pt","phoneCode":"351"},{"id":55,"name":"Qatar","alias":"/Asia/Qatar","isoCode":"qa","phoneCode":"974"},{"id":152,"name":"Republic of Korea","alias":"/Asia/Republic_of_Korea","isoCode":"kp","phoneCode":"850"},{"id":56,"name":"Romania","alias":"/Europe/Romania","isoCode":"ro","phoneCode":"40"},{"id":57,"name":"Russia","alias":"/Asia/Russia","isoCode":"ru","phoneCode":"7"},{"id":156,"name":"Rwanda","alias":"/Africa/Rwanda","isoCode":"rw","phoneCode":"250"},{"id":58,"name":"Saudi Arabia","alias":"/Asia/Saudi_Arabia","isoCode":"sa","phoneCode":"966"},{"id":133,"name":"Senegal","alias":"/Africa/Senegal","isoCode":"sn","phoneCode":"221"},{"id":59,"name":"Serbia","alias":"/Europe/Serbia","isoCode":"rs","phoneCode":"381"},{"id":134,"name":"Serbia & Montenegro","alias":"/Europe/Serbia_Montenegro","isoCode":"me","phoneCode":"382"},{"id":135,"name":"Seychelles","alias":"/Africa/Seychelles","isoCode":"sc","phoneCode":"248"},{"id":136,"name":"Sierra Leone","alias":"/Africa/Sierra_Leone","isoCode":"sl","phoneCode":"232"},{"id":137,"name":"Singapore","alias":"/Asia/Singapore","isoCode":"sg","phoneCode":"65"},{"id":60,"name":"Slovakia","alias":"/Europe/Slovakia","isoCode":"sk","phoneCode":"421"},{"id":61,"name":"Slovenia","alias":"/Europe/Slovenia","isoCode":"si","phoneCode":"386"},{"id":62,"name":"South Africa","alias":"/Africa/South_Africa","isoCode":"za","phoneCode":"27"},{"id":63,"name":"South Korea","alias":"/Asia/South_Korea","isoCode":"kr","phoneCode":"82"},{"id":64,"name":"Spain","alias":"/Europe/Spain","isoCode":"es","phoneCode":"34"},{"id":138,"name":"Sri Lanka","alias":"/Asia/Sri_Lanka","isoCode":"lk","phoneCode":"94"},{"id":139,"name":"Sudan","alias":"/Africa/Sudan","isoCode":"sd","phoneCode":"249"},{"id":150,"name":"Suriname","alias":"/South_America/Suriname","isoCode":"sr","phoneCode":"597"},{"id":65,"name":"Sweden","alias":"/Europe/Sweden","isoCode":"se","phoneCode":"46"},{"id":66,"name":"Switzerland","alias":"/Europe/Switzerland","isoCode":"ch","phoneCode":"41"},{"id":149,"name":"Syria","alias":"/Asia/Syria","isoCode":"sy","phoneCode":"963"},{"id":67,"name":"Taiwan","alias":"/Asia/Taiwan","isoCode":"tw","phoneCode":"886"},{"id":68,"name":"Tajikistan","alias":"/Asia/Tajikistan","isoCode":"tj","phoneCode":"992"},{"id":69,"name":"Tanzania","alias":"/Africa/Tanzania","isoCode":"tz","phoneCode":"255"},{"id":70,"name":"Thailand","alias":"/Asia/Thailand","isoCode":"th","phoneCode":"66"},{"id":71,"name":"The Bahamas","alias":"/Central_America/The_Bahamas","isoCode":"bs","phoneCode":"1242"},{"id":140,"name":"The Gambia","alias":"/Africa/The_Gambia","isoCode":"gm","phoneCode":"220"},{"id":72,"name":"Togo","alias":"/Africa/Togo","isoCode":"tg","phoneCode":"228"},{"id":73,"name":"Tunisia","alias":"/Africa/Tunisia","isoCode":"tn","phoneCode":"216"},{"id":74,"name":"Turkey","alias":"/Europe/Turkey","isoCode":"tr","phoneCode":"90"},{"id":141,"name":"Uganda","alias":"/Africa/Uganda","isoCode":"ug","phoneCode":"256"},{"id":75,"name":"Ukraine","alias":"/Europe/Ukraine","isoCode":"ua","phoneCode":"380"},{"id":76,"name":"United Arab Emirates","alias":"/Asia/United_Arab_Emirates","isoCode":"ae","phoneCode":"971"},{"id":77,"name":"United Kingdom","alias":"/Europe/United_Kingdom","isoCode":"gb","phoneCode":"44"},{"id":78,"name":"United States","alias":"/North_America/United_States","isoCode":"us","phoneCode":"1"},{"id":142,"name":"Uruguay","alias":"/South_America/Uruguay","isoCode":"uy","phoneCode":"598"},{"id":154,"name":"US Virgin Islands","alias":"/North_America/US_Virgin_Islands","isoCode":"vi","phoneCode":"1340"},{"id":79,"name":"Uzbekistan","alias":"/Asia/Uzbekistan","isoCode":"uz","phoneCode":"998"},{"id":162,"name":"Vanuatu","alias":"/Oceania/Vanuatu","isoCode":"","phoneCode":""},{"id":80,"name":"Venezuela","alias":"/South_America/Venezuela","isoCode":"ve","phoneCode":"58"},{"id":81,"name":"Vietnam","alias":"/Asia/Vietnam","isoCode":"vn","phoneCode":"84"},{"id":160,"name":"Worldwide","alias":"/North_America/Worldwide","isoCode":"","phoneCode":""},{"id":143,"name":"Yemen","alias":"/Africa/Yemen","isoCode":"ye","phoneCode":"967"},{"id":82,"name":"Zambia","alias":"/Africa/Zambia","isoCode":"zm","phoneCode":"260"},{"id":144,"name":"Zimbabwe","alias":"/Africa/Zimbabwe","isoCode":"zw","phoneCode":"263"}];
  var locations = [{"id":1,"alias":"/Africa","name":"Africa"},{"id":2,"alias":"/Asia","name":"Asia"},{"id":3,"alias":"/Central_America","name":"Central America"},{"id":4,"alias":"/Europe","name":"Europe"},{"id":5,"alias":"/North_America","name":"North America"},{"id":6,"alias":"/Oceania","name":"Oceania"},{"id":7,"alias":"/South_America","name":"South America"},{"id":8,"alias":null,"name":"Middle East"}];
  var teacherStatuses = [{id:1,name:'Joined'},{id:2,name:'80% complete'},{id:3,name:'Pending approval'},{id:4,name:'Approved'},{id:5,name:'Declined'}];
  var jobStatuses = [{id:1,name:'Vacancy'},{id:2,name:'Filled'}, {id:3,name:'Cancelled'}];
  var applicationStatuses = [{id:1,name:'Applied'},{id:2,name:'Put forward'},{id:3,name:'Shortlisted'},{id:4,name:'Interviewed'},{id:5,name:'Offer made'},{id:6,name:'Accepted'},{id:7,name:'Rejected'}];
  var settings = ['applicationStatusToShortlistedMessageTemplate', 'applicationStatusToInterviewedMessageTemplate', 'applicationStatusToOfferMadeMessageTemplate', 'applicationStatusToAcceptedMessageTemplate', 'applicationStatusToRejectedMessageTemplate'];
  o.basicLists = {"curriculums": curriculums, "educationLevels": educationLevels, "skills": skills, "ageLevels": ageLevels,
                    "subjects": subjects, "yesno": yesNo, "nationalities": nationalities, "roles": roles,
                    "languages": languages, "countries": countries, "locations": locations,
                    "teacherStatuses": teacherStatuses, "jobStatuses": jobStatuses, //*** new
                    "applicationStatuses": applicationStatuses, "settings": settings }; //*** new
  return o;
});

app.factory('randomDataService', function(serverListsService) {
  var capitaliseFirstLetter = function(s) { return s.charAt(0).toUpperCase() + s.slice(1); };
  var offsetDateByDays = function(days, date) {
    return new Date((date || new Date()).getTime() + days*24*60*60*1000);
  };
  var getRandomInteger = function(from, to) {
    return from+Math.floor(Math.random()*(to-from+1));
  };
  var getRandomJsDate = function(from, to) {
    var f = (from ? from.getTime() : new Date(1900, 0, 1).getTime());
    var t = (to ? to.getTime() : new Date(2100, 0, 1).getTime());
    return new Date(f + Math.random() * (t - f));
  };
  var getRandomIsoDate = function(from, to) {
    return getRandomJsDate(from, to).toISOString();
  };
  var getRandomArrayItem = function(arr) {
    return arr[getRandomInteger(0, arr.length-1)];
  };
  var getRandomDataItem = function(type) {
    //*** TODO: some of these should occasionally return undefined etc - need to check which that's possible for
    switch (type) {
      case 'id': return _.uniqueId();
      //teachers
      case 'fullName': return getRandomArrayItem(serverListsService.forenames) + ' ' + getRandomArrayItem(serverListsService.surnames) + (Math.random()<0.1?getRandomArrayItem(serverListsService.surnameExtensions):'');
      case 'url': return '/some-url-external-to-the-dashboard/' + getRandomInteger(1000000, 10000000);
      case 'profileUrl': return '/profile-url-external-to-the-dashboard/' + getRandomInteger(1000000, 10000000);
      case 'avatarUrl': return 'http://uifaces.com/faces/_twitter/' + getRandomArrayItem(serverListsService.twitterUsernames) + '_128.jpg';
      //
      case 'score': return getRandomInteger(0, 10);
      case 'subject': return getRandomArrayItem(serverListsService.basicLists.subjects).name;
      case 'role': return getRandomArrayItem(serverListsService.basicLists.roles).name;
      case 'schoolName': return getRandomArrayItem(['School', 'Ecole']) + ' ' + getRandomArrayItem(['of', 'de', 'de la']) + ' ' + getRandomArrayItem(serverListsService.schoolSuffixes);
      case 'country': return getRandomArrayItem(serverListsService.basicLists.countries).name;
      //jobs
      case 'dateCreated': return getRandomIsoDate(offsetDateByDays(-60), offsetDateByDays(0));
      case 'numApplied': return getRandomInteger(0, 40);
      case 'numPutForward': return getRandomInteger(0, 20);
      case 'numShortlisted': return getRandomInteger(0, 20);
      case 'numInterviewed': return getRandomInteger(0, 20);
      case 'numOffersMade': return getRandomInteger(0, 20); //note 'Offers' not 'Offer'
      case 'isAccepted': return Math.random() < 0.2;
      case 'numRejected': return getRandomInteger(0, 20);
      case 'statusDate': return getRandomIsoDate(offsetDateByDays(-60), offsetDateByDays(0));
      //applications
      case 'datePutForward': return getRandomIsoDate(offsetDateByDays(-60), offsetDateByDays(0));
      //
      case 'latinWord': return getRandomArrayItem(serverListsService.latinWords);
    }
    return "WIP";
  };
  var getRandomObject = function(properties) {
    var o = {};
    for (var i = 0; i < properties.length; i++) {
      var p = properties[i];
      if (typeof p === 'string') o[p] = getRandomDataItem(p);
      if (typeof p === 'object') o[p.name] = getRandomDataItem(p.type);
    }
    return o;
  };
  var getRandomArrayOfObjects = function(options) {
    var a = [];
    for (var i = 0; i < options.length; i++) {
      var o = (options.fn ? options.fn.call() : getRandomObject(options.properties));
      a.push(o);
    }
    return a;
  };
  var getRandomArrayOfDataItems = function(options) {
    var a = [];
    for (var i = 0; i < options.length; i++) {
      var v = (options.fn ? options.fn.call() : getRandomDataItem(options.type));
      a.push(v);
    }
    return a;
  };
  var getRandomSentence = function() {
    var s = getRandomArrayOfDataItems({ type: 'latinWord', length: getRandomInteger(1, 10) }).join(' ');
    return capitaliseFirstLetter(s) + '.';
  };
  var getRandomParagraph = function(minSentences, maxSentences) {
    minSentences = minSentences || 1; maxSentences = maxSentences || 8;
    return getRandomArrayOfDataItems({ fn: getRandomSentence, length: getRandomInteger(minSentences, maxSentences) }).join(' ');
  };
  var getRandomMultiParagraphMessage = function(minParagraphs, maxParagraphs) {
    minParagraphs = minParagraphs || 1; maxParagraphs = maxParagraphs || 4;
    return getRandomArrayOfDataItems({ fn: getRandomParagraph, length: getRandomInteger(minParagraphs, maxParagraphs) }).join('\n\n');
  };
  var getRandomApplicationForStatusId1 = function() {
    return {
      "id": _.uniqueId(),
      "teacher": getRandomObject(['id', 'fullName', 'profileUrl', 'score']), //can any of these be missing?
      "job": getRandomObject(['id', 'subject', 'role', 'schoolName', 'country']),
      "coverMessage": getRandomMultiParagraphMessage(1, 8),
      "dateApplied": getRandomIsoDate(new Date('2013-05-01'), new Date())
    };
  };
  var getRandomApplicationForSpecificJob = function(isBrandNew) {
    var a = {};
    a.id = _.uniqueId();
    a.teacher = getRandomObject(['id', 'fullName', 'avatarUrl', 'profileUrl']); //can any of these be missing?
    if (Math.random() < 0.9) a.teacher.score = getRandomDataItem('score');
    if (isBrandNew) {
      a.datePutForward = (new Date()).toISOString();
      a.statusId = 2;
      a.statusDate = a.datePutForward;
      a.previousStatusId = 1;
    } else {
      a.datePutForward = getRandomDataItem('datePutForward');
      a.statusId = getRandomArrayItem([2,4,5,6,7,8]);
      a.statusDate = getRandomDataItem('statusDate');
      a.previousStatusId = getRandomArrayItem(_.filter([1,2,4,5,6,7,8], function(x) { return x < a.statusId; }));
      if (Math.random() < 0.5) a.adminNote = getRandomMultiParagraphMessage(1, 3);
      if (Math.random() < 0.5) a.schoolNote = getRandomMultiParagraphMessage(1, 8);
      if (Math.random() < 0.8) a.score = getRandomDataItem('score');
      if (Math.random() < 0.8) a.coverMessage = getRandomMultiParagraphMessage(1, 8);
    }
    return a;
  };
  var o = {};
  o.getRandomInteger = getRandomInteger;
  o.getRandomDataItem = getRandomDataItem;
  o.getRandomIsoDate = getRandomIsoDate;
  o.getRandomObject = getRandomObject;
  o.getRandomArrayOfObjects = getRandomArrayOfObjects;
  o.getRandomArrayOfDataItems = getRandomArrayOfDataItems;
  o.getRandomSentence = getRandomSentence;
  o.getRandomParagraph = getRandomParagraph;
  o.getRandomApplicationForStatusId1 = getRandomApplicationForStatusId1;
  o.getRandomApplicationForSpecificJob = getRandomApplicationForSpecificJob;
  return o;
});

//set dummy server responses to posts and gets
app.run(function($httpBackend, $resource, $q, $timeout, serverListsService, randomDataService) {
  //note: $httpBackend requests are at the bottom

  //dummy responses (in the form of javascript objects)

  //teachers
  var teachersResponse = function(method, url, data, headers) {
    var teachers;
    var params = (data ? JSON.parse(data) : {});
    if (params.statusId === 3) { //teachers pending approval
      teachers = randomDataService.getRandomArrayOfObjects({ properties: ['id', 'fullName', 'profileUrl'], length: randomDataService.getRandomInteger(0, 100) });
    }
    if (params.search && params.statusId === 4) { //search approved teachers
      params.limit = params.limit || 5;
      teachers = [];
      var re = new RegExp(params.search, 'i');
      for (var i=1; i<500; i++) {
        var fullName = randomDataService.getRandomDataItem('fullName');
        if (re.test(fullName)) {
          var profileUrl = randomDataService.getRandomDataItem('profileUrl');
          var avatarUrl = randomDataService.getRandomDataItem('avatarUrl');
          teachers.push({ id: i, fullName: fullName, profileUrl: profileUrl, avatarUrl: avatarUrl });
        }
        if (teachers.length === params.limit) break;
      }
    }
    var json = { "teachers": teachers };
    return [200, json];
  };

  //jobs
  var jobProperties = ['id', 'dateCreated', 'subject', 'role', 'schoolName', 'country', 'numApplied', 'numPutForward', 'numShortlisted', 'numInterviewed', 'numOffersMade', 'isAccepted', 'numRejected'];
  var jobsResponse = function(method, url, data, headers) {
    //params
    var params = (data ? JSON.parse(data) : {});
    delete params.type; //ignore for mock purposes (for now) as this only affects a few data values (and not size/structure)
    var paramCount = _.keys(params).length;
    var length;

    if (paramCount === 0) length = 200; //max
    if (paramCount === 1) length = randomDataService.getRandomInteger(10, 50);
    if (paramCount > 1) length = randomDataService.getRandomInteger(0, 10);

    //properties (remove properties which were passed as params)
    var properties = _.without(jobProperties, (params.subjectId ? 'subject' : ''), (params.roleId ? 'role' : ''), (params.countryId ? 'country' : ''));

    var jobs = {
      "jobs": randomDataService.getRandomArrayOfObjects({ properties: properties, length: length })
    };
    return [200, jobs];
  };

  var jobResponse = function(method, url, data, headers) {
    var job = {
      "job": randomDataService.getRandomObject(['dateCreated', 'subject', 'role', 'schoolName', 'country'])
    };
    return [200, job];
  };

  //applications
  var applicationsResponse = function(method, url, data, headers) {
    var applications;
    var params = (data ? JSON.parse(data) : {});
    if (params.statusId === 1) {
      applications = randomDataService.getRandomArrayOfObjects({ fn: randomDataService.getRandomApplicationForStatusId1, length: randomDataService.getRandomInteger(0, 100) });
    }
    if (params.jobId) {
      applications = randomDataService.getRandomArrayOfObjects({ fn: randomDataService.getRandomApplicationForSpecificJob, length: randomDataService.getRandomInteger(0, 30) });
    }
    var json = { "applications": applications };
    return [200, json];
  };
  var addApplicationResponse = function(method, url, data, headers) {
    var application = randomDataService.getRandomApplicationForSpecificJob(true);
    var json = { "application": application };
    return [200, json];
  };

  //settings
  var settingResponse = function(method, url, data, headers) {
    var params = (data ? JSON.parse(data) : {});
    var value = 'Dear [[fullName]],\n\n' +
      '(Template for "' + params.settingName + '")\n\n' +
      randomDataService.getRandomParagraph() + '\n\n' +
      randomDataService.getRandomSentence() + '\n\n' +
      'Sincerely';
    var setting = { value: value };
    return [200, setting];
  };
  var messageTemplateResponse = function(method, url, data, headers) {
    var params = (data ? JSON.parse(data) : {});
    var text = 'Dear [[fullName]],\n\n' +
      '(Template for "' + params.type + '")\n\n' +
      randomDataService.getRandomParagraph() + '\n\n' +
      randomDataService.getRandomSentence() + '\n\n' +
      'Sincerely';
    var messageTemplate = { text: text };
    return [200, messageTemplate];
  };

  //shared
  var duplicateSchoolNames = randomDataService.getRandomArrayOfDataItems({ type: 'schoolName', length: randomDataService.getRandomInteger(200, 1000) });
  var schoolNames = { "schoolNames": _(duplicateSchoolNames).uniq().objectifyAll('name').value() };

  var basicLists = serverListsService.basicLists;

  //Note: url rule - all lower case, words separated with a hyphen
    $httpBackend.whenGET(/.html/).passThrough();
    $httpBackend.whenJSONP(/.json/).passThrough();
  //teachers
    $httpBackend.whenPOST('/admin/service/teachers').respond(teachersResponse);
    $httpBackend.whenPOST('/admin/service/process-teacher').respond(200, 'processed');
  //jobs
    $httpBackend.whenPOST('/admin/service/jobs').respond(jobsResponse); //returns something different each time
    $httpBackend.whenPOST('/admin/service/job').respond(jobResponse); //placeholder
  //applications
    $httpBackend.whenPOST('/admin/service/applications').respond(applicationsResponse); //can return different things, depending on options
    $httpBackend.whenPOST('/admin/service/add-application').respond(addApplicationResponse);
    $httpBackend.whenPOST('/admin/service/process-application').respond(200, 'processed');
  //settings
    $httpBackend.whenPOST('/admin/service/setting').respond(settingResponse);
    $httpBackend.whenPOST('/admin/service/process-setting').respond(200, 'processed');
  //shared
    $httpBackend.whenPOST('/admin/service/basic-lists').respond(200, basicLists);
    $httpBackend.whenPOST('/admin/service/school-names').respond(200, schoolNames);
});
