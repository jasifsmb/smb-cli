import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { User } from 'src/modules/sql/user/entities/user.entity';
import * as request from 'supertest';
import { UserCred } from '../../test-credential';

describe('User module as User', () => {
  let app: INestApplication;
  const body: Partial<User> = {
    role_id: 2,
    first_name: 'Test',
    last_name: 'User',
    email: 'test@user.com',
    phone_code: '+1',
    phone: '9999999999',
    password: '123456',
    active: true,
  };
  let auth: {
    token: string;
    token_expiry: string;
    refresh_token: string;
    user: User;
  };

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  describe('autheticate as user', () => {
    it('/auth/local (login and get token)', () => {
      return request(app.getHttpServer())
        .post('/auth/local')
        .set('Accept', 'application/json')
        .send(UserCred)
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
          expect(response.body.data);
          expect(response.body.data.token);
          expect(response.body.data.token_expiry);
          expect(response.body.data.refresh_token);
          expect(response.body.data.user);
          expect(response.body.data.user.id);
          expect(response.body.data.user.role_id).toEqual(2);
          expect(response.body.data.user.email).toEqual(UserCred.username);
          expect(response.body.data.user.password).toBeUndefined();
          auth = response.body.data;
        });
    });
  });

  describe('CRUD', () => {
    it('/user/me (UserMe)', () => {
      return request(app.getHttpServer())
        .get('/user/me')
        .set({ Authorization: `Bearer ${auth.token}` })
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
          expect(response.body.data.user).toBeDefined();
          expect(typeof response.body.data.user.id).toBe('number');
          expect(response.body.data.user.role_id).toEqual(auth.user.role_id);
          expect(response.body.data.user.email).toEqual(auth.user.email);
          expect(response.body.data.user.password).toBeUndefined();
        });
    });

    it('/user (Create)', () => {
      return request(app.getHttpServer())
        .post('/user')
        .set('Accept', 'application/json')
        .set({ Authorization: `Bearer ${auth.token}` })
        .send(body)
        .expect('Content-Type', /json/)
        .expect(403);
    });

    it('/user (getAll)', () => {
      return request(app.getHttpServer())
        .get('/user')
        .set({ Authorization: `Bearer ${auth.token}` })
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body.data.users)).toBeTruthy();
          expect(typeof response.body.data.offset).toBe('number');
          expect(typeof response.body.data.limit).toBe('number');
          expect(typeof response.body.data.count).toBe('number');
        });
    });

    it('/user/:id (Update)', () => {
      return request(app.getHttpServer())
        .put('/user/' + 1)
        .set('Accept', 'application/json')
        .set({ Authorization: `Bearer ${auth.token}` })
        .send({})
        .expect('Content-Type', /json/)
        .expect(403);
    });

    describe('/user (Create) - required properties missing', () => {
      const required = [
        'first_name',
        'last_name',
        'email',
        'phone_code',
        'phone',
        'password',
      ];
      for (let index = 0; index < required.length; index++) {
        const field = required[index];
        const badUser = { ...body, [field]: undefined };
        it(`[${field}]`, () => {
          return request(app.getHttpServer())
            .post('/user')
            .set('Accept', 'application/json')
            .set({ Authorization: `Bearer ${auth.token}` })
            .send(badUser)
            .expect('Content-Type', /json/)
            .expect(403);
        });
      }
    });

    describe('/user (Create) - invalid properties', () => {
      const bad = {
        first_name: 123,
        last_name: 123,
        email: '123',
        phone_code: false,
        phone: 999,
        password: '45',
      };
      for (const prop in bad) {
        const badUser = { ...body, [prop]: bad[prop] };
        it(`[${prop}]`, () => {
          return request(app.getHttpServer())
            .post('/user')
            .set('Accept', 'application/json')
            .set({ Authorization: `Bearer ${auth.token}` })
            .send(badUser)
            .expect('Content-Type', /json/)
            .expect(403);
        });
      }
    });

    it('/user/:id (Delete)', () => {
      return request(app.getHttpServer())
        .delete('/user/' + 1)
        .set({ Authorization: `Bearer ${auth.token}` })
        .expect('Content-Type', /json/)
        .expect(403);
    });

    it('/user/:id (Hard Delete)', () => {
      return request(app.getHttpServer())
        .delete('/user/' + 1 + '?mode=hard')
        .set({ Authorization: `Bearer ${auth.token}` })
        .expect('Content-Type', /json/)
        .expect(403);
    });
  });

  describe('logout', () => {
    it('/auth/logout (logout)', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Accept', 'application/json')
        .set({ Authorization: `Bearer ${auth.token}` })
        .send({})
        .expect('Content-Type', /json/)
        .expect(200);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
