import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { Role } from 'src/modules/mongo/user/role.enum';
import { Page } from 'src/modules/sql/page/entities/page.entity';
import { User } from 'src/modules/sql/user/entities/user.entity';
import * as request from 'supertest';
import { UserCred } from '../../test-credential';

describe('Page module as User', () => {
  let app: INestApplication;
  const body: Partial<Page> = {
    name: 'page_test',
    title: 'Test Page',
    content: 'Page content',
    allow_html: true,
  };
  let doc: Page;
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
          expect(response.body.data.user.role).toEqual(Role.User);
          expect(response.body.data.user.email).toEqual(UserCred.username);
          expect(response.body.data.user.password).toBeUndefined();
          auth = response.body.data;
        });
    });
  });

  describe('CRUD', () => {
    it('/page (Create)', () => {
      return request(app.getHttpServer())
        .post('/page')
        .set('Accept', 'application/json')
        .set({ Authorization: `Bearer ${auth.token}` })
        .send(body)
        .expect('Content-Type', /json/)
        .expect(403);
    });

    it('/page (getAll)', () => {
      return request(app.getHttpServer())
        .get('/page')
        .set({ Authorization: `Bearer ${auth.token}` })
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body.data.pages)).toBeTruthy();
          expect(typeof response.body.data.offset).toBe('number');
          expect(typeof response.body.data.limit).toBe('number');
          expect(typeof response.body.data.count).toBe('number');
          doc = response.body.data.pages[0];
        });
    });

    it('/page/:id (GetById)', () => {
      return request(app.getHttpServer())
        .get('/page/' + doc.id)
        .set({ Authorization: `Bearer ${auth.token}` })
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
          expect(response.body.data.page).toBeDefined();
          expect(typeof response.body.data.page.id).toBe('string');
        });
    });

    it('/page/:id (Update)', () => {
      return request(app.getHttpServer())
        .put('/page/' + doc.id)
        .set('Accept', 'application/json')
        .set({ Authorization: `Bearer ${auth.token}` })
        .send({})
        .expect('Content-Type', /json/)
        .expect(403);
    });

    it('/page/:id (Delete)', () => {
      return request(app.getHttpServer())
        .delete('/page/' + doc.id)
        .set({ Authorization: `Bearer ${auth.token}` })
        .expect('Content-Type', /json/)
        .expect(403);
    });

    it('/page/:id (Hard Delete)', () => {
      return request(app.getHttpServer())
        .delete('/page/' + doc.id + '?mode=hard')
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
