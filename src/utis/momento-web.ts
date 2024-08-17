import {
  Configurations,
  CredentialProvider,
  TopicClient,
  type TopicItem,
  TopicSubscribe,
} from "@gomomento/sdk-web";

export enum EventTypes {
  MESSAGE = "message",
}

export type ChatMessageEvent = {
  event: EventTypes.MESSAGE;
  text: string;
  timestamp: number;
};

export type ChatEvent = ChatMessageEvent;

const webTopicClient: TopicClient | undefined = undefined;
let subscription: TopicSubscribe.Subscription | undefined = undefined;
let onItemCb: (item: TopicItem) => void;
let onErrorCb: (
  error: TopicSubscribe.Error,
  subscription: TopicSubscribe.Subscription,
) => Promise<void>;

type MomentoClients = {
  topicClient: TopicClient;
};

async function getNewWebClients(): Promise<MomentoClients> {
  const token = process.env.NEXT_PUBLIC_MOMENTO_AUTH_TOKEN || "";
  const topicClient = new TopicClient({
    configuration: Configurations.Browser.v1(),
    credentialProvider: CredentialProvider.fromString({
      authToken: token,
    }),
  });
  return {
    topicClient,
  };
}

async function getWebTopicClient(): Promise<TopicClient> {
  if (webTopicClient) {
    return webTopicClient;
  }

  const clients = await getNewWebClients();
  return clients.topicClient;
}

export async function subscribeToTopic(
  cacheName: string,
  topicName: string,
  onItem: (item: TopicItem) => void,
) {
  onItemCb = onItem;
  const topicClient = await getWebTopicClient();
  const resp = await topicClient.subscribe(cacheName, topicName, {
    onItem: onItemCb,
    onError: onErrorCb,
  });
  if (resp instanceof TopicSubscribe.Subscription) {
    subscription = resp;
    return subscription;
  }

  throw new Error(`unable to subscribe to topic: ${resp}`);
}
