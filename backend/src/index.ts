import { EventFunction } from "@google-cloud/functions-framework";
import { Storage } from "@google-cloud/storage";

const storage = new Storage();
const BUCKET_NAME = process.env.BUCKET_NAME as string;

export const event: EventFunction = (event, context) => {
  // upload hello world text file to the bucket
  const file = storage.bucket(BUCKET_NAME).file("hello-world.txt");
  file.save("Hello World!");
};
