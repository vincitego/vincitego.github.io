import fs from 'fs';

const baseFolder = 'C:/Documents/Github/vincitego.github.io/assets/P/'

fs.readdir(baseFolder, (err, folders) => {
    folders.forEach(folder => {
        const files = fs.readdirSync(baseFolder + folder);

        if (fs.lstatSync(`${baseFolder}${folder}/${files[0]}`).isDirectory()) {
            files.forEach(folder2 => {
                processFolder(baseFolder, `${folder}/${folder2}`);
            })
        } else {
            processFolder(baseFolder, folder);
        }
    })
});


function processFolder(baseFolder, folder) {
    const files = fs.readdirSync(baseFolder + folder).sort();
    const folderKeywords = [];
    let priorKeyword = '';

    files.forEach((file, index) => {
        const keyword = file.startsWith('000') ? file.slice(7, -4) : file.slice(0, -11);

        if (keyword === priorKeyword) {
            folderKeywords.at(-1)[1] = index + 1;
        } else {
            folderKeywords.push([keyword, index + 1]);
        }

        priorKeyword = keyword;
    });

    const searchParams = new URLSearchParams();
    searchParams.append('url', '/assets/P/' + folder);
    searchParams.append('data', JSON.stringify(folderKeywords));
    console.log(`<div><a href="/webappTest/steg.html?${searchParams.toString()}">${folder}</a></div>`);
}