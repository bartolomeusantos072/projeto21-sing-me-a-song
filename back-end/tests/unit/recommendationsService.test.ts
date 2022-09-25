import { jest } from "@jest/globals";
import { faker } from '@faker-js/faker';
import { recommendationRepository } from "../../src/repositories/recommendationRepository";
import { CreateRecommendationData, recommendationService } from "../../src/services/recommendationsService";

import * as recommendationsFactory from '../factories/recommendationsFactory';


jest.mock("./../../src/repositories/recommendationRepository");

beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
});

describe(" tests suites", () => {

    test("Criar conjuntos de recomendações", async () => {

        jest.spyOn(recommendationRepository, "findByName").mockImplementationOnce((): any => { })
        jest.spyOn(recommendationRepository, "create").mockImplementationOnce((): any => { })

        const recommendation: CreateRecommendationData = await recommendationsFactory.createRecommendation();
        await recommendationService.insert(recommendation);
        expect(recommendationRepository.findByName).toBeCalled();
    });

    test("não deveria criar recomendação duplicada", async () => {

        const recommendation = await recommendationsFactory.createRecommendation();
        
        jest.spyOn(recommendationRepository, "findByName").mockImplementationOnce((): any => true);

        expect(recommendationService.insert(recommendation)).rejects.toEqual(
            { message: "Recommendations names must be unique", type: "conflict" }

        );
        expect(recommendationRepository.findByName).toHaveBeenCalledWith(recommendation.name);
        expect(recommendationRepository.findByName).toHaveBeenCalledTimes(1)

    });

});

describe("Upvote tests suites", () => {

    test("Should upvote a recommendation", async () => {
        const recommendation = await recommendationsFactory.createRecommendation();
        const recommendationData = { id: 1, ...recommendation, score: 0 }

        jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(recommendationData);

        jest.spyOn(recommendationRepository, "updateScore").mockImplementationOnce((): any => { });

        await recommendationService.upvote(recommendationData.id);

        expect(recommendationRepository.find).toBeCalledTimes(1);
        expect(recommendationRepository.updateScore).toHaveBeenCalledTimes(1)
    }, 10000);

    test("Should not upvote a recommendation if it does not exist", async () => {

        jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(null);

        expect(recommendationService.upvote(1)).rejects.toEqual(
            { message: "", type: "not_found" }
        );
    });
});

describe("downvote tests", () => {

    test("Should downvote a recommendation", async () => {
        const recommendation = await recommendationsFactory.createRecommendation();
        const recommendationData = { id: 1, ...recommendation, score: 0 }

        jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(recommendationData);

        jest.spyOn(recommendationRepository, "updateScore").mockImplementation((): any => { return { ...recommendationData, score: -1 } });

        await recommendationService.downvote(recommendationData.id);

        expect(recommendationRepository.find).toBeCalledTimes(1);
        expect(recommendationRepository.updateScore).toHaveBeenCalledTimes(1)
    }, 10000);

    test("Should remove a recommendation who has a score less than -10", async () => {
        const recommendation1 = await recommendationsFactory.createRecommendation();
        const recommendationData = { ...recommendation1, id: 1, score: -10 }

        jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(recommendationData);

        jest.spyOn(recommendationRepository, "updateScore").mockImplementation((): any => { return { ...recommendationData, score: -11 } });

        jest.spyOn(recommendationRepository, "remove").mockImplementation((): any => { });

        await recommendationService.downvote(recommendationData.id);

        expect(recommendationRepository.find).toBeCalledTimes(1);
        expect(recommendationRepository.updateScore).toBeCalledTimes(1);
        expect(recommendationRepository.remove).toHaveBeenCalledTimes(1)
    }
    );

    test("Should not downvote a recommendation if it does not exist", async () => {
        jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(null);

        expect(recommendationService.downvote(1)).rejects.toEqual(
            { message: "", type: "not_found" }
        );
    }
    );
});

describe("Get top amount recommendations tests", () => {

    test("Should return a list of amount recommendations", async () => {
        const recommendationsTopList = [];
        const amountRecommendations = Number(faker.random.numeric());

        for (let i = 0; i < amountRecommendations; i++) {
            const recommendation = await recommendationsFactory.createRecommendation();
            recommendationsTopList.push(recommendation);
        };

        jest.spyOn(recommendationRepository, "getAmountByScore").mockResolvedValueOnce(recommendationsTopList)

        const response = await recommendationService.getTop(amountRecommendations);

        expect(response).toEqual(recommendationsTopList);
        expect(recommendationRepository.getAmountByScore).toHaveBeenCalledTimes(1);
    })
});

describe("Get recommendations tests suites", () => {
    test("Should return a random recommendation with a score greater than 10", async () => {
        jest.spyOn(Math, "random").mockReturnValueOnce(0.6);

        const recommendation1 = await recommendationsFactory.createRecommendation();
        const recommendation2 = await recommendationsFactory.createRecommendation();

        const recommendationData1 = { id: 1, ...recommendation1, score: 11 }
        const recommendationData2 = { id: 2, ...recommendation2, score: 9 }

        jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce(
            (filter): any => {
                const { score, scoreFilter } = filter;
                if (scoreFilter === "gt") return [recommendationData1];
                if (scoreFilter === "lte") return [recommendationData2];
            }
        );
        const response = await recommendationService.getRandom();

        expect(response).toEqual(recommendationData1);
        expect(recommendationRepository.findAll).toHaveBeenCalledTimes(1);
    }
    );

    test("error notfound in get random", async () => {
        jest
            .spyOn(recommendationRepository, "findAll")
            .mockResolvedValue([]);

        const result = recommendationService.getRandom();

        expect(result).rejects.toHaveProperty("type", "not_found");
        expect(recommendationRepository.findAll).toBeCalled();
    });

}
);


