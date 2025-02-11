
/**
 * Base Agent class.
 * @class
 */
export class Agent {
    #id;
    #model;
    #systemPrompt;
    #temperature;
    #project;
    #history = [];
    #substriptions = [];

    /** 
     * Creates a new Agent.
     * @param {string} id - Unique identifier of the Agent.
     * @param {Object} options - Configuration options.
     * @param {Object} options.model - The model used for processing (must implement a `call` method).
     * @param {string} options.systemPrompt - System-Prompt of the Agent.
     * @param {number} options.temperature - Temperature value (if numeric).
     * @param {Object} options.project - Project object, providing Pub/Sub functionality.
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
        this.#substriptions = this.#substriptions.filter(sub => sub !== Agent);
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
        const answer = await this.#model.call(this.#history, this.#temperature);
        return {role: 'agent', content: answer, timestamp: new Date()};
    }

    async talkTo(agent, message) {
        return await agent.listen(message);
    }

    // @Description: Post a open message, that every subscribed agent can listen to
    post(message) {
        this.#project.trigger('message', {message, sender: this});
    }
    async sleep() {
        // compress conversation
        this.#history.push({role: 'system', content: prompts.compress1, timestamp: new Date()});
        let answer = await this.think(answer.content);
        this.#history = [];
        this.#history.push({role: 'system', content: "was bisher geschah: " + answer.content, timestamp: new Date()});

        // denke über das bisherige nach
        this.#history.push({role: 'system', content: prompts.reflect, timestamp: new Date()});
        answer = await this.think(answer.content);
        this.#history.push({role: 'system', content: prompts.filterReflections, timestamp: new Date()});
        answer = await this.think(answer.content);
        this.#history.push({role: 'system', content: "Überlegungen: " + answer.content, timestamp: new Date()});

    }
    
}


const prompts = {
    compress1: "Summarize this conversation as if recalling it one day later. Many details remain, but highlight the key insights.",
    compress2: "Summarize this conversation as if recalling it four days later. You still remember some details; focus on the central points.",
    compress3: "Summarize this conversation as if recalling it two weeks later. Only the essential insights remain.",
    compress4: "Summarize this conversation as if recalling it two months later. Many details have faded, so list only the core insights.",
    compress5: "Summarize this conversation as if recalling it one year later. You remember only the most important insights.",
    compress6: "Summarize this conversation as if recalling it four years later. After such a long time, only the fundamental insights remain.",
    reflect: "Reflect on the conversation so far: Consider all the discussed points, develop new ideas, find innovative solutions, explore alternative paths, and integrate existing approaches – as if you had slept on it.",
    filterReflections: "Filter the reflections: Discard any ideas that don't align with the original vision and generate a new, refined list.",

};

/*

schlaf todo:

Eingabephase:
– Erfasse alle relevanten Informationen und Ideen der Konversation.
– Erstelle zunächst eine grobe Zusammenfassung der Kernpunkte.

Inkubationsphase (simuliertes „Schlafen“):
– Lasse einen zeitlichen Abstand entstehen – entweder durch explizites „Pausieren“ oder durch Hinzufügen von zufälligem Rauschen, um spontane Assoziationen zu ermöglichen.
– Dies soll analog zur nächtlichen Gedächtniskonsolidierung wirken.

Konsolidierungsphase:
– Reflektiere die erfassten Informationen erneut.
– Erarbeite neue Verknüpfungen, indem du über den ursprünglichen Input hinaus denkst und innovative Lösungsansätze generierst.

Filtrationsphase:
– Vergleiche die neu entstandenen Ideen mit der ursprünglichen Vision.
– Verwerfe jene Ansätze, die nicht im Einklang mit den Kernzielen stehen, und hebe die relevanten hervor.

Integrationsphase:
– Fasse die verbleibenden, passenden Ideen zu einer strukturierten und kompakten Liste zusammen.
– Diese finale Liste repräsentiert dann die „geordneten Gedanken“, wie sie nach einer erholsamen Nacht reflektiert wurden.

*/