import { S3Client, 
    PutObjectCommand,
    GetObjectCommand,
 } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const client = new S3Client({
    region: 'auto',
    endpoint: 'https://b896dff8e6d32ec4f22b55466f5794d6.r2.cloudflarestorage.com/',
    credentials: {
        accessKeyId: 'f493f95bd418cdcff096a14dfed08453',
        secretAccessKey: '5dc7741ecbc820149ea3aa0628844f101afc23722df41acc227656eb193d7678'
    }
});

const util = {
    r2Operation: {
        /**
         * input: {
         *   Bucket: bucket,
         *   Key: key,
         *   Body: body,
         *   ContentType: contentType
         * }
         * **/ 
        putObject: async function(input) {
            const putCommand = new PutObjectCommand(input);
            return await client.send(putCommand);
        },
        /**
         * input: {
         *   Bucket: bucket,
         *   Key: key
         * }
         * **/
        getObject: async function(input) {
            const command = new GetObjectCommand(input);
            return await client.send(command);
        },
        /**
         * input: {
         *   Bucket: bucket,
         *   Key: key,
         *   Expires: 60
         * }
         * **/
        getObjectUrl: async function(input) {
            const command = new GetObjectCommand(input);
            return await getSignedUrl(client, command, { expiresIn: input.Expires });
        },
    },
};

export default util;