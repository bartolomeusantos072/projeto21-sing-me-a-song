import supertest from 'supertest'
import app from '../../src/app'
import { prisma } from '../../src/database';
import * as recommendationsFactory from '../factories/recommendationsFactory';


const recommendationsMethod = supertest(app)

beforeEach(async () => {
    await prisma.$queryRaw`TRUNCATE TABLE "recommendations"`
});

describe('POST /recommendations', () => {
    it('Recommendation with sucess - 201', async () => {
        const { name, youtubeLink } = await recommendationsFactory.createRecommendation()
        const recommendation = { name, youtubeLink };
        const response = await recommendationsMethod.post('/recommendations').send({
            name,
            youtubeLink
        });

        expect(response.statusCode).toBe(201);
        expect(recommendation).not.toBeNull();

    }, 10000)
    it("Recommendation with Unprocessable Entity - 422 ", async () => {
        const response = await recommendationsMethod.post('/recommendations').send({})
        expect(response.statusCode).toEqual(422)
    }, 9500)
})

describe('downvote', () => {
    it('should give a downvote in a recommendation', async () => {
        const recommendation = await recommendationsFactory.createRecommendation()
        const { id } = await recommendationsFactory.createDataRecommendation(recommendation);

        const response = await recommendationsMethod.post(`/recommendations/${id}/downvote`)

        const result = await recommendationsFactory.findUniqueById(id)

        expect(response.status).toEqual(200)
        expect(result).toEqual(-1)
    }, 11000)
    it('should delete the recommendation after score less than -7', async () => {
        const amount = 7
        const recommendation = await recommendationsFactory.createRecommendation()
        const { id } = await recommendationsFactory.createDataRecommendation(recommendation);

        for (let i = 0; i <= amount; i++) {
            await recommendationsMethod.post(`/recommendations/${id}/downvote`)
        }

        const response = await recommendationsFactory.findUniqueById(id)

        expect(response).toEqual(null)
    }, 10500)
})

describe('/GET, /recommendations', () => {
    it('should return 10 recommendations', async () => {
        await recommendationsFactory.insertManyRecommendations(10)

        const response = await recommendationsMethod.get('/recommendations')

        expect(response.body.length).toEqual(10)
    },13000)
    it('should return last 10 recommendations', async () => {
        await recommendationsFactory.insertManyRecommendations(5)

        const response = await recommendationsMethod.get('/recommendations')

        expect(response.body).toBeTruthy()
    },12600)
})

describe('/GET, /recommendations/:id', () => {
    it('should return recommendation by id', async () => {
        const recommendation = await recommendationsFactory.createRecommendation()
        const { id } = await recommendationsFactory.createDataRecommendation(recommendation);

        const response = await recommendationsMethod.get(`/recommendations/${id}`)

        expect(response.body).toHaveProperty('name')
        expect(response.body.id).toEqual(id)
    },6000)
})

describe('/GET, /recommendations/random', () => {
  it('should return status code 404 with no recommendations', async () => {
    const response = await supertest(app).get('/recommendations/random')
    expect(response.status).toEqual(404)
  })
  it('should return a random recommendation', async () => {
    await recommendationsFactory.insertManyRecommendations(10)
    const firstRecommendation = await recommendationsMethod.get(`/recommendations/random`)
    expect(firstRecommendation.body).toHaveProperty('name')
  },13500)
})
 
describe('GET /recommendations/top/:amount', () => {
  it('should return top recommendations', async () => {
    const amount = 20
    await recommendationsFactory.insertManyRecommendations(10)
    const response = await recommendationsMethod.get(
      `/recommendations/top/${amount}`
    )

    expect(response.body.length).toEqual(amount)
    expect(response.body[0].score).toBeGreaterThanOrEqual(
      response.body[1].score
    )
  },14000)
})

afterAll(async () => {
    await prisma.$disconnect()
})