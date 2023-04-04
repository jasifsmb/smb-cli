import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { Template } from 'src/modules/sql/template/entities/template.entity';
import { User } from 'src/modules/sql/user/entities/user.entity';
import { Role } from 'src/modules/sql/user/role.enum';
import * as request from 'supertest';
import { AdminCred } from '../../test-credential';

describe('Template module as Admin', () => {
  let app: INestApplication;
  const body: Partial<Template> = {
    name: 'setting_name',
    title: 'Setting Name',
    send_email: true,
    email_body: 'email body',
    email_subject: 'email subject',
    send_sms: false,
    sms_body: '',
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

  describe('autheticate as admin', () => {
    it('/auth/local (login and get token)', () => {
      return request(app.getHttpServer())
        .post('/auth/local')
        .set('Accept', 'application/json')
        .send(AdminCred)
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
          expect(response.body.data);
          expect(response.body.data.token);
          expect(response.body.data.token_expiry);
          expect(response.body.data.refresh_token);
          expect(response.body.data.user);
          expect(response.body.data.user.id);
          expect(response.body.data.user.role).toEqual(Role.Admin);
          expect(response.body.data.user.email).toEqual(AdminCred.username);
          expect(response.body.data.user.password).toBeUndefined();
          auth = response.body.data;
        });
    });
  });

  describe('CRUD', () => {
    it('/template (getAll)', () => {
      return request(app.getHttpServer())
        .get('/template')
        .set({ Authorization: `Bearer ${auth.token}` })
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body.data.templates)).toBeTruthy();
          expect(typeof response.body.data.offset).toBe('number');
          expect(typeof response.body.data.limit).toBe('number');
          expect(typeof response.body.data.count).toBe('number');
        });
    });

    it('/template/:id (GetById)', () => {
      return request(app.getHttpServer())
        .get('/template/' + 1)
        .set({ Authorization: `Bearer ${auth.token}` })
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
          expect(response.body.data.template).toBeDefined();
          expect(typeof response.body.data.template.id).toBe('number');
        });
    });

    it('/template/:id (Update)', () => {
      return request(app.getHttpServer())
        .put('/template/' + 1)
        .set('Accept', 'application/json')
        .set({ Authorization: `Bearer ${auth.token}` })
        .send(body)
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
          expect(response.body.data.template).toBeDefined();
          expect(typeof response.body.data.template.id).toBe('number');
          expect(response.body.data.template.name).toEqual(body.name);
        });
    });

    describe('/template (Update) - invalid properties', () => {
      const bad = {
        name: true,
        send_email: null,
        send_push: null,
      };
      for (const prop in bad) {
        const badBody = { [prop]: bad[prop] };
        it(`[${prop}]`, () => {
          return request(app.getHttpServer())
            .put('/template/' + 1)
            .set('Accept', 'application/json')
            .set({ Authorization: `Bearer ${auth.token}` })
            .send(badBody)
            .expect('Content-Type', /json/)
            .expect(400);
        });
      }
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
