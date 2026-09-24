import { cleanupTestData } from '../../support/api/cleanup';
import { createUser, getUser, login } from '../../support/api/users';
import { buildUser } from '../../support/factories/dataFactory';

describe('API | Users and authentication', () => {
  let user;

  afterEach(() => cleanupTestData({ users: [user] }));

  it('registers a new user who can then log in and receive a Bearer JWT', () => {
    const payload = buildUser();

    createUser(payload)
      .then(({ status, body }) => {
        expect(status).to.eq(201);
        expect(body.message).to.eq('Cadastro realizado com sucesso');
        expect(body._id).to.be.a('string').and.not.be.empty;
        user = { ...payload, _id: body._id };

        return login(payload);
      })
      .then(({ status, body }) => {
        expect(status).to.eq(200);
        expect(body.message).to.eq('Login realizado com sucesso');
        expect(body.authorization).to.match(/^Bearer [\w-]+\.[\w-]+\.[\w-]+$/);

        return getUser(user._id);
      })
      .then(({ status, body }) => {
        expect(status).to.eq(200);
        expect(body).to.include({
          _id: user._id,
          nome: payload.nome,
          email: payload.email,
          administrador: 'false',
        });
      });
  });
});
