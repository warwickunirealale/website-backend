import nodemailer from 'nodemailer';
interface Settings {
    defaultFrom: string;
    defaultReplyTo: string;
}
interface SendOptions {
    from?: string;
    to: string;
    cc: string;
    bcc: string;
    replyTo?: string;
    subject: string;
    text: string;
    html: string;
    [key: string]: unknown;
}
type ProviderOptions = Parameters<typeof nodemailer.createTransport>[0];
declare const _default: {
    provider: string;
    name: string;
    init(providerOptions: ProviderOptions, settings: Settings): {
        send(options: SendOptions): Promise<unknown>;
    };
};
export default _default;
//# sourceMappingURL=index.d.ts.map