import { prisma } from '../../src/database';
import { CreateRecommendationData } from '../../src/services/recommendationsService';
import { getRandomMusicVideoUrl, getRandomNameMusicYtb } from "./myMaker";
import { faker } from '@faker-js/faker';
interface Recommendation {
    name: string;
    youtubeLink: string;
    score?: number;
}


  
export async function createRecommendation() {

    const youtubeLink = await getRandomMusicVideoUrl(true);
    const name = await getRandomNameMusicYtb(youtubeLink)
    const recommendation:Recommendation = {
        name,
        youtubeLink,
        
    }

    return recommendation;
}

export async function createDataRecommendation(recommendation: CreateRecommendationData) {
    const recommendationCreated = await prisma.recommendation.create({
        data: {
            ...recommendation,
        }
    });
    return recommendationCreated;
}

export async function insertManyRecommendations(number: number) {
    const recommendations = [];
    for (let i = 0; i < number; i++) {
        const recommendation = await createRecommendation();
        recommendations.push({...recommendation,score:0});
    }

    const recommendationsCreated = await prisma.recommendation.createMany({
        data: recommendations
    });
}

export async function updateScore(id: number) {
    const score = Math.floor(Math.random() * 100);
    const recommendation = await prisma.recommendation.update({
        where: {
            id
        },
        data: {
            score
        }
    });
    return recommendation;
}
export async function findUniqueById(id: number) {
    if (
      !(await prisma.recommendation.findUnique({
        where: { id },
      }))
    )
      return null
    const { score } = await prisma.recommendation.findUnique({
      where: { id },
    })
  
    return score
  }

export async function verifyRecommendation(name: string) {
    const recommendation = await prisma.recommendation.findFirst({
        where: {
            name
        }
    });

    return recommendation;
}