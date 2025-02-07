
/**
 * Base Agent class.
 * @class
 */
class Agent {
    #id;
    #model;
    #systemPrompt;
    #temperature;
    #project;
    #history = [];
    #substriptions = [];

    /**
     * Erstellt einen neuen Agenten.
     * @param {string} id - Eindeutige Kennung des Agenten.
     * @param {Object} options - Konfigurationsoptionen.
     * @param {Object} options.model - Das Modell, das für die Verarbeitung verwendet wird (muss eine `call`-Methode implementieren).
     * @param {string} options.systemPrompt - System-Prompt des Agenten.
     * @param {number} options.temperature - Temperaturwert (falls numerisch).
     * @param {Object} options.project - Projektobjekt, das die Pub/Sub-Funktionalität bereitstellt.
     */    
    constructor(id, {model, systemPrompt, temperature, project}) {
        this.#id = id;
        this.#model = model;
        this.#systemPrompt = systemPrompt;
        this.#temperature = temperature;
        this.#project = project;

        this.#project.subscribe('message', (data) => {
            if (data.sender === this) return;
            this.listen(data.message);
        });
    }

    subscribe(Agent) {
        this.#substriptions.push(Agent);
    }
    unsubscribe(Agent) {
        this.#substriptions = this.substriptions.filter(sub => sub !== Agent);
    }


    get model() {
        return this.#model;
    }

    get systemPrompt() {
        return this.#systemPrompt;
    }

    async think(message) {
        const data = {role: 'user', content: message, timestamp: new Date()};
        this.#history.push(data);
        const answer = await this.#model.call(this.#history);
        return {role: 'agent', content: answer, timestamp: new Date()};
    }

    async talkTo(agent, message) {
        return await agent.listen(message);
    }

    // @Description: Post a open message, that every subscribed agent can listen to
    post(message) {
        this.#project.trigger('message', {message, sender: this});
    }
    
}
