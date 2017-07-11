var should = require('should');
var request = require('supertest');
var server = require('../../../server');

describe('controllers', function() {

  describe('service', function() {

    describe('POST /service', function() {

      it('should return a service ID', function(done) {

        let service = {
          "tx_cif": "Supertest",
          "tx_name": "Supertest Swagger",
          "fk_provider": 1,
          "fk_headquarters": 1,
          "url_main_image": "Supertest"
        }

        request(server)
          .post('/service')
          .set('Accept', 'application/json')
          .send(service)
          .expect('Content-Type', /json/)
          .expect(200)
          /* When there is a parse error spotted by Swagger, the test will prompt a "Double callback!" error. This is because
          the callback is called by the parser, and execution continues in .end, which calls agains the callback */
          .end(function(err, res) {
            should.not.exist(err);

            res.body.should.have.property('serviceId').which.is.a.Number();
            res.body.serviceId.should.not.equal(0);

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
