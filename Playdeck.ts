export class Playdeck {
    static parent = window.parent.window;

    static loading(value: number) {
        this.__send("loading", {value});
    }

    static async showAd() {
        const method = "showAd";

        this.__send(method);

        const promises = [
            this.__handlerMessage("rewardedAd"),
            this.__handlerMessage("errAd"),
            this.__handlerMessage("skipAd"),
            this.__handlerMessage("notFoundAd")
        ];

        return ((await Promise.race(promises)) as any)?.done;
    }

    static async share() {
        const method = "customShare";

        this.__send(method, {value: {}});
    }

    static async getProfile() {
        const method = "getUserProfile";

        this.__send(method);

        return await this.__handlerMessage(method);
    }

    static async sendProgress(level: number, maxLevel?: number) {
        const method = "sendGameProgress";

        this.__send(method, {
            value: {
                progress: {
                    level: level,
                    isLastLevel: maxLevel === level
                }
            }
        });
    }

    static async requestPayment(
        description: string,
        amount: number,
        externalId: string
    ): Promise<{status: string}> {
        const method = "requestPayment";

        this.__send(method, {
            value: {
                amount,
                description,
                externalId
            }
        });

        const url = (await this.__handlerMessage(method)) as string;
        this.openLink(url);

        return await this.__handlerMessage("invoiceClosed");
    }

    static openLink(link: string) {
        this.__send("openTelegramLink", {value: link});
    }

    static async setData(key: string, value: string) {
        const method = "setData";

        this.__send(method, {key, value});
    }

    static async getData(key: string) {
        const method = "getData";

        this.__send(method, {key});

        const data = (await this.__handlerMessage(method))?.data ?? null;

        return data;
    }

    static async __handlerMessage(method: string) {
        return new Promise(resolve => {
            const handlerMessage = ({data}: {[key: string]: any}) => {
                const pdData = data?.playdeck;
                if (!pdData) return;

                if (pdData.method === method) {
                    console.log("handler:", pdData);
                    window.removeEventListener("message", handlerMessage);

                    if (method === "rewardedAd") {
                        resolve({done: true});
                    } else {
                        resolve(pdData.value);
                    }
                }
            };

            window.addEventListener("message", handlerMessage);
        });
    }

    static __send(method: string, variables: {[key: string]: any} = {}) {
        console.log(`PLAYDECK: method: ${method}; variables:`, variables);

        this.parent.postMessage({playdeck: {method, ...variables}}, "*");
    }
}
