
import OpenAI from 'npm:openai';

import Model from './AiModel.js';

export class Provider {

    constructor({baseURL, apiKey}) {

        this.client = new OpenAI({
            baseURL,
            apiKey,
            //defaultHeaders: { 'HTTP-Referer': '<YOUR_SITE_URL>', 'X-Title': '<YOUR_SITE_NAME>',}, // Optional. Site URL for rankings on openrouter.ai
        });

    }

    model(id) {
        return new Model(this, id);
    }

}


