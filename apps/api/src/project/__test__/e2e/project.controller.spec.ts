import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ProjectController } from '../../http/rest/project.controller';

describe('ProjectController (e2e)', () => {
	let app: INestApplication;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [],
			controllers: [ProjectController],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	it('Test Project', () => {
		expect(1).toBe(1)
	})
});
