import { UIMessage } from "ai";
import { BotMessage } from "./bot-message";

export const Messages = ({messages}:{messages: UIMessage[]}) => {
    return (
        <div className="flex flex-col stretch space-y-12">
            {messages.map((message) => {
                switch (message.role) {
                    case "user":
                        return <UserMessage key={message.id} message={message} />;
                    case "assistant":
                        return <AIResponseMessage key={message.id} message={message} />;
                    default:
                        return null;
                }
            })}
        </div>
    );
}


export const UserMessage = ({message}:{message: UIMessage}) => {
    return (
        <div key={message.id} className="whitespace-pre-wrap">
            {message.parts.map((part, i) => {
                switch (part.type) {
                    case "text":
                        return <div key={`${message.id}-${i}`} className="whitespace-pre-wrap bg-secondary text-secondary-foreground w-fit p-3 rounded-xl">{part.text}</div>;
                }
            })}
        </div>
    );
}


export const AIResponseMessage = ({ message }: { message: UIMessage }) => {
    return (
        <div key={message.id} className="">
            {message.parts.map((part, i) => {
                switch (part.type) {
                    case "text":
                        return <BotMessage 
                                key={`${message.id}-${i}`}
                                message={part.text}
                                />
                    default:
                        return;
                }
            })}
            {message.annotations && <>{JSON.stringify(message.annotations)}</>}
        </div>
    );
}