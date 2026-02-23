import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '@src/app.module';
import { Types } from 'mongoose';
import { ProgressStatus } from '@src/module-progress/entities/module-progress.entity';

describe('ModuleProgressController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }));
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('/module-progress/:moduleId (POST)', () => {
        let moduleId: string;
        let apprenantId: string;
        let enrollmentId: string;

        beforeEach(() => {
            moduleId = new Types.ObjectId().toHexString();
            apprenantId = new Types.ObjectId().toHexString();
            enrollmentId = new Types.ObjectId().toHexString();
        });

        it('should create new progress with NOT_STARTED status', async () => {
            const payload = {
                apprenantId,
                enrollmentId,
                progressPercentage: 0,
                status: ProgressStatus.NOT_STARTED,
                isLocked: true,
            };

            const response = await request(app.getHttpServer())
                .post(`/module-progress/${moduleId}`)
                .send(payload)
                .expect(201);

            expect(response.body.status).toBe(ProgressStatus.NOT_STARTED);
            expect(response.body.progressPercentage).toBe(0);
            expect(response.body.isLocked).toBe(true);
        });

        it('should update existing progress to COMPLETED and set completedAt', async () => {
            // 1. Initial creation
            await request(app.getHttpServer())
                .post(`/module-progress/${moduleId}`)
                .send({
                    apprenantId,
                    enrollmentId,
                    progressPercentage: 50,
                    status: ProgressStatus.IN_PROGRESS,
                    isLocked: false,
                })
                .expect(201);

            // 2. Update to completed
            const response = await request(app.getHttpServer())
                .post(`/module-progress/${moduleId}`)
                .send({
                    apprenantId,
                    enrollmentId,
               progressPercentage: 100,
                    status: ProgressStatus.COMPLETED,
                    isLocked: false,
                })
                .expect(201);

            expect(response.body.status).toBe(ProgressStatus.COMPLETED);
            expect(response.body.progressPercentage).toBe(100);
            expect(response.body.completedAt).toBeDefined();
            expect(new Date(response.body.completedAt).getTime()).toBeLessThanOrEqual(Date.now());
        });

        it('should be idempotent (multiple updates to same document)', async () => {
            const payload = {
                apprenantId,
                enrollmentId,
                progressPercentage: 10,
                status: ProgressStatus.IN_PROGRESS,
                isLocked: false,
            };


            await request(app.getHttpServer()).post(`/module-progress/${moduleId}`).send(payload).expect(201);
            await request(app.getHttpServer()).post(`/module-progress/${moduleId}`).send({ ...payload, progressPercentage: 20 }).expect(201);
            const finalResponse = await request(app.getHttpServer()).post(`/module-progress/${moduleId}`).send({ ...payload, progressPercentage: 30 }).expect(201);

            expect(finalResponse.body.progressPercentage).toBe(30);

            const getResponse = await request(app.getHttpServer())
                .get(`/module-progress/${moduleId}/${apprenantId}`)
                .expect(200);

            expect(getResponse.body.progressPercentage).toBe(30);
        });

        it('should reject progressPercentage < 0', async () => {
            const payload = {
                apprenantId,
                enrollmentId,
                progressPercentage: -1,
                status: ProgressStatus.IN_PROGRESS,
                isLocked: false,
            };

            await request(app.getHttpServer())
                .post(`/module-progress/${moduleId}`)
                .send(payload)
                .expect(400);
        });

        it('should reject progressPercentage > 100', async () => {
            const payload = {
                apprenantId,
                enrollmentId,
                progressPercentage: 101,
                status: ProgressStatus.IN_PROGRESS,
                isLocked: false,
            };

            await request(app.getHttpServer())
                .post(`/module-progress/${moduleId}`)
                .send(payload)
                .expect(400);
        });

        it('should return 400 if IDs are invalid', async () => {
            const payload = {
                apprenantId: 'invalid',
                enrollmentId: enrollmentId,
                progressPercentage: 50,
                status: ProgressStatus.IN_PROGRESS,
                isLocked: false,
            };

            await request(app.getHttpServer())
                .post(`/module-progress/${moduleId}`)
                .send(payload)
                .expect(400);
        });
    });

    describe('/module-progress/:moduleId/:apprenantId (GET)', () => {
        it('should retrieve existing progress', async () => {
            const moduleId = new Types.ObjectId().toHexString();
            const apprenantId = new Types.ObjectId().toHexString();
            const enrollmentId = new Types.ObjectId().toHexString();

            await request(app.getHttpServer())
                .post(`/module-progress/${moduleId}`)
                .send({
                    apprenantId,
                    enrollmentId,
                    progressPercentage: 75,
                    status: ProgressStatus.IN_PROGRESS,
                    isLocked: false,
                })
                .expect(201);

            const response = await request(app.getHttpServer())
                .get(`/module-progress/${moduleId}/${apprenantId}`)
                .expect(200);

            expect(response.body.progressPercentage).toBe(75);
            expect(response.body.moduleId).toBe(moduleId);
        });

        it('should not crossover data between users', async () => {
            const moduleId = new Types.ObjectId().toHexString();
            const user1 = new Types.ObjectId().toHexString();
            const user2 = new Types.ObjectId().toHexString();
            const enrollmentId = new Types.ObjectId().toHexString();

            await request(app.getHttpServer())
                .post(`/module-progress/${moduleId}`)
                .send({ apprenantId: user1, enrollmentId, progressPercentage: 10, status: ProgressStatus.IN_PROGRESS, isLocked: false })
                .expect(201);

            await request(app.getHttpServer())
                .post(`/module-progress/${moduleId}`)
                .send({ apprenantId: user2, enrollmentId, progressPercentage: 90, status: ProgressStatus.IN_PROGRESS, isLocked: false })
                .expect(201);

            const res1 = await request(app.getHttpServer()).get(`/module-progress/${moduleId}/${user1}`).expect(200);
            const res2 = await request(app.getHttpServer()).get(`/module-progress/${moduleId}/${user2}`).expect(200);

            expect(res1.body.progressPercentage).toBe(10);
            expect(res2.body.progressPercentage).toBe(90);
        });

        it('should return 400 for invalid IDs', async () => {
            await request(app.getHttpServer())
                .get('/module-progress/invalid/invalid')
                .expect(400);
        });
    });

    describe('General Error Handling', () => {
        it('should return 404 for a non-existent route', async () => {
            await request(app.getHttpServer())
                .get('/module-progress/this/route/does/not/exist')
                .expect(404);
        });

        it('should return 404 for a wrong method on existing route', async () => {
            const moduleId = new Types.ObjectId().toHexString();
            const apprenantId = new Types.ObjectId().toHexString();

            await request(app.getHttpServer())
                .patch(`/module-progress/${moduleId}/${apprenantId}`)
                .expect(404);
        });
    });
});
