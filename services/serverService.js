app.run(function($httpBackend, $resource) {
  $httpBackend.whenGET(/partials\/.*.html/).passThrough();
  $httpBackend.whenPOST('candidates/approveCandidate').respond(200, 'approved'); //dummy response
  $httpBackend.whenPOST('candidates/declineCandidate').respond(200, 'declined'); //dummy response
  $httpBackend.whenGET('candidates').respond(200, { //dummy response
    "users": [
      {
        "id": 1,
        "fullname": "Alexis Toye",
        "url": "/teachers/1234554"
      },
      {
        "id": 2,
        "fullname": "Alex Reynolds",
        "url": "/teachers/1234555"
      },
      {
        "id": 3,
        "fullname": "Ryan Randall",
        "url": "/teachers/1234554"
      },
      {
        "id": 4,
        "fullname": "Otto Villarin",
        "url": "/teachers/1234556"
      },
      { "id": "21", "fullname": "Joe Blogs", "url": "/teachers/1234556" },
      { "id": "22", "fullname": "Jenny Blogs", "url": "/teachers/1234556" },
      { "id": "23", "fullname": "Jennifer Smithe Blogson", "url": "/teachers/1234556" },
      { "id": "24", "fullname": "Joe Bloggs", "url": "/teachers/1234556" },
      { "id": "25", "fullname": "Philip Blogs", "url": "/teachers/1234556" },
      { "id": "26", "fullname": "Joe Blogs", "url": "/teachers/1234556" },
      { "id": "27", "fullname": "Jenny Blogs", "url": "/teachers/1234556" },
      { "id": "28", "fullname": "Joe with a bizarrely long name", "url": "/teachers/1234556" },
      { "id": "29", "fullname": "Jenny Blogs", "url": "/teachers/1234556" },
      { "id": "121", "fullname": "Joe Blogs", "url": "/teachers/1234556" },
      { "id": "122", "fullname": "Jenny Blogs", "url": "/teachers/1234556" },
      { "id": "123", "fullname": "Jennifer Smithe Blogson", "url": "/teachers/1234556" },
      { "id": "124", "fullname": "Joe Bloggs", "url": "/teachers/1234556" },
      { "id": "125", "fullname": "Philip Blogs", "url": "/teachers/1234556" },
      { "id": "126", "fullname": "Joe Blogs", "url": "/teachers/1234556" },
      { "id": "127", "fullname": "Jenny Blogs", "url": "/teachers/1234556" },
      { "id": "128", "fullname": "Joe with a bizarrely long name", "url": "/teachers/1234556" },
      { "id": "129", "fullname": "Jenny Blogs", "url": "/teachers/1234556" },
      { "id": "221", "fullname": "Joe Blogs", "url": "/teachers/1234556" },
      { "id": "222", "fullname": "Jenny Blogs", "url": "/teachers/1234556" },
      { "id": "223", "fullname": "Jennifer Smithe Blogson", "url": "/teachers/1234556" },
      { "id": "224", "fullname": "Joe Bloggs", "url": "/teachers/1234556" },
      { "id": "225", "fullname": "Philip Blogs", "url": "/teachers/1234556" },
      { "id": "226", "fullname": "Joe Blogs", "url": "/teachers/1234556" },
      { "id": "227", "fullname": "Jenny Blogs", "url": "/teachers/1234556" },
      { "id": "228", "fullname": "Joe with a bizarrely long name", "url": "/teachers/1234556" },
      { "id": "229", "fullname": "Jenny Blogs", "url": "/teachers/1234556" },
      { "id": "321", "fullname": "Joe Blogs", "url": "/teachers/1234556" },
      { "id": "322", "fullname": "Jenny Blogs", "url": "/teachers/1234556" },
      { "id": "323", "fullname": "Jennifer Smithe Blogson", "url": "/teachers/1234556" },
      { "id": "324", "fullname": "Joe Bloggs", "url": "/teachers/1234556" },
      { "id": "325", "fullname": "Philip Blogs", "url": "/teachers/1234556" },
      { "id": "326", "fullname": "Joe Blogs", "url": "/teachers/1234556" },
      { "id": "327", "fullname": "Jenny Blogs", "url": "/teachers/1234556" },
      { "id": "328", "fullname": "Joe with a bizarrely long name", "url": "/teachers/1234556" },
      { "id": "329", "fullname": "Jenny Blogs", "url": "/teachers/1234556" }
    ]
  });
});
