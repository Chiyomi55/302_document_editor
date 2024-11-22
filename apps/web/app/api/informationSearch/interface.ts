export interface ITavilyResult {
  query: string;
  results: {
    title: string;
    url: string;
    content: string;
  }[]
}

export interface IBochaaiResult {
  data: {
    webPages: {
      value:
      {
        id: string,
        name: string,
        url: string,
        snippet: string,
        summary: string,
      }[],
    }
  }
}


export interface ISearch1ApiResult {
  results: {
    link: string;
    title: string;
    snippet: string;
  }[]
}


export interface IParams {
  api_key: string;
  model: string;
  query: string;
  language: string;
  searchType?: string
}