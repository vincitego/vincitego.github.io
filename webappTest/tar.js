const fileMode = new Uint8Array([48, 48, 48, 48, 55, 55, 55, 0]);
const ownerUserId = new Uint8Array([48, 48, 48, 48, 48, 48, 48, 0]);
const groupUserId = new Uint8Array([48, 48, 48, 48, 48, 48, 48, 0]);
const linkIndicator = new Uint8Array([48]);
const linkName = new Uint8Array(100).fill(0);
const blockFiller1 = new Uint8Array([117, 115, 116, 97, 114, 32, 32]);
const blockFiller2 = new Uint8Array(248).fill(0);
const partialChecksum = [...fileMode, ...ownerUserId, ...groupUserId, ...linkIndicator, ...linkName, ...blockFiller1, ...blockFiller2]
    .reduce((acc, val) => acc + val, 0);


class Tar {
    files = {};


    addFile(fileName, fileData) {
        if (fileName.length > 100) throw new RangeError('filename must be less than or equal to 100 characters.');
        if (fileName.length === 0) throw new RangeError('filename must be at least 1 character.');
        if (fileName in this.files) throw new Error(`Duplicate filename found "${fileName}"`);
        if (!(fileData instanceof Uint8Array)) throw new TypeError('fileData needs to be of an instance of Uint8Array');
        
        const textEncoder = new TextEncoder();
        const bytesTruncatedFileName = textEncoder.encode(fileName);
        if (bytesTruncatedFileName.byteLength > 100) throw new RangeError('filename must be less than or equal to 100 bytes.');

        this.files[fileName] = fileData;
    }


    removeFile(fileName) {
        if (fileName in this.files) {
            delete this.files[fileName];
        } else {
            throw new Error(`filename not found "${fileName}"`);
        }
    }


    createHeader(fileName, fileData) {
        const textEncoder = new TextEncoder();

        const bytesTruncatedFileName = textEncoder.encode(fileName).slice(0, 100);
        const bytesFilenameFiller = new Uint8Array(100 - bytesTruncatedFileName.byteLength).fill(0);

        const fileSize = fileData.byteLength.toString(8).padStart(11, '0');
        const bytesFileSize = textEncoder.encode(fileSize);

        const unixTimestamp = Math.floor((Date.now()) / 1000).toString(8).padStart(11, '0');
        const bytesUnixTimestamp = textEncoder.encode(unixTimestamp);

        const remainderChecksum = [...bytesTruncatedFileName, ...bytesFileSize, ...bytesUnixTimestamp]
            .reduce((acc, val) => acc + val, 0);
        const checkSum = (partialChecksum + remainderChecksum + 8*32).toString(8).padStart(6, '0');
        const bytesChecksum = textEncoder.encode(checkSum);

        const blob = new Blob([
            bytesTruncatedFileName, bytesFilenameFiller,
            fileMode, ownerUserId, groupUserId,
            bytesFileSize, new Uint8Array([0]),
            bytesUnixTimestamp, new Uint8Array([0]),
            bytesChecksum, new Uint8Array([0, 32]),
            linkIndicator, linkName, blockFiller1, blockFiller2
        ]);

        return blob;
    }


    toBlob() {
        const blobParts = [];

        for (const [fileName, fileData] of Object.entries(this.files)) {
            const fillerLength = fileData.byteLength % 512 ? 512 - fileData.byteLength % 512 : 0;
            const fillerData = new Uint8Array(fillerLength).fill(0);
            blobParts.push(this.createHeader(fileName, fileData));
            blobParts.push(fileData, fillerData);
        }

        return new Blob(blobParts, {type: 'application/x-tar'});
    }
}