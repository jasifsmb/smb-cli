import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { Setting } from 'src/modules/mongo/setting/entities/setting.entity';
import { User } from 'src/modules/mongo/user/entities/user.entity';
import { Role } from 'src/modules/mongo/user/role.enum';
import * as request from 'supertest';
import { AdminCred } from '../../test-credential';

describe('Setting module as Admin', () => {
  let app: INestApplication;
  const body: Partial<Setting> = {
    name: 'setting_name',
    display_name: 'Setting Name',
    value: 'Value 1',
    editable: true,
    group_id: 1,
    sort_no: 0,
    options: [],
  };
  let doc: Setting;
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
    it('/setting (getAll)', () => {
      return request(app.getHttpServer())
        .get('/setting')
        .set({ Authorization: `Bearer ${auth.token}` })
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body.data.settings)).toBeTruthy();
          expect(typeof response.body.data.offset).toBe('number');
          expect(typeof response.body.data.limit).toBe('number');
          expect(typeof response.body.data.count).toBe('number');
          doc = response.body.data.settings[0];
        });
    });

    it('/setting/:id (GetById)', () => {
      return request(app.getHttpServer())
        .get('/setting/' + doc.id)
        .set({ Authorization: `Bearer ${auth.token}` })
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
          expect(response.body.data.setting).toBeDefined();
          expect(typeof response.body.data.setting.id).toBe('string');
        });
    });

    it('/setting/:id (Update)', () => {
      return request(app.getHttpServer())
        .put('/setting/' + doc.id)
        .set('Accept', 'application/json')
        .set({ Authorization: `Bearer ${auth.token}` })
        .send(doc)
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
          expect(response.body.data.setting).toBeDefined();
          expect(typeof response.body.data.setting.id).toBe('string');
          expect(response.body.data.setting.name).toEqual(doc.name);
        });
    });

    describe('/setting (Update) - invalid properties', () => {
      const bad = {
        value: 123,
      };
      for (const prop in bad) {
        const badBody = { ...body, [prop]: bad[prop] };
        it(`[${prop}]`, () => {
          return request(app.getHttpServer())
            .put('/setting/' + doc.id)
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
