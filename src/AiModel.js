

export class Model {

    constructor(provider, id) {
        this.provider = provider;
        this.id = id;
    }

    async complete({messages, temperature=0.5}) {
        const completion = await this.provider.client.complete({
            model: this.id,
            messages,
            temperature
        });
        return completion.choices[0].message.content;
    }

}