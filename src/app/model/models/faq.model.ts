import { PagingDto } from "@model/Utils/PagingDto"

export interface FAQ {
    id: number
    questionEn: string
    questionAr: string
    answerEn: string
    answerAr: string
}

export interface FAQDTo {
    id: number;
    content: FAQ[];
    pageable: PagingDto;
    totalPages: number;
    totalElements: number;
    numberOfElements: number;
  }