export class QA {
    _id: string;
    question: string;
    answer: string;
    urls: Array<string>;
    likes: number;
    dislikes: number;
}

export class Synonym {
    word: string;
    count: number;
    references: Array<string>;
}