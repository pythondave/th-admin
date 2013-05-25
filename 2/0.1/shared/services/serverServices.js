// *** IMPORTANT ***
//This file should be included in the PROTOTYPE ONLY.
//In theory it acts as the server in the absence of the server. It is a mock server.
// *** ********* ***

app.factory('delayResponseInterceptor', function($q, $timeout) {
  //Can be used to delay all mock responses by a typical (and occasionally atypical) random amount, or fail entirely at a certain rate
  var serverSpeedMultiplier = 1; //reduce during dev so things work faster (say 0.2), increase (to say 1) when demoing
  var config = { //configure special values for particular requests here
    //delayLengthMultiplier: standard random server response delay will be multiplied by this (e.g. for requests which are normally longer, say)
    //errorRate: 0: no errors; 1 error every time;
    attributeDefaults: { delayLengthMultiplier: 1, errorRate: 0 }, //these will be used if no specific value is found
    '/admin/service/candidates-to-process': { delayLengthMultiplier: 2 }, //will takes twice as long (on average)
    '/admin/service/process-candidate': { delayLengthMultiplier: 4, errorRate: 0.05 },
    '/admin/service/process-application': { delayLengthMultiplier: 4, errorRate: 0.05 }
  };
  var getConfigValue = function(requestUrl, attributeName, defaultValue) { //use to ease the process of getting config values
    defaultValue = defaultValue || config.attributeDefaults[attributeName];
    if (!config[requestUrl]) return defaultValue;
    if (!config[requestUrl][attributeName]) return defaultValue;
    return config[requestUrl][attributeName];
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

//add the above factory to the responseInterceptors - this gets called during every http request
app.config(function($httpProvider) {
  $httpProvider.responseInterceptors.unshift('delayResponseInterceptor');
});

app.factory('randomDataService', function() {
  var forenames = ['Abbie', 'Adele','Adelina','Alberta','Ali','Aliza','Alleen','Anastacia','Angelic','Angelo','Apryl','Ardelle','Arianna','Arianne','Ashlyn','Assunta','Bari','Belkis','Bell','Bobbi','Brianna','Britta','Brittney','Candice','Candyce','Carlota','Carmen','Celesta','Celia','Chrissy','Christena','Claire','Cristie','Cythia','Dario','Darline','Darren','Dave','Davis','Dawn','Daysi','Deanne','Debi','Denese','Dennise','Dewitt','Diedra','Dillon','Domenica','Eboni','Ellena','Elmo','Elvina','Emma','Emmanuel','Erminia','Ernestina','Flossie','Frances','Francoise','Fredrick','Garnet','Gilbert','Gilda','Gloria','Hershel','Imogene','Ina','Inge','Isabell','Isidro','Janine','Jarred','Javier','Jeanene','Jeanine','Jennell','Jennifer','Jin','Joanna','Joe','Joetta','Johnathon','Jolene','Joni','Jude','Justa','Karen','Kathleen','Kathline','Katlyn','Keeley','Kellie','Kenneth','Kerstin','Kimbery','Kirstin','Kristofer','Kyung','Lael','Lamonica','Lavette','Les','Lessie','Lindsey','Lisabeth','Lissa','Luigi','Lyle','Lynn','Lynsey','Malia','Malika','Manuel','Marcie','Marian','Mariann','Marianna','Marie','Mariela','Marine','Marisol','Marissa','Marquerite','Marvin','Maryann','Mathilde','Mee','Millie','Minnie','Mitch','Mohammed','Mohamed','Mohammad','Mohamad','Myrtie','Natashia','Natisha','Nilsa','Nina','Novella','Ollie','Oneida','Orlando','Pamila','Paul','Penelope','Phoebe','Phung','Rashad','Ray','Reanna','Rebbecca','Reinaldo','Renee','Rex','Rodolfo','Rory','Roselle','Rosemarie','Rosina','Roxanne','Rozella','Rudolph','Sanda','Sanjuana','Savannah','Seema','Shad','Sheba','Shemeka','Sherita','Sherlyn','Sherrie','Shon','Skye','Stephnie','Susann','Suzanne','Tari','Tawnya','Tiffanie','Tora','Tosha','Tuan','Ulrike','Ulysses','Valeria','Valery','Vannessa','Wendy','Wilbert','Wilton','Winifred','Yi','Yolanda','Yolando','Zelda','Zenobia','Zola'];
  var surnames = ['Abdallah', 'Abernethy','Alire','Allmond','Amezcua','Anaya','Antunez','Artrip','Arvie','Aust','Balliet','Barber','Berggren','Bezio','Bickley','Birkholz','Blakley','Bochenek','Bonin','Bosh','Bouska','Bowser','Brennen','Bruder','Bryne','Bunyard','Cafferty','Camp','Campos','Cannon','Carballo','Chaisson','Chapin','Cheatham','Ciotti','Clarke','Clendenin','Coloma','Courville','Crick','Cutler','Dahlke','Dally','Dangelo','Davey','Dearmond','Defalco','Delman','Derby','Domingo','Domingues','Dorfman','Draves','Drinnon','Dubiel','Easterwood','Ely','Entwistle','Evers','Febus','Fiorini','Florentino','Fromm','Ginder','Glennon','Glidewell','Godsey','Greenfield','Guidroz','Hail','Haner','Harju','Harman','Harvison','Hathcock','Hayek','Helwig','Henneman','Herdon','Hiner','Holbert','Holding','Hollie','Housley','Hudnall','Hund','Imhoff','Jessie','Judkins','Kenan','Kilbane','Kissner','Knoles','Koen','Kornfeld','Kral','Kromer','Kuhlman','Laber','Lally','Leard','Lease','Leedy','Lennox','Line','Linzy','Llanes','Lobo','Longwell','Lucas','Lunn','Maine','Manthe','Mcgarrah','Meinhardt','Millington','Mohammed','Mohamed','Mohammad','Mohamad','Molino','Naab','Nakamura','Nass','Ory','Parodi','Paschall','Pasquale','Pautz','Paz','Peralta','Persaud','Pfarr','Piccolo','Piscitelli','Pond','Prophet','Ram','Ranallo','Raya','Redfield','Reinert','Remillard','Revelle','Risko','Ritzer','Rochin','Rodriques','Rush','Saltz','Scalia','Schow','Seyfried','Seyler','Shiner','Showman','Slinkard','Smiley','Snay','Solie','Stclaire','Steenbergen','Steier','Steptoe','Stiger','Strine','Stutler','Sugarman','Sykora','Tallon','Tarpley','Taveras','Tee','Tepper','Timlin','Tomlinson','Touchton','Tower','Tubman','Ulmer','Underdahl','Vanduzer','Vannest','Vanscyoc','Vanwagenen','Vierling','Vitale','Wainscott','Wasserman','Weatherman','Weidenbach','Weinmann','Well','Whitchurch','Wigton','Witek','Woodfin','Wray','Yu','Ziemann'];
  var surnameExtensions = [' Smitheson', ' with a bizarrely long name', '-Tarquinnian', ' Davey Daveson', ' quite long'];
  var subjects = ['Archaeology','Arabic','Architecture','Art and Design','Biology','Business Studies','Careers','Chemistry','Computing','Curriculum Manager','Design & Technology','Drama','Early Years/ Kindergarten','Economics','English','English as a Foreign Language','Environmental Systems and Societies (ESS)','Food Technology','Foreign Languages','French','Geography','German','History','Humanities','Information Technology','Italian','Law','Mathematics','Mandarin','Media Studies','Middle School Generalist','Music','Librarian','Not Applicable','Pastoral Manager','Physical Education','Physics','Politics','Portuguese','Primary / Elementary','Psychology','Religious Education','Science','Senior Manager','Social Sciences','Spanish','Special Education Needs (SEN)','Supply Teacher','Teaching Assistant','TOK'];
  var roles = ['Classroom teacher','Early Years / Kindergarten Teacher','Head of Department','Primary / Elementary Teacher','Head of School','Counsellor','Curriculum Coordinator','Deputy Head / Vice Principal','Director of Studies','Educational Psychologist','English as a Foreign Language Teacher','Head of Primary / Elementary','Head of Secondary','Head of Section','Head of Year (pastoral)','IB PYP Coordinator','IB MYP Coordinator','IB DP Coordinator','Librarian','Other Position','Special Needs Teacher','Subject Leader','Teaching Assistant'];
  var positions = roles;
  var countries = ['United States','United Kingdom','Afghanistan','Albania','Algeria','American Samoa','Andorra','Angola','Anguilla','Antarctica','Antigua and Barbuda','Argentina','Armenia','Aruba','Australia','Austria','Azerbaijan','Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium','Belize','Benin','Bermuda','Bhutan','Bolivia','Bosnia and Herzegovina','Botswana','Bouvet Island','Brazil','British Indian Ocean Territory','Brunei Darussalam','Bulgaria','Burkina Faso','Burundi','Cambodia','Cameroon','Canada','Cape Verde','Cayman Islands','Central African Republic','Chad','Chile','China','Christmas Island','Cocos (Keeling) Islands','Colombia','Comoros','Congo','Congo, The Democratic Republic of The','Cook Islands','Costa Rica','Cote Divoire','Croatia','Cuba','Cyprus','Czech Republic','Denmark','Djibouti','Dominica','Dominican Republic','Ecuador','Egypt','El Salvador','Equatorial Guinea','Eritrea','Estonia','Ethiopia','Falkland Islands (Malvinas)','Faroe Islands','Fiji','Finland','France','French Guiana','French Polynesia','French Southern Territories','Gabon','Gambia','Georgia','Germany','Ghana','Gibraltar','Greece','Greenland','Grenada','Guadeloupe','Guam','Guatemala','Guinea','Guinea-bissau','Guyana','Haiti','Heard Island and Mcdonald Islands','Holy See (Vatican City State)','Honduras','Hong Kong','Hungary','Iceland','India','Indonesia','Iran, Islamic Republic of','Iraq','Ireland','Israel','Italy','Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kiribati','Korea, Democratic People Republic of','Korea, Republic of','Kuwait','Kyrgyzstan','Lao People Democratic Republic','Latvia','Lebanon','Lesotho','Liberia','Libya','Liechtenstein','Lithuania','Luxembourg','Macao','Macedonia, The Former Yugoslav Republic of','Madagascar','Malawi','Malaysia','Maldives','Mali','Malta','Marshall Islands','Martinique','Mauritania','Mauritius','Mayotte','Mexico','Micronesia, Federated States of','Moldova, Republic of','Monaco','Mongolia','Montenegro','Montserrat','Morocco','Mozambique','Myanmar','Namibia','Nauru','Nepal','Netherlands','New Caledonia','New Zealand','Nicaragua','Niger','Nigeria','Niue','Norfolk Island','Northern Mariana Islands','Norway','Oman','Pakistan','Palau','Palestinian Territory, Occupied','Panama','Papua New Guinea','Paraguay','Peru','Philippines','Pitcairn','Poland','Portugal','Puerto Rico','Qatar','Reunion','Romania','Russian Federation','Rwanda','Saint Helena','Saint Kitts and Nevis','Saint Lucia','Saint Pierre and Miquelon','Saint Vincent and The Grenadines','Samoa','San Marino','Sao Tome and Principe','Saudi Arabia','Senegal','Serbia','Seychelles','Sierra Leone','Singapore','Slovakia','Slovenia','Solomon Islands','Somalia','South Africa','South Georgia and The South Sandwich Islands','Spain','Sri Lanka','Sudan','Suriname','Svalbard and Jan Mayen','Swaziland','Sweden','Switzerland','Syrian Arab Republic','Taiwan, Province of China','Tajikistan','Tanzania, United Republic of','Thailand','Timor-leste','Togo','Tokelau','Tonga','Trinidad and Tobago','Tunisia','Turkey','Turkmenistan','Turks and Caicos Islands','Tuvalu','Uganda','Ukraine','United Arab Emirates','United States Minor Outlying Islands','Uruguay','Uzbekistan','Vanuatu','Venezuela','Viet Nam','Virgin Islands, British','Virgin Islands, U.S.','Wallis and Futuna','Western Sahara','Yemen','Zambia','Zimbabwe'];
  var schoolSuffixes = _(forenames).filter(function() { return Math.random()<0.05; });
  var twitterUsernames = ['kirkouimet','damenleeturks','calebogden','aaronbushnell','rogie','jacobseethaler','daryl','kolage','VinThomas','ShaunMoynihan','zulsdesign','nckjrvs','timothycd','motherfuton','jayrobinson','cameronmoll','jayman','danielhaim','alagoon','andrewpautler','garrettgee','blakesimkins','gilbertglee','ogvidius','manspaugh','ripplemdk','paul_irish','Anotherdagou','ryanleroux','roybarberuk','_joshnh','todd_coleman','russellsmith21','designer_dean','PtiteNoli','walterstephanie','imfine_thankyou','utroda','NastyaVZ','tiagocamargo','mikebeecham','nimaa','sajtoo','AngelZxxWingZ','ariona_rian','OskarLevinson','feliperibeiros','jonsuh','leevigraham','ryanAmurphy','jsngr','axelbouaziz','kristijantaken','decarola','iamlouisbullock','dbox','molovo','Djeje','antoniopratas','matejsudar','mkalalang','WhatTheFerguson','SiskaFlaurensia','deimler','benhowdle','mds','itolmach','MarkusOkur','ckor','Alvaro_Nistal','bradenhamm','gabediaz','ThisIsJohnBrown','benpeck','pizzulata','haibnu','JuliaYunLiu','vctrfrnndz','daniel_love','redkeg','benefritz','jpadilla_','owlfurty','eldelentes','mambows','max9xs','waqar_alamgir','sjoerd_dijkstra','CrafterSama','calvintennant','smharley','sodevious','razvantugui','FreelanceNathan','renbyrd','adn','jjmpsp','Fitehal','meghanglass','acoops_','cibawoman','iamlouisbullock','desaiguddu','brianmaloney','HugoAlbonete','macvhustle','rizwaniqbal','fabioChannel','vehbikilic','kkbethi','poopsplat','wrightmartin','JeffChausse','faridelnasire','devstrong','odaymashalla','Rafa3mil','meddeg','brampitoyo','arjunchetna','toodlenoodle','iamjamie','jcarlosweb','temonehm','gerwitz','neweravin','hvillega','mozato','alek_djuric','mcmieras','zametniy','jwphillips','Fubaruba','luhman','Betraydan','dvidsilva'];
  var applicationStatuses = ['applied', 'putForward', 'shortlisted', 'interviewed', 'offersMade', 'accepted', 'rejected'];

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
      case 'fullname': return getRandomArrayItem(forenames) + ' ' + getRandomArrayItem(surnames) + (Math.random()<0.1?getRandomArrayItem(surnameExtensions):'');
      case 'url': return '/some-url-external-to-the-dashboard/' + getRandomInteger(1000000, 10000000);
      case 'profileUrl': return '/profile-url-external-to-the-dashboard/' + getRandomInteger(1000000, 10000000);
      case 'score': return getRandomInteger(0, 10);
      case 'subject': return getRandomArrayItem(subjects);
      case 'role': return getRandomArrayItem(roles);
      case 'position': return getRandomArrayItem(positions);
      case 'school': return getRandomArrayItem(['School', 'Ecole']) + ' ' + getRandomArrayItem(['of', 'de', 'de la']) + ' ' + getRandomArrayItem(schoolSuffixes);
      case 'country': return getRandomArrayItem(countries);
      //jobs
      case 'numApplied': return getRandomInteger(0, 40);
      case 'numPutForward': return getRandomInteger(0, 20);
      case 'numShortlisted': return getRandomInteger(0, 20);
      case 'numInterviewed': return getRandomInteger(0, 20);
      case 'numOffersMade': return getRandomInteger(0, 20); //note 'Offers' not 'Offer'
      case 'numAccepted': return Math.random() < 0.2;
      case 'numRejected': return getRandomInteger(0, 20);
      case 'dateApplied': return getRandomIsoDate(offsetDateByDays(-60), offsetDateByDays(0));
      case 'datePutForward': return getRandomIsoDate(offsetDateByDays(-60), offsetDateByDays(0));
      case 'dateShortlisted': return getRandomIsoDate(offsetDateByDays(-60), offsetDateByDays(0));
      case 'dateInterviewed': return getRandomIsoDate(offsetDateByDays(-60), offsetDateByDays(0));
      case 'dateOfferMade': return getRandomIsoDate(offsetDateByDays(-60), offsetDateByDays(0)); //note 'Offer' not 'Offers'
      case 'dateAccepted': return getRandomIsoDate(offsetDateByDays(-60), offsetDateByDays(0));
      case 'dateRejected': return getRandomIsoDate(offsetDateByDays(-60), offsetDateByDays(0));
      case 'avatarUrl': return 'http://uifaces.com/faces/_twitter/' + getRandomArrayItem(twitterUsernames) + '_128.jpg';
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
  var getRandomApplication = function() {
    return {
      "id": _.uniqueId(),
      "teacher": getRandomObject(['id', 'fullname', 'profileUrl', 'score']),
      "job": getRandomObject(['id', 'subject', 'position', 'school', 'country']),
      "date": getRandomIsoDate(new Date('2013-05-01'), new Date())
    };
  };
  var getRandomApplicationForSpecificJob = function() {
    var teacher = getRandomObject(['id', 'fullname', 'avatarUrl', 'profileUrl', 'score', 'dateApplied', 'datePutForward']);
    if (Math.random() < 0.5) teacher.dateShortlisted = getRandomIsoDate(new Date(teacher.datePutForward), new Date());
    if (teacher.dateShortlisted && Math.random() < 0.5) teacher.dateInterviewed = getRandomIsoDate(new Date(teacher.dateShortlisted), new Date());
    if (teacher.dateInterviewed && Math.random() < 0.5) teacher.dateOfferMade = getRandomIsoDate(new Date(teacher.dateInterviewed), new Date());
    if (teacher.dateOfferMade && Math.random() < 0.5) teacher.dateAccepted = getRandomIsoDate(new Date(teacher.dateOfferMade), new Date());
    if (teacher.dateOfferMade && !teacher.dateAccepted && Math.random() < 0.5) teacher.dateRejected = getRandomIsoDate(new Date(teacher.dateOfferMade), new Date());

    return {
      "id": _.uniqueId(),
      "teacher": teacher,
      "date": getRandomIsoDate(new Date('2013-05-01'), new Date())
    };
  };
  var o = {};
  o.getRandomInteger = getRandomInteger;
  o.getRandomIsoDate = getRandomIsoDate;
  o.getRandomObject = getRandomObject;
  o.getRandomArrayOfObjects = getRandomArrayOfObjects;
  o.getRandomArrayOfDataItems = getRandomArrayOfDataItems;
  o.getRandomApplication = getRandomApplication;
  o.getRandomApplicationForSpecificJob = getRandomApplicationForSpecificJob;
  return o;
});

//set dummy server responses to posts and gets
app.run(function($httpBackend, $resource, $q, $timeout, randomDataService) {
  //note: $httpBackend requests are at the bottom

  //dummy responses (in the form of javascript objects)
  var positions = { "positions": [] };
  var candidatesToProcess = {
    "users": randomDataService.getRandomArrayOfObjects({ properties: ['id', 'fullname', 'profileUrl'], length: randomDataService.getRandomInteger(0, 100) })
  };

  var applicationsResponse = function(method, url, data, headers) {
    var applications;
    var params = (data ? JSON.parse(data) : undefined);
    if (!data) { applications = randomDataService.getRandomArrayOfObjects({ fn: randomDataService.getRandomApplication, length: randomDataService.getRandomInteger(0, 100) }); }
    else if (params.jobId) { applications = randomDataService.getRandomArrayOfObjects({ fn: randomDataService.getRandomApplicationForSpecificJob, length: randomDataService.getRandomInteger(0, 60) }); }
    var json = { "applications": applications };
    return [200, json];
  };

  var jobProperties = ['id', 'subject', 'position', 'numApplied', 'numPutForward', 'numShortlisted', 'numInterviewed', 'numOffersMade', 'numAccepted', 'numRejected'];
  var jobsResponse = function() {
    var jobs = {
      "jobs": randomDataService.getRandomArrayOfObjects({ properties: jobProperties, length: randomDataService.getRandomInteger(0, 30) })
    };
    return [200, jobs];
  };

  var duplicateSchools = randomDataService.getRandomArrayOfDataItems({ type: 'school', length: randomDataService.getRandomInteger(200, 1000) });
  var schools = {
    "schools": _.chain(duplicateSchools).uniq().objectifyAll('name').addUniqueIds().value()
  };

  //$httpBackend requests
  //Note: url rule - all lower case, words separated with a hyphen
  $httpBackend.whenGET(/\/.*.html/).passThrough();
  $httpBackend.whenPOST('positions').respond(200, positions);
  $httpBackend.whenPOST('/admin/service/process-candidate').respond(200, 'processed');
  $httpBackend.whenPOST('/admin/service/candidates-to-process').respond(200, candidatesToProcess);
  $httpBackend.whenPOST('/admin/service/process-application').respond(200, 'processed');
  $httpBackend.whenPOST('/admin/service/applications').respond(applicationsResponse); //can return different things, depending on options
  $httpBackend.whenPOST('/admin/service/jobs').respond(jobsResponse); //returns something different each time
  $httpBackend.whenPOST('/admin/service/schools').respond(200, schools);
});
