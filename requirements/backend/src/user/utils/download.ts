import axios from "axios";
import { createWriteStream } from "fs";

const download = (url: string, path: string) => {

    const writer = createWriteStream(path);

    return new Promise<boolean>((resolve, reject) => {
        axios.get(url, { responseType: 'stream' })
        .then(response => {
            response.data.pipe(writer);
            writer.on('error', () => {resolve(false)});
            writer.on('finish', () => {resolve(true)});
        })
        .catch(() => {
            resolve(false);
        })
    });
};

export default download;
