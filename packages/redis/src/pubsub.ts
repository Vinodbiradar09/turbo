import { getPubClient , getSubClient } from "./client";
type MessageHandler = ( message : any ) => void;

export class RedisPubSub {
    private pub = getPubClient();
    private sub = getSubClient();
    private handlers = new Map<string, MessageHandler>();

    constructor(){
        this.sub.on("message" , (channel , message)=>{
            const handler = this.handlers.get(channel);
            if(handler){
                handler(JSON.parse(message));
            }
        })
    }

    async publish( channel : string , message : any){
        await this.pub.publish(channel , JSON.stringify(message))
    }

    async subscribe(channel : string, handler : MessageHandler){
       if(this.handlers.has(channel)) return;
       this.handlers.set(channel , handler);
       await this.sub.subscribe(channel);
    }

    async unsubscribe( channel : string){
        if(!this.handlers.has(channel)) return;
        this.handlers.delete(channel);
        await this.sub.unsubscribe(channel);
    }
}


