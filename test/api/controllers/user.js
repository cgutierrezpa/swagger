var should = require('should');
var request = require('supertest');
var server = require('../../../server');

describe('controllers', function() {

  describe('user', function() {

    describe('POST /user', function() {
      this.timeout(15000);
      it('should return a registration token', function(done) {
        setTimeout(done, 15000);

        let user = {
          "tx_email": "rubenlopezlozoya12@gmail.com",
          "tx_name": "Ruben",
          "tx_password": "Ruben1234",
          "tx_gender": "M",
          "dt_birthday": "1993-04-08T22:00:00.000Z",
          "fk_place": 1
        }

        request(server)
        .post('/user')
        .set('Accept', 'application/json')
        .send(user)
        .expect('Content-Type', /json/)
        .expect(200)
          /* When there is a parse error spotted by Swagger, the test will prompt a "Double callback!" error. This is because
          the callback is called by the parser, and execution continues in .end, which calls agains the callback */
          .end(function(err, res) {
            if (err) return done(err);

            res.body.should.have.property('token').which.is.a.String();

            done();
          });
        });
/*
    EXAMPLE OF GET TEST

      it('should accept a name parameter', function(done) {

        request(server)
          .get('/hello')
          .query({ name: 'Scott'})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            should.not.exist(err);

            res.body.should.eql('Hello, Scott!');

            done();
          });
      });
      */
    });

  });

});
