import ky from "ky";

// Search for images
export const onSearchImage = async (params: { searchType: string, api_key: string, query: string }) => {
    const listResult: { images: string[] } = await ky(`${process.env.NEXT_PUBLIC_API_URL}/search1api/search`, {
        method: 'post',
        headers: { Authorization: `Bearer ${params.api_key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: params.query, max_results: 50, search_service: params.searchType.toLowerCase(), image: true }),
        timeout: false
    }).then(res => res.json());
    let images = [];
    if (listResult?.images) {
        images = listResult?.images;
    }
    return images;
}

export const generate = async (type = 'Ideogram 2.0', api_key: string, size: string, params: { aspect_ratio: string, prompt: string }) => {
    if (type === "Flux-1.1-pro") {
        return await generateFluxPro(api_key, size, { ...params });
    }
    if (type === "Flux-1-dev") {
        return await generateFluxDev(api_key, size, { ...params });
    }
    if (type === "Flux-1-schnell") {
        return await generateFluxSchnell(api_key, size, { ...params });
    }
    if (type === "Ideogram 2.0") {
        return await generateIdeogram(api_key, size, { ...params });
    }
}

// 'Flux-1.1-pro',
const generateFluxPro = async (api_key: string, size: string, params: { prompt: string, image_size?: { width: number, height: number } }) => {
    const body = { ...params };
    if (size !== 'auto') {
        const image_size = fluxSize(size);
        body.image_size = image_size;
    }
    const illustration: { images: [{ url: string }] } = await ky(`${process.env.NEXT_PUBLIC_API_URL}/302/submit/flux-pro-v1.1`, {
        method: 'post',
        headers: {
            Authorization: `Bearer ${api_key}`,
            "User-Agent": "Apifox/1.0.0 (https://apifox.com)",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ ...body }),
        timeout: false
    }).then(res => res.json())
    if (illustration?.images[0]?.url) {
        return { data: illustration?.images }
    }
    return illustration;
}
// Flux-1-dev  
const generateFluxDev = async (api_key: string, size: string, params: { prompt: string, image_size?: { width: number, height: number } }) => {
    const body = { ...params };
    if (size !== 'auto') {
        const image_size = fluxSize(size);
        body.image_size = image_size;
    }
    const illustration: { images: [{ url: string }] } = await ky(`${process.env.NEXT_PUBLIC_API_URL}/302/submit/flux-dev`, {
        method: 'post',
        headers: {
            Authorization: `Bearer ${api_key}`,
            "User-Agent": "Apifox/1.0.0 (https://apifox.com)",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ ...body }),
        timeout: false
    }).then(res => res.json())
    if (illustration?.images[0]?.url) {
        return { data: illustration?.images }
    }
    return illustration;
}
// Flux-1-schnell
const generateFluxSchnell = async (api_key: string, size: string, params: { prompt: string, image_size?: { width: number, height: number } }) => {
    const body = { ...params };
    if (size !== 'auto') {
        const image_size = fluxSize(size);
        body.image_size = image_size;
    }
    const illustration: { images: [{ url: string }] } = await ky(`${process.env.NEXT_PUBLIC_API_URL}/302/submit/flux-schnell`, {
        method: 'post',
        headers: {
            Authorization: `Bearer ${api_key}`,
            "User-Agent": "Apifox/1.0.0 (https://apifox.com)",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ ...body }),
        timeout: false
    }).then(res => res.json())
    if (illustration?.images[0]?.url) {
        return { data: illustration?.images }
    }
    return illustration;
}

// Ideogram 2.0 
const generateIdeogram = async (api_key: string, size: string, params: { prompt: string, aspect_ratio: string }) => {
    const illustration = await ky(`${process.env.NEXT_PUBLIC_API_URL}/ideogram/generate`, {
        method: 'post',
        headers: {
            Authorization: `Bearer ${api_key}`,
            "User-Agent": "Apifox/1.0.0 (https://apifox.com)",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ "image_request": { ...params, aspect_ratio: size === 'auto' ? params.aspect_ratio : size } }),
        timeout: false
    }).then(res => res.json())
    return illustration;
}

const fluxSize = (type: string) => {
    switch (type) {
        case '1:1':
            return { width: 1024, height: 1024 }
        case '2:3':
            return { width: 836, height: 1254 }
        case '3:2':
            return { width: 1254, height: 836 }
        case '3:4':
            return { width: 887, height: 1182 }
        case '4:3':
            return { width: 1182, height: 887 }
        case '9:16':
            return { width: 768, height: 1365 }
        case '16:9':
            return { width: 1365, height: 768 }
    }
}